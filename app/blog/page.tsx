import Link from "next/link";
import { getPublicPostsPageData } from "@/lib/public-queries";

const POSTS_PER_PAGE = 8;

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
};

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export const revalidate = 300;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = parsePositiveInt(resolvedSearchParams.page, 1);
  const query = resolvedSearchParams.q?.trim() || undefined;

  const data = await getPublicPostsPageData(page, POSTS_PER_PAGE, { query });

  return (
    <main className="container mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">
          Search params scaffold: `page` and `q` (title/excerpt/content search).
        </p>
      </header>

      {data.posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blog posts found.</p>
      ) : (
        <ul className="grid gap-3">
          {data.posts.map((post) => (
            <li key={post.id} className="rounded-lg border p-4">
              <h2 className="text-lg font-medium">{post.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-sm underline-offset-4 hover:underline">
                Read post
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data.totalPages > 1 ? (
        <div className="flex items-center gap-4 text-sm">
          <span>
            Page {Math.min(page, data.totalPages)} of {data.totalPages}
          </span>
          {page > 1 ? (
            <Link href={`/blog?page=${page - 1}`} className="underline-offset-4 hover:underline">
              Previous
            </Link>
          ) : null}
          {page < data.totalPages ? (
            <Link href={`/blog?page=${page + 1}`} className="underline-offset-4 hover:underline">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
