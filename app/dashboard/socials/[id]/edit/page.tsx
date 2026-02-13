import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSocialAction } from "@/lib/actions/socials-actions";
import { db, schema } from "@/lib/db";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSocialPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [link] = await db.select().from(schema.socialLink).where(eq(schema.socialLink.id, id)).limit(1);

  if (!link) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Social Link</h1>
          <p className="text-sm text-muted-foreground">Update URL and icon/image source.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/socials">Back to socials</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Form</CardTitle>
          <CardDescription>Save changes for this social profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="socials" data-local-op="update" action={updateSocialAction} className="grid gap-6 lg:grid-cols-2">
            <input type="hidden" name="id" value={link.id} />

            <div className="space-y-2">
              <Label htmlFor="name">Platform Name</Label>
              <Input id="name" name="name" defaultValue={link.name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Profile URL</Label>
              <Input id="url" name="url" defaultValue={link.url} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={link.imageUrl ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">Upload New Image (optional)</Label>
              <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
            </div>

            <div className="lg:col-span-2">
              <Button type="submit">Update Social Link</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
