import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Post not found</h1>
      <p className="text-sm text-muted-foreground">This post may be unpublished or unavailable.</p>
      <Link href="/blog" className="text-sm underline-offset-4 hover:underline">
        Back to blog
      </Link>
    </main>
  );
}
