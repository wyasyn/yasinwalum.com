import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentSession } from "@/lib/auth/session";
import { requestPasswordResetAction } from "@/lib/actions/auth-actions";
import { env } from "@/lib/env";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    sent?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (!error) {
    return "";
  }

  if (error === "missing_email") {
    return "Email is required.";
  }

  return "Failed to send reset link. Try again.";
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const session = await getCurrentSession();
  if (session?.user?.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/dashboard");
  }

  const resolved = await searchParams;
  const errorMessage = getErrorMessage(resolved?.error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">Enter your admin email to receive a reset link.</p>
        </div>

        <form action={requestPasswordResetAction} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your Email"
            defaultValue={env.ADMIN_EMAIL}
            required
          />

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          {resolved?.sent === "1" ? (
            <p className="text-sm text-emerald-600">If this email exists, a reset link has been sent.</p>
          ) : null}

          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>

        <Link href="/login" className="block text-center text-sm text-muted-foreground underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </main>
  );
}
