import Link from "next/link";
import Image from "next/image";
import { getPublicProjectsPageDataWithFilters } from "@/lib/public-queries";

const PROJECTS_PER_PAGE = 8;
const PLACEHOLDER_IMAGE_SRC = "/placeholder-image.svg";
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE2IDEyIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTIiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4=";

type ProjectsPageProps = {
  searchParams?: Promise<{
    page?: string;
    featured?: string;
    type?: string;
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

function getSafeImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE_SRC;
  }

  const normalized = imageUrl.trim();
  return normalized.length > 0 ? normalized : PLACEHOLDER_IMAGE_SRC;
}

export const revalidate = 300;

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = parsePositiveInt(resolvedSearchParams.page, 1);
  const featured = resolvedSearchParams.featured === "true" ? true : undefined;
  const projectType = resolvedSearchParams.type?.trim() || undefined;

  const data = await getPublicProjectsPageDataWithFilters(page, PROJECTS_PER_PAGE, {
    featured,
    projectType,
  });

  return (
    <main className="container mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Search params scaffold: `page`, `featured=true`, `type={"{projectType}"}`.
        </p>
      </header>

      {data.projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects found for current filters.</p>
      ) : (
        <ul className="grid gap-3">
          {data.projects.map((project, index) => (
            <li key={project.id} className="rounded-lg border p-4">
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-md bg-muted">
                <Image
                  src={getSafeImageSrc(project.thumbnailUrl)}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  priority={page === 1 && index === 0}
                />
              </div>
              <h2 className="text-lg font-medium">{project.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{project.summary}</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span>Type: {project.projectType}</span>
                <span>{project.featured ? "Featured" : "Standard"}</span>
                <Link href={`/projects/${project.slug}`} className="underline-offset-4 hover:underline">
                  Open project
                </Link>
              </div>
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
            <Link href={`/projects?page=${page - 1}`} className="underline-offset-4 hover:underline">
              Previous
            </Link>
          ) : null}
          {page < data.totalPages ? (
            <Link href={`/projects?page=${page + 1}`} className="underline-offset-4 hover:underline">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
