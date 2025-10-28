import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/tables';

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

export default db;
