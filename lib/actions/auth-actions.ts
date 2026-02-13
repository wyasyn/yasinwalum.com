"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackURL = `${env.BETTER_AUTH_URL}/login?verified=1`;

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
        callbackURL,
      },
      headers: await headers(),
      asResponse: true,
    });
  } catch (error) {
    if (error instanceof APIError) {
      const status = String(error.status);
      const message = String(error.message ?? "").toLowerCase();

      if (
        status === "FORBIDDEN" ||
        status === "403" ||
        message.includes("email_not_verified") ||
        message.includes("email not verified")
      ) {
        redirect(`/login?error=email_not_verified&email=${encodeURIComponent(email)}`);
      }
      redirect(`/login?error=${encodeURIComponent(status)}`);
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
  let result: { url?: string; redirect?: boolean } | null = null;

  try {
    result = await auth.api.signInSocial({
      body: {
        provider,
        callbackURL,
        disableRedirect: true,
      },
      headers: await headers(),
    });

  } catch (error) {
    if (error instanceof APIError) {
      const status = String(error.status);
      const message = String(error.message ?? "").toLowerCase();

      if (
        message.includes("account_not_linked") ||
        message.includes("account not linked") ||
        message.includes("signup disabled")
      ) {
        redirect(`/login?error=social_account_not_linked&provider=${provider}`);
      }

      redirect(`/login?error=${encodeURIComponent(status)}&provider=${provider}`);
    }

    redirect(`/login?error=social_unexpected_error&provider=${provider}`);
  }

  if (result?.url) {
    redirect(result.url);
  }

  redirect(`/login?error=social_redirect_missing&provider=${provider}`);
}

export async function signInWithGoogleAction() {
  await signInSocialAction("google");
}

export async function signInWithGithubAction() {
  await signInSocialAction("github");
}

export async function resendVerificationEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const callbackURL = `${env.BETTER_AUTH_URL}/login?verified=1`;

  if (!email || email !== env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/login?error=unauthorized");
  }

  try {
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/login?error=${error.status}`);
    }
    redirect("/login?error=verification_send_failed");
  }

  redirect(`/login?email=${encodeURIComponent(email)}&verification_sent=1`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=missing_email");
  }

  if (email !== env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/forgot-password?sent=1");
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${env.BETTER_AUTH_URL}/reset-password`,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/forgot-password?error=${error.status}`);
    }
    redirect("/forgot-password?error=reset_request_failed");
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    redirect("/reset-password?error=invalid_token");
  }

  if (!newPassword || !confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=missing_fields`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=password_mismatch`);
  }

  try {
    await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${error.status}`);
    }
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=reset_failed`);
  }

  redirect("/login?reset=1");
}
