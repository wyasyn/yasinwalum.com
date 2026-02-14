import { Suspense } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Globe02Icon,
  Mail01Icon,
  NewJobIcon,
  SourceCodeCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  getPublicProfileData,
  getPublicProjectsPageData,
  getPublicSocialsData,
  type PublicProject,
} from "@/lib/public-queries";

export const revalidate = 60;

const PLACEHOLDER_IMAGE_SRC = "/placeholder-image.svg";
const PROJECTS_PER_PAGE = 8;

type HomePageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

function getSafeImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE_SRC;
  }

  const normalized = imageUrl.trim();
  return normalized.length > 0 ? normalized : PLACEHOLDER_IMAGE_SRC;
}

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

function pairProjects(projects: PublicProject[]) {
  const pairs: PublicProject[][] = [];

  for (let index = 0; index < projects.length; index += 2) {
    pairs.push(projects.slice(index, index + 2));
  }

  return pairs;
}

export default async function PublicPortfolioPage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = parsePositiveInt(resolvedSearchParams.page, 1);

  return (
    <div className="bg-white px-3">
      <div className="container relative mx-auto max-w-[1024px]">
        <main className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <Suspense fallback={<HeroMediaLoadingSection />}>
            <HeroMediaSection />
          </Suspense>

          <section className="flex min-w-0 flex-1 flex-col gap-3 pt-0 lg:pt-3">
            <Suspense fallback={<ProfileAndSocialsLoadingSection />}>
              <ProfileAndSocialsSection />
            </Suspense>

            <Suspense fallback={<LatestWorkLoadingSection />}>
              <LatestWorkSection page={page} />
            </Suspense>

            <Suspense fallback={<FooterLoadingSection />}>
              <FooterSection />
            </Suspense>
          </section>
        </main>
      </div>
    </div>
  );
}

async function HeroMediaSection() {
  const [profile, projectsPage] = await Promise.all([
    getPublicProfileData(),
    getPublicProjectsPageData(1, 1),
  ]);

  const heroProject = projectsPage.projects[0] ?? null;
  const heroImageSrc = getSafeImageSrc(heroProject?.thumbnailUrl ?? profile?.avatarUrl);

  return (
    <section
      id="portfolio"
      className="min-w-0 flex-1 py-0 lg:sticky lg:top-0 lg:h-[1080px] lg:py-3"
    >
      <div className="relative h-[78vh] min-h-[560px] overflow-hidden rounded-xl bg-[#ececec] lg:h-[1056px]">
        <img
          src={heroImageSrc}
          alt={heroProject?.title ?? profile?.fullName ?? "Portfolio image"}
          className="size-full object-cover"
          loading="eager"
        />

        <div className="absolute bottom-0 right-0 rounded-tl-[20px] bg-white px-4 pb-2 pt-3 text-[11px] text-[#0e1011]">
          {heroProject?.title ?? "Selected Work"}
        </div>
      </div>
    </section>
  );
}

async function ProfileAndSocialsSection() {
  const [profile, socials] = await Promise.all([getPublicProfileData(), getPublicSocialsData()]);
  const visibleSocials = socials.slice(0, 5);

  return (
    <section id="about" className="grid gap-3 md:grid-cols-[2fr_300px]">
      <article className="flex min-h-[382px] flex-col justify-between rounded-xl bg-[#f6f6f6] p-12 text-[#0e1011]">
        <div className="flex items-center gap-6">
          <img
            src={getSafeImageSrc(profile?.avatarUrl)}
            alt={profile?.fullName ?? "Profile"}
            className="size-20 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <h1 className="text-[18px] font-normal leading-[1.2]">
              {profile?.fullName ?? "Portfolio Owner"}
            </h1>
            <p className="text-[15px] leading-none text-[#0e1011]/50">
              {profile?.headline ?? "Creative developer"}
            </p>
          </div>
        </div>

        <p className="max-w-[500px] text-[16px] leading-[1.6] text-[#0e1011]">
          {profile?.bio ??
            "I design and build modern web experiences with strong UX, clear architecture, and reliable delivery."}
        </p>

        <div className="grid gap-2 text-[14px]">
          {profile?.location ? (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <HugeiconsIcon icon={Globe02Icon} className="size-4" strokeWidth={2} />
              {profile.location}
            </a>
          ) : null}
          {profile?.email ? (
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} className="size-4" strokeWidth={2} />
              {profile.email}
            </a>
          ) : null}
          {profile?.resumeUrl ? (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <HugeiconsIcon icon={NewJobIcon} className="size-4" strokeWidth={2} />
              Resume
            </a>
          ) : null}
        </div>
      </article>

      <div className="space-y-3">
        {visibleSocials.length === 0 ? (
          <div className="rounded-xl bg-[#f6f6f6] p-6 text-sm text-[#0e1011]/70">No socials added yet.</div>
        ) : (
          visibleSocials.map((social, index) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className={`flex h-[66.8px] items-center justify-between rounded-xl px-6 text-[14px] leading-[1.2] ${
                index === visibleSocials.length - 1
                  ? "bg-[#0e1011] text-white"
                  : "bg-[#f6f6f6] text-[#0e1011]"
              }`}
            >
              <span>{social.name}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </a>
          ))
        )}
      </div>
    </section>
  );
}

async function LatestWorkSection({ page }: { page: number }) {
  const projectsPage = await getPublicProjectsPageData(page, PROJECTS_PER_PAGE);
  const projectPairs = pairProjects(projectsPage.projects);

  return (
    <section id="projects" className="space-y-3">
      <div className="flex h-[65px] items-center justify-between rounded-xl bg-[#f6f6f6] px-8 text-[#0e1011]">
        <div className="inline-flex items-center gap-1.5 text-[14px]">
          <span>Latest Work</span>
          <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" strokeWidth={2} />
        </div>
        <span className="text-[12px]">{projectsPage.totalItems} total</span>
      </div>

      {projectsPage.projects.length === 0 ? (
        <div className="rounded-xl bg-[#f6f6f6] p-8 text-sm text-[#0e1011]/70">
          No projects available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {projectPairs.map((row, rowIndex) => (
            <div key={rowIndex} className="grid gap-3 md:grid-cols-2">
              {row.map((project) => (
                <article
                  key={project.id}
                  className="group relative h-[600px] overflow-hidden rounded-xl bg-[#0e1011]"
                >
                  <img
                    src={getSafeImageSrc(project.thumbnailUrl)}
                    alt={project.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />

                  <div className="absolute left-0 top-0 inline-flex items-center gap-1 rounded-br-[20px] bg-white px-4 pb-3 pt-2 text-[14px] text-[#0e1011]">
                    {project.title}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <p className="text-sm">{project.projectType}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-white/85">{project.summary}</p>

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded bg-white/15 px-2 py-1 hover:bg-white/25"
                        >
                          Live
                        </a>
                      ) : null}
                      {project.repoUrl ? (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-white/15 px-2 py-1 hover:bg-white/25"
                        >
                          <HugeiconsIcon icon={SourceCodeCircleIcon} className="size-3.5" strokeWidth={2} />
                          Code
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}

      {projectsPage.totalPages > 1 ? (
        <div className="flex items-center gap-2 rounded-md bg-[#f6f6f6] px-4 py-3 text-xs text-[#0e1011]">
          {page > 1 ? (
            <Link href={`/?page=${page - 1}`} className="rounded border px-2 py-1 hover:bg-white">
              Previous
            </Link>
          ) : (
            <span className="rounded border border-transparent px-2 py-1 text-[#0e1011]/40">Previous</span>
          )}

          <span>
            Page {Math.min(page, projectsPage.totalPages)} of {projectsPage.totalPages}
          </span>

          {page < projectsPage.totalPages ? (
            <Link href={`/?page=${page + 1}`} className="rounded border px-2 py-1 hover:bg-white">
              Next
            </Link>
          ) : (
            <span className="rounded border border-transparent px-2 py-1 text-[#0e1011]/40">Next</span>
          )}
        </div>
      ) : null}
    </section>
  );
}

async function FooterSection() {
  const [profile, socials] = await Promise.all([getPublicProfileData(), getPublicSocialsData()]);
  const topSocials = socials.slice(0, 4);

  return (
    <footer id="contact" className="space-y-3 pb-3">
      <div className="grid gap-3 md:grid-cols-2">
        {topSocials.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-[68px] items-center justify-between rounded-xl bg-[#f6f6f6] px-6 text-[14px] text-[#0e1011]"
          >
            <span>{social.name}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
          </a>
        ))}
      </div>

      <div className="rounded-xl bg-[#0e1011] p-8 text-white">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={getSafeImageSrc(profile?.avatarUrl)}
                alt={profile?.fullName ?? "Profile"}
                className="size-[60px] rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-[18px] leading-[1.2]">{profile?.fullName ?? "Portfolio Owner"}</p>
                <p className="text-[15px] leading-none text-white/60">{profile?.headline ?? "Developer"}</p>
              </div>
            </div>

            <a
              href={profile?.email ? `mailto:${profile.email}` : "#"}
              className="rounded-md bg-white px-3.5 py-3 text-[14px] text-[#0e1011]"
            >
              Contact Me
            </a>
          </div>

          <div className="grid gap-6 text-[14px] text-white/60 md:grid-cols-3">
            <div>
              <p className="mb-4 text-[16px] text-white">Pages</p>
              <p>Portfolio</p>
              <p>About</p>
              <p>Projects</p>
              <p>Contact</p>
            </div>
            <div>
              <p className="mb-4 text-[16px] text-white">CMS</p>
              <p>Work</p>
              <p>Work Single</p>
              <p>Projects</p>
            </div>
            <div>
              <p className="mb-4 text-[16px] text-white">Utility</p>
              <Link href="/login" className="block w-fit hover:text-white">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HeroMediaLoadingSection() {
  return <div className="h-[78vh] min-h-[560px] animate-pulse rounded-xl bg-[#ececec] lg:h-[1080px] lg:py-3" />;
}

function ProfileAndSocialsLoadingSection() {
  return (
    <div className="grid gap-3 md:grid-cols-[2fr_300px]">
      <div className="h-[382px] animate-pulse rounded-xl bg-[#f6f6f6]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[66.8px] animate-pulse rounded-xl bg-[#f6f6f6]" />
        ))}
      </div>
    </div>
  );
}

function LatestWorkLoadingSection() {
  return (
    <section className="space-y-3">
      <div className="h-[65px] animate-pulse rounded-xl bg-[#f6f6f6]" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[600px] animate-pulse rounded-xl bg-[#ececec]" />
        ))}
      </div>
    </section>
  );
}

function FooterLoadingSection() {
  return (
    <section className="space-y-3 pb-3">
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[68px] animate-pulse rounded-xl bg-[#f6f6f6]" />
        ))}
      </div>
      <div className="h-[520px] animate-pulse rounded-xl bg-[#0e1011]" />
    </section>
  );
}
