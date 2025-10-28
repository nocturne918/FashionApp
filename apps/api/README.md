# Backend with Drizzle ORM

## Structure

```
apps/api/
├── src/
│   ├── db/
│   │   └── tables.ts      # TypeScript schema (users, accounts, outfits)
│   ├── db.ts              # Drizzle client instance
│   ├── auth.ts            # Passport OAuth strategies
│   └── index.ts           # Express app with auth routes
├── drizzle.config.ts      # Drizzle Kit configuration
└── .env.example           # Environment variables
```

## Why Drizzle?

- ✅ **TypeScript-first** - Schema defined in `.ts` not weird DSL
- ✅ **Type-safe** - Full TypeScript inference, no code generation needed
- ✅ **Lightweight** - Smaller bundle, faster than Prisma
- ✅ **SQL-like** - Feels like writing SQL with TypeScript safety
- ✅ **Relational queries** - Easy joins and relations

## Database Schema

All defined in `src/db/tables.ts`:

### Users
```ts
users {
  id, email, name, avatar, createdAt, updatedAt
}
```

### Accounts (OAuth)
```ts
accounts {
  id, userId, provider, providerAccountId,
  accessToken, refreshToken, expiresAt, ...
}
```

### Outfits
```ts
outfits {
  id, userId, title, description, imageUrl, 
  isPublic, createdAt, updatedAt
}
```

## Setup

### 1. Database

Same as before - use Supabase, local PostgreSQL, or Render.

### 2. Environment

```bash
cp .env.example .env
```

Set `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fashionapp"
```

### 3. Push Schema to Database

```bash
# Push schema without migrations (dev)
pnpm --filter api db:push

# Or generate migration files (recommended)
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

### 4. Start Dev Server

```bash
pnpm dev
```

## Database Commands

```bash
# Push schema changes (no migration files)
pnpm --filter api db:push

# Generate migration from schema
pnpm --filter api db:generate

# Run migrations
pnpm --filter api db:migrate

# Open Drizzle Studio (visual DB editor)
pnpm --filter api db:studio
```

## Usage Examples

### Insert User
```ts
import { db } from './db';
import { users } from './db/tables';

const [user] = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
}).returning();
```

### Query with Relations
```ts
import { eq } from 'drizzle-orm';

const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
  with: {
    accounts: true,
    outfits: true,
  },
});
```

### Update
```ts
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, userId));
```

### Delete
```ts
await db.delete(outfits)
  .where(eq(outfits.id, outfitId));
```

## Auth Flow (Same as Before)

1. User clicks "Sign in with Google"
2. Redirects to `/api/auth/google`
3. Google OAuth callback to `/api/auth/callback/google`
4. Drizzle creates/finds User and Account
5. JWT generated and sent to frontend

## Next Steps

- [ ] Set up OAuth credentials (Google/Facebook)
- [ ] Run `db:push` to create tables
- [ ] Test auth flow
- [ ] Add protected routes with JWT middleware
- [ ] Build outfit CRUD endpoints
