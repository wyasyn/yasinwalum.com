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
  | "GITHUB_CLIENT_SECRET";

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

  return values;
}

export const env = readEnv();
