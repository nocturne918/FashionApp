import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import { env } from "./env";
import { sendVerificationEmail } from "./utils";
import * as schema from "./db/tables";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    async sendVerificationEmail({ user, url, token }: { user: any, url: string, token: string }, request: any) {
      await sendVerificationEmail(user.email, token);
    },
  },
  socialProviders: {
    google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    } : undefined,
    facebook: env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET ? {
      clientId: env.FACEBOOK_APP_ID,
      clientSecret: env.FACEBOOK_APP_SECRET,
    } : undefined,
  },
  trustedOrigins: [env.FRONTEND_URL],
});
