import Link from "next/link";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  deletePostAction,
  togglePostPublishedAction,
} from "@/lib/actions/posts-actions";
import { db, schema } from "@/lib/db";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function DashboardBlogPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">Manage markdown posts and publishing status.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">New Post</Link>
        </Button>
      </div>

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
                    <td className="flex flex-wrap gap-2 p-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/blog/${post.id}/edit`}>Edit</Link>
                      </Button>

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
