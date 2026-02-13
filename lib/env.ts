const required = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "ADMIN_EMAIL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

type RequiredEnvKey = (typeof required)[number];

type OptionalEnvKey =
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
  | "RESEND_API_KEY"
  | "EMAIL_FROM"
  | "APP_NAME";

type Env = Record<RequiredEnvKey, string> & Partial<Record<OptionalEnvKey, string>>;

function readEnv(): Env {
  const values = {} as Env;

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required env variable: ${key}`);
    }
    values[key] = value;
  }

  values.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  values.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  values.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  values.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  values.RESEND_API_KEY = process.env.RESEND_API_KEY;
  values.EMAIL_FROM = process.env.EMAIL_FROM;
  values.APP_NAME = process.env.APP_NAME;

  return values;
}

export const env = readEnv();
