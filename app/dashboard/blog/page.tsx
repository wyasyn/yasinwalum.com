import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth/session";
import {
  deletePostAction,
  togglePostPublishedAction,
} from "@/lib/actions/posts-actions";
import { schema } from "@/lib/db";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { getOffset, parsePagination } from "@/lib/dashboard-utils";
import { OfflineDataPanel } from "@/components/local-first/offline-data-panel";
import { getPostsPageData } from "@/lib/dashboard-queries";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

type PostRow = typeof schema.post.$inferSelect;

export default async function DashboardBlogPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
  const offset = getOffset(pagination);

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

      <Suspense fallback={<BlogTableLoadingSection />}>
        <BlogDataSection pagination={pagination} offset={offset} />
      </Suspense>
    </div>
  );
}

async function BlogDataSection({
  pagination,
  offset,
}: {
  pagination: ReturnType<typeof parsePagination>;
  offset: number;
}) {
  let totalItems = 0;
  let posts: PostRow[] = [];
  let dbUnavailable = false;

  try {
    const data = await getPostsPageData(pagination.pageSize, offset);
    totalItems = data.totalItems;
    posts = data.posts;
  } catch {
    dbUnavailable = true;
  }

  return (
    <>
      <OfflineDataPanel entity="posts" dbUnavailable={dbUnavailable} />

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

                      <form data-local-first="on" data-local-entity="posts" data-local-op="toggle_published" action={togglePostPublishedAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="published" value={String(post.published)} />
                        <Button type="submit" variant="outline" size="sm">
                          Toggle Publish
                        </Button>
                      </form>

                      <form data-local-first="on" data-local-entity="posts" data-local-op="delete" action={deletePostAction}>
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
    </>
  );
}

function BlogTableLoadingSection() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-200">
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-9 w-full animate-pulse rounded-md bg-muted/60" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-3">
                <div className="h-5 animate-pulse rounded-md bg-muted/80" />
                <div className="h-5 animate-pulse rounded-md bg-muted/70" />
                <div className="h-5 animate-pulse rounded-md bg-muted/60" />
                <div className="h-5 animate-pulse rounded-md bg-muted/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
