import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { reminders } from "./reminder";

import { authenticators } from "./authenticators";

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull(),
  currentChallenge: varchar('current_challenge'),
})

export const usersRelations = relations(users, ({ many }) => ({
  reminders: many(reminders),
  authenticators: many(authenticators),
}))
