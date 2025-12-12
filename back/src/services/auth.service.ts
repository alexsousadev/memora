import { server } from '@passwordless-id/webauthn';
import { db } from '../database/db';
import { users, authenticators } from '../database/schema';
import { eq } from 'drizzle-orm';

const origin = process.env.ORIGIN || 'http://localhost:3000';

export class AuthService {
  static pendingChallenges = new Set<string>();

  async getRegistrationOptions(username: string) {
    let user = await db.query.users.findFirst({
      where: eq(users.email, username),
    });

    if (!user) {
        const [newUser] = await db.insert(users).values({
            email: username, 
            firstName: username,
            lastName: 'User',
            password: 'placeholder_password', 
        }).returning();
        user = newUser;
    }

    const challenge = crypto.randomUUID();

    await db.update(users)
      .set({ currentChallenge: challenge })
      .where(eq(users.id, user.id));

    return {
        challenge,
        user: user.email,
    };
  }

  async verifyRegistration(username: string, body: any) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, username),
    });

    if (!user || !user.currentChallenge) {
      throw new Error('User or challenge not found');
    }

    const expected = {
        challenge: user.currentChallenge,
        origin: origin,
    };

    let verification;
    try {
      verification = await server.verifyRegistration(body, expected);
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (verification) {
      const { credential, authenticator } = verification;
      await db.insert(authenticators).values({
        userId: user.id,
        credentialID: credential.id,
        credentialPublicKey: credential.publicKey,
        counter: Number(authenticator.counter),
        transports: JSON.stringify(credential.transports || []),
        algorithm: credential.algorithm,
      });

      await db.update(users).set({ currentChallenge: null }).where(eq(users.id, user.id));

      return { verified: true };
    }

    return { verified: false };
  }

  async getAuthenticationOptions(username?: string) {
    const challenge = crypto.randomUUID();
    
    if (username) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, username),
        });
        if (user) {
            await db.update(users)
                .set({ currentChallenge: challenge })
                .where(eq(users.id, user.id));
        }
    }
    
    AuthService.pendingChallenges.add(challenge);
    setTimeout(() => AuthService.pendingChallenges.delete(challenge), 60000);

    return { challenge };
  }

  async verifyAuthentication(username: string | undefined, body: any) {
    const credentialId = body.id;
    
    const authenticator = await db.query.authenticators.findFirst({
        where: eq(authenticators.credentialID, credentialId),
        with: {
            user: true
        }
    });

    if (!authenticator || !authenticator.user) {
        throw new Error('Authenticator not found');
    }

    const user = authenticator.user;
    let expectedChallenge = user.currentChallenge;

    if (!expectedChallenge) {
         const clientDataJSON = body.response.clientDataJSON;
         const base64 = clientDataJSON.replace(/-/g, '+').replace(/_/g, '/');
         const clientData = JSON.parse(Buffer.from(base64, 'base64').toString());
         
         if (AuthService.pendingChallenges.has(clientData.challenge)) {
             expectedChallenge = clientData.challenge;
             AuthService.pendingChallenges.delete(expectedChallenge as string);
         } else {
             throw new Error('Challenge invalid');
         }
    }

    const expected = {
        challenge: expectedChallenge as string,
        origin: origin,
        userVerified: true, // or false depending on requirement
        counter: Number(authenticator.counter),
    };

    const credentialKey = {
        id: authenticator.credentialID,
        publicKey: authenticator.credentialPublicKey,
        algorithm: authenticator.algorithm || 'ES256', 
    }

    let verification;
    try {
        verification = await server.verifyAuthentication(body, credentialKey as any, {
            ...expected,
            challenge: expected.challenge as string, // Ensure challenge is string
        });
    } catch (error) {
        console.error(error);
        throw error;
    }

    if (verification) {
        // @passwordless-id/webauthn returns counter at root (AuthenticationInfo.counter)
        await db.update(authenticators)
            .set({ counter: Number(verification.counter) })
            .where(eq(authenticators.credentialID, authenticator.credentialID));
        
        await db.update(users).set({ currentChallenge: null }).where(eq(users.id, user.id));

        return { verified: true, user };
    }

    return { verified: false };
  }
}
