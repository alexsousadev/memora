import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async registerOptions(req: Request, res: Response) {
    const { username } = req.body;
    try {
      const options = await authService.getRegistrationOptions(username);
      res.json(options);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate registration options' });
    }
  }

  async verifyRegister(req: Request, res: Response) {
    const { username } = req.body; 
    try {
      const result = await authService.verifyRegistration(username, req.body);
      res.json(result);
    } catch (error) {
        console.error(error);
      res.status(400).json({ error: 'Verification failed' });
    }
  }

  async loginOptions(req: Request, res: Response) {
    const { username } = req.body;
    try {
      const options = await authService.getAuthenticationOptions(username);
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate login options' });
    }
  }

  async verifyLogin(req: Request, res: Response) {
    const { username } = req.body;
    try {
      const result = await authService.verifyAuthentication(username, req.body);
      res.json(result);
    } catch (error) {
        console.error(error);
      res.status(400).json({ error: 'Verification failed' });
    }
  }
}
