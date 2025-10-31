import { pgTable, text, timestamp, boolean, integer, varchar, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (id is UUID, email is unique for login)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  passwordHash: text('password_hash'), // nullable for OAuth-only users
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pending verifications for email signup
export const pendingVerifications = pgTable('pending_verifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  code: text('code').notNull(), // 6-digit code
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  // createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull(),
});

// OAuth Accounts table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google' or 'facebook'
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Outfits table
export const outfits = pgTable('outfits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  outfits: many(outfits),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const outfitsRelations = relations(outfits, ({ one }) => ({
  user: one(users, {
    fields: [outfits.userId],
    references: [users.id],
  }),
}));
