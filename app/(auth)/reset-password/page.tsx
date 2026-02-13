import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentSession } from "@/lib/auth/session";
import { resetPasswordAction } from "@/lib/actions/auth-actions";
import { env } from "@/lib/env";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (!error) {
    return "";
  }

  if (error === "missing_fields") {
    return "All fields are required.";
  }

  if (error === "password_mismatch") {
    return "Passwords do not match.";
  }

  if (error === "invalid_token" || error === "BAD_REQUEST") {
    return "Invalid or expired reset token.";
  }

  return "Failed to reset password.";
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const session = await getCurrentSession();
  if (session?.user?.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/dashboard");
  }

  const resolved = await searchParams;
  const token = resolved?.token || "";
  const errorMessage = getErrorMessage(resolved?.error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Set a new password for your admin account.</p>
        </div>

        <form action={resetPasswordAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="New Password"
            required
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm New Password"
            required
          />

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <Button type="submit" className="w-full" disabled={!token}>
            Reset Password
          </Button>
        </form>

        <Link href="/login" className="block text-center text-sm text-muted-foreground underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </main>
  );
}
