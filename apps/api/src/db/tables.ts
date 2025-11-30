import { pgTable, text, timestamp, boolean, integer, varchar, json, real, unique } from 'drizzle-orm/pg-core';
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
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Outfit Items table (Junction table for Outfits <-> Products)
export const outfitItems = pgTable('outfit_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  outfitId: text('outfit_id').notNull().references(() => outfits.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  slot: text('slot').notNull(), // e.g., 'top', 'bottom', 'footwear', 'accessory'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.outfitId, t.slot), // One item per slot
}));

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  stockxId: text('stockx_id').unique().notNull(),
  title: text('title').notNull(),
  brand: text('brand'),
  category: text('category'),
  imageUrl: text('image_url'),
  frontImageUrl: text('front_image_url'),
  urlKey: text('url_key'),
  lowestAsk: integer('lowest_ask'),
  description: text('description'),
  parentCategory: text('parent_category'),
  gender: text('gender'),
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

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  user: one(users, {
    fields: [outfits.userId],
    references: [users.id],
  }),
  items: many(outfitItems),
}));

export const outfitItemsRelations = relations(outfitItems, ({ one }) => ({
  outfit: one(outfits, {
    fields: [outfitItems.outfitId],
    references: [outfits.id],
  }),
  product: one(products, {
    fields: [outfitItems.productId],
    references: [products.id],
  }),
}));
