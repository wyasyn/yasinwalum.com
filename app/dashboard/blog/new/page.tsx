import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { createPostAction } from "@/lib/actions/posts-actions";
import { requireAdminSession } from "@/lib/auth/session";

export default async function NewPostPage() {
  await requireAdminSession();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Blog Post</h1>
          <p className="text-sm text-muted-foreground">Write markdown with preview before publishing.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/blog">Back to blog</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Form</CardTitle>
          <CardDescription>Markdown content editor uses full-width preview mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="posts" data-local-op="create" action={createPostAction} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" name="excerpt" rows={3} required />
            </div>

            <div className="lg:col-span-2">
              <MarkdownEditor id="markdownContent" name="markdownContent" label="Blog Content (Markdown)" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload Thumbnail (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <label className="flex items-center gap-2 text-sm lg:col-span-2">
              <input className="h-4 w-4" type="checkbox" name="published" />
              <span>Publish immediately</span>
            </label>

            <div className="lg:col-span-2">
              <Button type="submit">Create Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
