import { boolean, integer, pgTable, text, varchar, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const authenticators = pgTable('authenticators', {
  credentialID: text('credential_id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  credentialPublicKey: text('credential_public_key').notNull(),
  counter: bigint('counter', { mode: 'number' }).notNull(),
  transports: varchar('transports', { length: 255 }),
  algorithm: varchar('algorithm', { length: 50 }).default('ES256').notNull(),
});

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));
