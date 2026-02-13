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

type Env = Record<RequiredEnvKey, string>;

function readEnv(): Env {
  const values = {} as Env;

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required env variable: ${key}`);
    }
    values[key] = value;
  }

  return values;
}

export const env = readEnv();
