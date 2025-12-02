import { pgTable, text, timestamp, boolean, integer, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Better Auth)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Sessions table (Better Auth)
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id),
});

// Accounts table (Better Auth)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Verification table (Better Auth)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Outfits table
export const outfits = pgTable('outfits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
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
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  outfits: many(outfits),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  user: one(user, {
    fields: [outfits.userId],
    references: [user.id],
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
