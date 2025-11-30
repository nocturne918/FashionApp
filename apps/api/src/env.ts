import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

const possiblePaths = [
  path.resolve(process.cwd(), 'apps/api/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
];

const envPath = possiblePaths.find(p => existsSync(p));

if (!envPath) {
  throw new Error(`.env file not found. Tried: ${possiblePaths.join(', ')}`);
}

// Load environment variables from .env file
dotenv.config({ path: envPath });
console.log(`Loaded .env from: ${envPath}`);

// Export environment variables with type safety
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // OAuth - Google
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // OAuth - Facebook
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',

  // Auth
  CALLBACK_URL: process.env.CALLBACK_URL || 'http://localhost:3000/api/auth/callback',
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-me',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret-change-me',

  // App
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Email
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',

  STOCKX_COOKIE: process.env.STOCKX_COOKIE || '',
} as const;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'] as const;

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Log which OAuth providers are configured
console.log('🔧 Environment loaded:');
console.log('  - Database:', env.DATABASE_URL ? '✓' : '✗');
console.log('  - Google OAuth:', env.GOOGLE_CLIENT_ID ? '✓' : '✗');
console.log('  - Facebook OAuth:', env.FACEBOOK_APP_ID ? '✓' : '✗');
