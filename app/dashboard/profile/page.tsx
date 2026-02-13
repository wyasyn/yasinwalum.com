import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getProfileOrNull } from "@/lib/dashboard-utils";
import { saveProfileAction } from "@/lib/actions/profile-actions";
import { OfflineDataPanel } from "@/components/local-first/offline-data-panel";

export default async function DashboardProfilePage() {
  let profile = null;
  let dbUnavailable = false;

  try {
    profile = await getProfileOrNull();
  } catch {
    dbUnavailable = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Update your public bio and personal details.</p>
      </div>
      <OfflineDataPanel entity="profile" dbUnavailable={dbUnavailable} />

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>This powers the hero/about section of your public site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="profile" data-local-op="upsert" action={saveProfileAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" defaultValue={profile?.fullName ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" name="headline" defaultValue={profile?.headline ?? ""} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={profile?.bio ?? ""} rows={5} required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={profile?.location ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Public Email</Label>
                <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ""} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input id="resumeUrl" name="resumeUrl" defaultValue={profile?.resumeUrl ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
              <Input id="avatarUrl" name="avatarUrl" defaultValue={profile?.avatarUrl ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarFile">Upload Avatar to Cloudinary (optional)</Label>
              <Input id="avatarFile" name="avatarFile" type="file" accept="image/*" />
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
