import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/lib/db";
import { buildResetPasswordEmail, buildVerificationEmail, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          disableImplicitSignUp: true,
        },
      }
    : {}),
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          disableImplicitSignUp: true,
        },
      }
    : {}),
};

export const auth = betterAuth({
  appName: "Yasin Portfolio Dashboard",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  plugins: [nextCookies()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: false,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const content = buildResetPasswordEmail(url);
      await sendEmail({
        to: user.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });
    },
  },
  emailVerification: {
    expiresIn: 60 * 30,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      const content = buildVerificationEmail(url);
      await sendEmail({
        to: user.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });
    },
  },
  socialProviders,
});
