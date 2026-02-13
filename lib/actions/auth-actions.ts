"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  if (email !== env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/login?error=unauthorized");
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
      asResponse: true,
    });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/login?error=${error.status}`);
    }
    redirect("/login?error=invalid_credentials");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
    asResponse: true,
  });

  redirect("/login");
}

type SocialProvider = "google" | "github";

async function signInSocialAction(provider: SocialProvider) {
  const callbackURL = `${env.BETTER_AUTH_URL}/dashboard`;

  try {
    const response = await auth.api.signInSocial({
      body: {
        provider,
        callbackURL,
      },
      headers: await headers(),
      asResponse: true,
    });

    const location = response.headers.get("location");
    if (location) {
      redirect(location);
    }

    const payload = (await response.json()) as { url?: string };
    if (payload.url) {
      redirect(payload.url);
    }
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/login?error=${error.status}`);
    }
  }

  redirect("/login?error=social_sign_in_failed");
}

export async function signInWithGoogleAction() {
  await signInSocialAction("google");
}

export async function signInWithGithubAction() {
  await signInSocialAction("github");
}
