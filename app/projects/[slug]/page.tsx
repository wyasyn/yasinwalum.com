import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { getPublicProjectBySlug, getPublicProjectSlugs } from "@/lib/public-queries";

type ProjectDetailsPageProps = {
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
  const projects = await getPublicProjectSlugs();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const detailsHtml = await markdownToHtml(project.details);

  return (
    <main className="container mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{project.title}</h1>
        <p className="text-sm text-muted-foreground">{project.summary}</p>
      </header>

      <section className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
        <Image
          src={getSafeImageSrc(project.thumbnailUrl)}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 1024px, 100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority
        />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Metadata</h2>
        <div className="mt-3 space-y-1 text-sm">
          <p>
            <span className="font-medium">Slug:</span> {project.slug}
          </p>
          <p>
            <span className="font-medium">Type:</span> {project.projectType}
          </p>
          <p>
            <span className="font-medium">Featured:</span> {project.featured ? "Yes" : "No"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Skills</h2>
        {project.skillNames.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No mapped skills.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {project.skillNames.map((skill) => (
              <li key={skill} className="rounded-md border px-2 py-1">
                {skill}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Details (Markdown)</h2>
        {detailsHtml ? (
          <div className="markdown-preview mt-2 text-sm" dangerouslySetInnerHTML={{ __html: detailsHtml }} />
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No details available.</p>
        )}
      </section>

      <Link href="/projects" className="text-sm underline-offset-4 hover:underline">
        Back to projects
      </Link>
    </main>
  );
}
