import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './tables';
import { env } from '../env';

// Create PostgreSQL connection
const client = postgres(env.DATABASE_URL);

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

export default db;
