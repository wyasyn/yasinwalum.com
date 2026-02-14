import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { getPublicPostBySlug, getPublicPostSlugs } from "@/lib/public-queries";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;
const PLACEHOLDER_IMAGE_SRC = "/placeholder-image.svg";
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE2IDEyIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTIiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4=";

function getSafeImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE_SRC;
  }

  const normalized = imageUrl.trim();
  return normalized.length > 0 ? normalized : PLACEHOLDER_IMAGE_SRC;
}

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

      <section className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
        <Image
          src={getSafeImageSrc(post.thumbnailUrl)}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 1024px, 100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority
        />
      </section>

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
