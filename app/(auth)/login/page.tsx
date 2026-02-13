import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, GoogleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getCurrentSession } from "@/lib/auth/session";
import {
  loginAction,
  resendVerificationEmailAction,
  signInWithGithubAction,
  signInWithGoogleAction,
} from "@/lib/actions/auth-actions";
import { env } from "@/lib/env";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    email?: string;
    verified?: string;
    reset?: string;
    verification_sent?: string;
  }>;
};

function getErrorMessage(error?: string, email?: string) {
  if (!error) {
    return "";
  }

  if (error === "missing_fields") {
    return "Email and password are required.";
  }

  if (error === "unauthorized") {
    return "Only the configured admin account can access this dashboard.";
  }

  if (error === "email_not_verified" || error === "FORBIDDEN") {
    const address = email || "your email";
    return `Email is not verified. Check ${address} for a verification link.`;
  }

  if (error === "403" || error === "BAD_REQUEST") {
    const address = email || "your email";
    return `Check ${address} for a verification link before signing in.`;
  }

  if (error === "INVALID_EMAIL_OR_PASSWORD" || error === "UNAUTHORIZED") {
    return "Invalid email or password.";
  }

  if (error === "social_account_not_linked") {
    return "Social account is not linked to your admin user yet. Sign in with email/password first.";
  }

  if (error === "social_sign_in_failed" || error === "social_redirect_missing") {
    return "Social sign-in failed. Check provider setup and linked account status.";
  }

  if (error === "social_unexpected_error") {
    return "Social sign-in failed unexpectedly. Try again and check server logs.";
  }

  return "Sign in failed. Check your credentials and try again.";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentSession();

  if (session?.user?.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const loginEmail = resolvedSearchParams?.email || env.ADMIN_EMAIL;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error, loginEmail);
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const githubEnabled = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center p-4 lg:p-8">
      <div className="grid w-full overflow-hidden rounded-2xl border bg-card lg:min-h-[760px] lg:grid-cols-2">
        <section
          className="relative min-h-[280px] bg-cover bg-center p-6 lg:min-h-full lg:p-8"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgb(0 0 0 / 18%) 0%, rgb(0 0 0 / 62%) 100%), url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=80')",
          }}
        >
          <div className="flex items-center gap-3 text-sm font-medium text-white">
            <span className="grid size-8 place-items-center rounded-full bg-white/95 text-foreground">Y</span>
            <span>Yasin Portfolio</span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8">
            <h2 className="text-3xl font-semibold tracking-tight text-white">Show your best work professionally</h2>
            <p className="mt-3 text-sm text-white/90">
              Manage projects, skills, and markdown posts from one secure dashboard.
            </p>
          </div>
        </section>
        <section className="flex w-full flex-col justify-center p-6 lg:p-8">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your portfolio dashboard.</p>
            </div>

            <form action={loginAction} className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your Email"
                defaultValue={loginEmail}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                required
              />

              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
              {resolvedSearchParams?.verified === "1" ? (
                <p className="text-sm text-emerald-600">Email verified successfully. You can now sign in.</p>
              ) : null}
              {resolvedSearchParams?.reset === "1" ? (
                <p className="text-sm text-emerald-600">Password reset completed. Sign in with your new password.</p>
              ) : null}
              {resolvedSearchParams?.verification_sent === "1" ? (
                <p className="text-sm text-emerald-600">Verification email sent. Check your inbox.</p>
              ) : null}

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-muted-foreground underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>

            {resolvedSearchParams?.error === "email_not_verified" || resolvedSearchParams?.error === "FORBIDDEN" ? (
              <form action={resendVerificationEmailAction}>
                <input type="hidden" name="email" value={loginEmail} />
                <Button type="submit" variant="outline" className="w-full">
                  Resend Verification Email
                </Button>
              </form>
            ) : null}

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                instant login
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {googleEnabled ? (
                <form action={signInWithGoogleAction}>
                  <Button type="submit" variant="outline" className="h-11 w-full">
                    <HugeiconsIcon icon={GoogleIcon} strokeWidth={2} className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </form>
              ) : (
                <Button variant="outline" disabled className="h-11 w-full">
                  <HugeiconsIcon icon={GoogleIcon} strokeWidth={2} className="mr-2 h-4 w-4" />
                  Google Not Configured
                </Button>
              )}
              {githubEnabled ? (
                <form action={signInWithGithubAction}>
                  <Button type="submit" variant="outline" className="h-11 w-full">
                    <HugeiconsIcon icon={GithubIcon} strokeWidth={2} className="mr-2 h-4 w-4" />
                    Continue with GitHub
                  </Button>
                </form>
              ) : (
                <Button variant="outline" disabled className="h-11 w-full">
                  <HugeiconsIcon icon={GithubIcon} strokeWidth={2} className="mr-2 h-4 w-4" />
                  GitHub Not Configured
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
