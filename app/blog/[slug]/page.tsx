import Link from "next/link";
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { getPublicPostBySlug, getPublicPostSlugs } from "@/lib/public-queries";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPublicPostSlugs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.markdownContent);

  return (
    <main className="container mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{post.title}</h1>
        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
      </header>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Post Content (Markdown)</h2>
        {contentHtml ? (
          <div className="markdown-preview mt-2 text-sm" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No content available.</p>
        )}
      </section>

      <Link href="/blog" className="text-sm underline-offset-4 hover:underline">
        Back to blog
      </Link>
    </main>
  );
}
