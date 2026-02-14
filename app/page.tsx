import { Suspense } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Behance01Icon,
  DiscordIcon,
  DribbbleIcon,
  Facebook01Icon,
  GithubIcon,
  Globe02Icon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  MediumIcon,
  NewJobIcon,
  NewTwitterIcon,
  RedditIcon,
  SourceCodeCircleIcon,
  TelegramIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import {
  getPublicProfileData,
  getPublicProjectsPageData,
  getPublicSocialsData,
} from "@/lib/public-queries";
import Image from "next/image";

export const revalidate = 60;

const PLACEHOLDER_IMAGE_SRC = "/placeholder-image.svg";
const HOME_PROJECTS_LIMIT = 4;
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE2IDEyIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTIiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4=";

function getSafeImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE_SRC;
  }

  const normalized = imageUrl.trim();
  return normalized.length > 0 ? normalized : PLACEHOLDER_IMAGE_SRC;
}

function getHostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function getSocialIconByNameOrUrl(name: string, url: string) {
  const normalizedName = name.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  const hostname = getHostname(url);
  const searchable = `${normalizedName} ${normalizedUrl} ${hostname}`;

  if (searchable.includes("github.com") || searchable.includes("github"))
    return GithubIcon;
  if (searchable.includes("linkedin.com") || searchable.includes("linkedin"))
    return Linkedin01Icon;
  if (searchable.includes("instagram.com") || searchable.includes("instagram"))
    return InstagramIcon;
  if (
    searchable.includes("x.com") ||
    searchable.includes("twitter.com") ||
    searchable.includes("twitter")
  ) {
    return NewTwitterIcon;
  }
  if (
    searchable.includes("youtube.com") ||
    searchable.includes("youtu.be") ||
    searchable.includes("youtube")
  ) {
    return YoutubeIcon;
  }
  if (
    searchable.includes("discord.com") ||
    searchable.includes("discord.gg") ||
    searchable.includes("discord")
  ) {
    return DiscordIcon;
  }
  if (searchable.includes("tiktok.com") || searchable.includes("tiktok"))
    return TiktokIcon;
  if (
    searchable.includes("telegram.me") ||
    searchable.includes("t.me") ||
    searchable.includes("telegram")
  ) {
    return TelegramIcon;
  }
  if (searchable.includes("reddit.com") || searchable.includes("reddit"))
    return RedditIcon;
  if (searchable.includes("medium.com") || searchable.includes("medium"))
    return MediumIcon;
  if (searchable.includes("dribbble.com") || searchable.includes("dribbble"))
    return DribbbleIcon;
  if (searchable.includes("behance.net") || searchable.includes("behance"))
    return Behance01Icon;
  if (searchable.includes("facebook.com") || searchable.includes("facebook"))
    return Facebook01Icon;
  if (
    searchable.includes("whatsapp.com") ||
    searchable.includes("wa.me") ||
    searchable.includes("whatsapp")
  ) {
    return WhatsappIcon;
  }

  return Globe02Icon;
}

export default async function PublicPortfolioPage() {
  return (
    <div>
      <div className="container relative  ">
        <main className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <Suspense fallback={<HeroMediaLoadingSection />}>
            <HeroMediaSection />
          </Suspense>

          <section className="flex min-w-0 flex-1 flex-col gap-3 pt-0 lg:pt-3">
            <Suspense fallback={<ProfileAndSocialsLoadingSection />}>
              <ProfileAndSocialsSection />
            </Suspense>

            <Suspense fallback={<LatestWorkLoadingSection />}>
              <LatestWorkSection />
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
  const heroImageSrc = getSafeImageSrc(
    heroProject?.thumbnailUrl ?? profile?.avatarUrl,
  );

  return (
    <section
      id="portfolio"
      className="min-w-0 flex-1 py-0 lg:sticky lg:top-0 lg:self-start lg:py-3"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl max-lg:hidden">
        <Image
          src={heroImageSrc}
          alt={heroProject?.title ?? profile?.fullName ?? "Portfolio image"}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, 100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />

        <div className="absolute bottom-0 right-0 rounded-tl-2xl bg-background  px-4 pb-2 pt-3 text-[11px] ">
          {heroProject?.title ?? "Selected Work"}
        </div>
      </div>
    </section>
  );
}

async function ProfileAndSocialsSection() {
  const [profile, socials] = await Promise.all([
    getPublicProfileData(),
    getPublicSocialsData(),
  ]);
  const visibleSocials = socials.slice(0, 5);

  return (
    <section
      id="about"
      className="grid gap-3 md:grid-cols-[2fr_300px] lg:grid-cols-1"
    >
      <article className="flex min-h-95.5 flex-col justify-between rounded-xl bg-card p-12 ">
        <div className="flex items-center gap-6">
          <Image
            src={getSafeImageSrc(profile?.avatarUrl)}
            alt={profile?.fullName ?? "Profile"}
            className="size-20 rounded-full object-cover"
            width={80}
            height={80}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
          <div>
            <h1 className="text-[18px] font-normal leading-[1.2]">
              {profile?.fullName ?? "Portfolio Owner"}
            </h1>
            <p className="text-[15px] leading-none ">
              {profile?.headline ?? "Creative developer"}
            </p>
          </div>
        </div>

        <p className="max-w-125 text-[16px] leading-[1.6] ">
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
              <HugeiconsIcon
                icon={Globe02Icon}
                className="size-4"
                strokeWidth={2}
              />
              {profile.location}
            </a>
          ) : null}
          {profile?.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2"
            >
              <HugeiconsIcon
                icon={Mail01Icon}
                className="size-4"
                strokeWidth={2}
              />
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
              <HugeiconsIcon
                icon={NewJobIcon}
                className="size-4"
                strokeWidth={2}
              />
              Resume
            </a>
          ) : null}
        </div>
      </article>

      <div className="space-y-3 hidden md:block lg:hidden">
        {visibleSocials.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-sm ">
            No socials added yet.
          </div>
        ) : (
          visibleSocials.map((social, index) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className={`flex h-[66.8px] items-center justify-between rounded-xl px-6 text-[14px] leading-[1.2] ${
                index === visibleSocials.length - 1
                  ? "bg-muted-foreground text-background "
                  : "bg-card"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon
                  icon={getSocialIconByNameOrUrl(social.name, social.url)}
                  className="size-4"
                  strokeWidth={2}
                />
                {social.name}
              </span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </a>
          ))
        )}
      </div>
    </section>
  );
}

async function LatestWorkSection() {
  const projectsPage = await getPublicProjectsPageData(1, HOME_PROJECTS_LIMIT);

  return (
    <section id="projects" className="space-y-3">
      <div className="flex h-16.25 items-center justify-between rounded-xl bg-card px-8 ">
        <div className="inline-flex items-center gap-1.5 text-[14px]">
          <span>Latest Work</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="size-4"
            strokeWidth={2}
          />
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-[12px]  transition-colors hover:text-muted-foreground"
        >
          See more
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-3.5"
            strokeWidth={2}
          />
        </Link>
      </div>

      {projectsPage.projects.length === 0 ? (
        <div className="rounded-xl  p-8 text-sm bg-card">
          No projects available yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projectsPage.projects.map((project) => (
            <article
              key={project.id}
              className="group relative aspect-3/4 overflow-hidden rounded-[0_15px_15px_15px]  bg-card"
            >
              <Image
                src={getSafeImageSrc(project.thumbnailUrl)}
                alt={project.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />

              <div className="absolute left-0 top-0 inline-flex items-center gap-1 rounded-br-4xl bg-background px-4 pb-3 pt-2 text-[14px] ">
                {project.title}
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/70 to-transparent p-4 ">
                <p className="text-sm">{project.projectType}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/85">
                  {project.summary}
                </p>

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
                      <HugeiconsIcon
                        icon={SourceCodeCircleIcon}
                        className="size-3.5"
                        strokeWidth={2}
                      />
                      Code
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

async function FooterSection() {
  const [profile, socials] = await Promise.all([
    getPublicProfileData(),
    getPublicSocialsData(),
  ]);
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
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon
                icon={getSocialIconByNameOrUrl(social.name, social.url)}
                className="size-4"
                strokeWidth={2}
              />
              {social.name}
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4"
              strokeWidth={2}
            />
          </a>
        ))}
      </div>

      <div className="rounded-xl bg-[#0e1011] p-8 text-white">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={getSafeImageSrc(profile?.avatarUrl)}
                alt={profile?.fullName ?? "Profile"}
                className="size-[60px] rounded-full object-cover"
                width={60}
                height={60}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
              <div>
                <p className="text-[18px] leading-[1.2]">
                  {profile?.fullName ?? "Portfolio Owner"}
                </p>
                <p className="text-[15px] leading-none text-white/60">
                  {profile?.headline ?? "Developer"}
                </p>
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
  return (
    <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-[#ececec]" />
  );
}

function ProfileAndSocialsLoadingSection() {
  return (
    <div className="grid gap-3 md:grid-cols-[2fr_300px]">
      <div className="h-[382px] animate-pulse rounded-xl bg-[#f6f6f6]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[66.8px] animate-pulse rounded-xl bg-[#f6f6f6]"
          />
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
          <div
            key={index}
            className="h-[600px] animate-pulse rounded-xl bg-[#ececec]"
          />
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
          <div
            key={index}
            className="h-[68px] animate-pulse rounded-xl bg-[#f6f6f6]"
          />
        ))}
      </div>
      <div className="h-[520px] animate-pulse rounded-xl bg-[#0e1011]" />
    </section>
  );
}
