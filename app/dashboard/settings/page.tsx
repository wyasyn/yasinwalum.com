import { HugeiconsIcon } from "@hugeicons/react";
import { requireAdminSession } from "@/lib/auth/session";
import {
  CheckmarkCircle01Icon,
  CodeIcon,
  File01Icon,
  FolderIcon,
  LayoutIcon,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth-actions";
import { env } from "@/lib/env";

export default async function DashboardSettingsPage() {
  await requireAdminSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Operational controls, security posture, and dashboard workflow guidance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="h-4 w-4" />
              Access Mode
            </CardTitle>
            <CardDescription>Authentication and signup policy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-300">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="h-4 w-4" />
              Admin-only access enabled
            </p>
            <p className="text-muted-foreground">
              Credential and social login are both restricted to authorized admin identity.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="h-4 w-4" />
              Admin Email
            </CardTitle>
            <CardDescription>Account currently allowed to manage dashboard data.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="rounded-md border bg-muted/50 px-3 py-2 font-medium break-all">{env.ADMIN_EMAIL}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="h-4 w-4" />
              Signup Policy
            </CardTitle>
            <CardDescription>How account creation is handled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="inline-flex rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-300">
              Open signup disabled
            </p>
            <p className="text-muted-foreground">Seeded admin account controls access.</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} className="h-4 w-4" />
              Session
            </CardTitle>
            <CardDescription>End current authenticated session.</CardDescription>
          </CardHeader>
          <CardContent>
            <form data-local-first="off" action={logoutAction}>
              <Button variant="outline" type="submit" className="w-full justify-start">
                <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={LayoutIcon} strokeWidth={2} className="h-4 w-4" />
            Workflow Checklist
          </CardTitle>
          <CardDescription>Suggested order for operating the portfolio dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={CodeIcon} strokeWidth={2} className="h-4 w-4" />
              Step 1
            </p>
            <p className="text-muted-foreground">Run migrations and seed admin/content data.</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={FolderIcon} strokeWidth={2} className="h-4 w-4" />
              Step 2
            </p>
            <p className="text-muted-foreground">Maintain profile, skills, projects, posts, and socials.</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="h-4 w-4" />
              Step 3
            </p>
            <p className="text-muted-foreground">Publish and verify public portfolio pages and links.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
