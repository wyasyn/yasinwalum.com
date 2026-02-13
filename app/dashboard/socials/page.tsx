import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { createSocialAction, deleteSocialAction } from "@/lib/actions/socials-actions";
import { db, schema } from "@/lib/db";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: {
    page?: string;
    pageSize?: string;
  };
};

export default async function DashboardSocialsPage({ searchParams }: PageProps) {
  const pagination = parsePagination(searchParams ?? {});
  const totalItems = await getTotalItems("social");
  const offset = getOffset(pagination);

  const socialLinks = await db
    .select()
    .from(schema.socialLink)
    .orderBy(desc(schema.socialLink.createdAt))
    .limit(pagination.pageSize)
    .offset(offset);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Social Links</h1>
        <p className="text-sm text-muted-foreground">Manage social profiles and icon images.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Social Link</CardTitle>
          <CardDescription>You can store either icon URL or upload image directly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSocialAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Platform Name</Label>
                <Input id="name" name="name" placeholder="GitHub" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Profile URL</Label>
                <Input id="url" name="url" placeholder="https://github.com/you" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Icon/Image URL (optional)</Label>
              <Input id="imageUrl" name="imageUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">Upload Icon/Image to Cloudinary (optional)</Label>
              <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
            </div>

            <Button type="submit">Create Social Link</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">URL</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {socialLinks.map((link) => (
                  <tr key={link.id} className="border-b">
                    <td className="p-2 font-medium">{link.name}</td>
                    <td className="p-2">
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {link.url}
                      </a>
                    </td>
                    <td className="p-2">
                      <form action={deleteSocialAction}>
                        <input type="hidden" name="id" value={link.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DashboardPagination
            basePath="/dashboard/socials"
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
