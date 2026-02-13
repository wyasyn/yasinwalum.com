import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import {
  createPostAction,
  deletePostAction,
  togglePostPublishedAction,
} from "@/lib/actions/posts-actions";
import { db, schema } from "@/lib/db";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: {
    page?: string;
    pageSize?: string;
  };
};

export default async function DashboardBlogPage({ searchParams }: PageProps) {
  const pagination = parsePagination(searchParams ?? {});
  const totalItems = await getTotalItems("post");
  const offset = getOffset(pagination);

  const posts = await db
    .select()
    .from(schema.post)
    .orderBy(desc(schema.post.createdAt))
    .limit(pagination.pageSize)
    .offset(offset);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">Write posts in Markdown. Slugs are generated from the title.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Blog Post</CardTitle>
          <CardDescription>Markdown content is stored directly in PostgreSQL.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPostAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" name="excerpt" rows={2} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markdownContent">Markdown Content</Label>
              <Textarea id="markdownContent" name="markdownContent" rows={12} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload Thumbnail to Cloudinary (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input className="h-4 w-4" type="checkbox" name="published" />
              <span>Publish immediately</span>
            </label>

            <Button type="submit">Create Post</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Slug</th>
                  <th className="p-2">Published</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b">
                    <td className="p-2 font-medium">{post.title}</td>
                    <td className="p-2">{post.slug}</td>
                    <td className="p-2">{post.published ? "Yes" : "No"}</td>
                    <td className="space-y-2 p-2">
                      <form action={togglePostPublishedAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="published" value={String(post.published)} />
                        <Button type="submit" variant="outline" size="sm">
                          Toggle Publish
                        </Button>
                      </form>
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={post.id} />
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
            basePath="/dashboard/blog"
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
