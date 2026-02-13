import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSocialAction } from "@/lib/actions/socials-actions";

export default function NewSocialPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Social Link</h1>
          <p className="text-sm text-muted-foreground">Add platform links and optional icon image.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/socials">Back to socials</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Form</CardTitle>
          <CardDescription>Add URL and image source.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="socials" data-local-op="create" action={createSocialAction} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Platform Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Profile URL</Label>
              <Input id="url" name="url" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" name="imageUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">Upload Image (optional)</Label>
              <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
            </div>

            <div className="lg:col-span-2">
              <Button type="submit">Create Social Link</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
