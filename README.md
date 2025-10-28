# FashionApp
CEN3031 Project

A fashion app that helps users create outfits, not merely shop for singular items, and collaborate/share with friends.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turbo
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: OAuth 2.0 (Google, Facebook) + JWT

## Project Structure

```
apps/
  ├── api/             # Express backend
  │   ├── src/
  │   │   ├── db/
  │   │   │   └── tables.ts    # Drizzle schema
  │   │   ├── auth.ts          # OAuth strategies
  │   │   └── index.ts         # Express app
  │   └── README.md
  ├── web/             # React frontend (Vite)
  │   └── src/
  └── shared/          # Shared types
```

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm (`corepack enable`)

### Install
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

Starts both API (http://localhost:3000) and Web (http://localhost:5173) servers.

### Build
```bash
pnpm build
```

## Development Commands

```bash
# Run specific app
pnpm --filter api dev
pnpm --filter web dev

# Add dependencies
pnpm --filter api add express
pnpm --filter web add axios

# Database commands
pnpm --filter api db:push      # Push schema to DB
pnpm --filter api db:studio    # Visual DB editor
```