import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth-actions";
import { env } from "@/lib/env";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Operational and admin-only controls.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>This dashboard is locked to one admin account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Admin Email: <span className="font-medium">{env.ADMIN_EMAIL}</span>
          </p>
          <p className="text-muted-foreground">
            Signup is disabled. Only the seeded admin user can sign in.
          </p>
          <form data-local-first="off" action={logoutAction}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>1. Run database migration and seed admin account.</p>
          <p>2. Fill profile, skills, projects, posts, and socials.</p>
          <p>3. Build the public-facing portfolio pages using this content.</p>
        </CardContent>
      </Card>
    </div>
  );
}
