import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "../lib/db";

const baseURL = process.env.BETTER_AUTH_URL;
const secret = process.env.BETTER_AUTH_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!baseURL || !secret || !adminEmail || !adminPassword) {
  throw new Error(
    "BETTER_AUTH_URL, BETTER_AUTH_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD are required for seeding.",
  );
}

const ensuredAdminEmail = adminEmail;
const ensuredAdminPassword = adminPassword;

const seedAuth = betterAuth({
  appName: "Yasin Portfolio Dashboard",
  baseURL,
  secret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: false,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
});

async function run() {
  try {
    await seedAuth.api.signUpEmail({
      body: {
        name: "Admin",
        email: ensuredAdminEmail,
        password: ensuredAdminPassword,
      },
    });

    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Admin seed failed. If user exists, this is expected.");
    console.error(error);
  }
}

void run();
