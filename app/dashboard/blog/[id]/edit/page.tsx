import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { updatePostAction } from "@/lib/actions/posts-actions";
import { db, schema } from "@/lib/db";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [post] = await db.select().from(schema.post).where(eq(schema.post.id, id)).limit(1);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
          <p className="text-sm text-muted-foreground">Update markdown and publishing options.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/blog">Back to blog</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Form</CardTitle>
          <CardDescription>Preview markdown before saving.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="posts" data-local-op="update" action={updatePostAction} className="grid gap-6 lg:grid-cols-2">
            <input type="hidden" name="id" value={post.id} />

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={post.title} required />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" name="excerpt" rows={3} defaultValue={post.excerpt} required />
            </div>

            <div className="lg:col-span-2">
              <MarkdownEditor
                id="markdownContent"
                name="markdownContent"
                label="Blog Content (Markdown)"
                defaultValue={post.markdownContent}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={post.thumbnailUrl ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload New Thumbnail (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <label className="flex items-center gap-2 text-sm lg:col-span-2">
              <input className="h-4 w-4" type="checkbox" name="published" defaultChecked={post.published} />
              <span>Published</span>
            </label>

            <div className="lg:col-span-2">
              <Button type="submit">Update Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
