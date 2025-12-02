-- Add account lockout columns for better-auth
ALTER TABLE "account" ADD COLUMN "failed_attempts" integer DEFAULT 0;
ALTER TABLE "account" ADD COLUMN "locked" boolean DEFAULT false;
ALTER TABLE "account" ADD COLUMN "locked_at" timestamp;
