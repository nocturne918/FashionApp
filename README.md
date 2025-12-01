# Fitted
A fashion app for CEN3031

## Tech Stack

- **Monorepo**: pnpm workspaces + Turbo
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: OAuth 2.0 (Google, Facebook) + JWT

## Project Structure

```
apps/
  ├── api/
  ├── web/
  └── shared/
```

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm (`corepack enable`)

### Environment Setup

1. **Database**: Ensure PostgreSQL is running.
   ```bash
   # Quick local setup with Docker
   docker run --name fashion-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fashionapp -p 5432:5432 -d postgres
   ```

2. **Configuration**:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

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

# Add dependencies (examples)
pnpm --filter api add express
pnpm --filter web add axios

# Database commands
pnpm --filter api db:push      # Push schema to DB
pnpm --filter api db:studio    # Visual DB editor
```