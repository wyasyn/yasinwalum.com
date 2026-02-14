import { Suspense } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Globe02Icon,
  Mail01Icon,
  NewJobIcon,
  SourceCodeCircleIcon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicPostsData,
  getPublicProfileData,
  getPublicProjectsData,
  getPublicSocialsData,
} from "@/lib/public-queries";

export const revalidate = 60;

export default function PublicPortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-12">
        <Suspense fallback={<HeroSectionLoading />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<ProjectsSectionLoading />}>
          <ProjectsSection />
        </Suspense>

        <Suspense fallback={<BlogSectionLoading />}>
          <BlogSection />
        </Suspense>

        <Suspense fallback={<SocialsSectionLoading />}>
          <SocialsSection />
        </Suspense>
      </main>
    </div>
  );
}

async function HeroSection() {
  const profile = await getPublicProfileData();

  return (
    <section className="rounded-3xl border bg-card/70 p-6 backdrop-blur-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <Badge variant="secondary" className="h-6 rounded-full">
            <HugeiconsIcon icon={UserSquareIcon} className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
            Portfolio
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {profile?.fullName ?? "Portfolio Owner"}
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              {profile?.headline ?? "Software engineer building reliable products."}
            </p>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            {profile?.bio ?? "Profile information will appear here once data is added in dashboard."}
          </p>
          <div className="flex flex-wrap gap-2">
            {profile?.location ? (
              <Badge variant="outline" className="h-7 rounded-full">
                <HugeiconsIcon icon={Globe02Icon} className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
                {profile.location}
              </Badge>
            ) : null}
            {profile?.email ? (
              <a href={`mailto:${profile.email}`}>
                <Badge variant="outline" className="h-7 rounded-full">
                  <HugeiconsIcon icon={Mail01Icon} className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
                  {profile.email}
                </Badge>
              </a>
            ) : null}
            {profile?.resumeUrl ? (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                <Badge variant="outline" className="h-7 rounded-full">
                  <HugeiconsIcon icon={NewJobIcon} className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
                  Resume
                </Badge>
              </a>
            ) : null}
          </div>
        </div>

        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="h-28 w-28 shrink-0 rounded-3xl border object-cover md:h-36 md:w-36"
          />
        ) : null}
      </div>
    </section>
  );
}

async function ProjectsSection() {
  const projects = await getPublicProjectsData(6);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">Projects</h2>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Admin
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No projects available yet.
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              {project.thumbnailUrl ? (
                <img src={project.thumbnailUrl} alt={project.title} className="h-40 w-full object-cover" />
              ) : null}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.featured ? <Badge>Featured</Badge> : null}
                </div>
                <CardDescription>{project.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.skillNames.slice(0, 4).map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.liveUrl ? (
                    <Button asChild size="sm">
                      <a href={project.liveUrl} target="_blank" rel="noreferrer">
                        <HugeiconsIcon icon={Globe02Icon} className="mr-1 h-4 w-4" strokeWidth={2} />
                        Live
                      </a>
                    </Button>
                  ) : null}
                  {project.repoUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={project.repoUrl} target="_blank" rel="noreferrer">
                        <HugeiconsIcon icon={SourceCodeCircleIcon} className="mr-1 h-4 w-4" strokeWidth={2} />
                        Code
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

async function BlogSection() {
  const posts = await getPublicPostsData(6);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold md:text-2xl">Blog</h2>
      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No published posts available yet.
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" strokeWidth={2} />
                  {format(post.publishedAt ?? post.updatedAt, "MMM d, yyyy")}
                </span>
                <span className="font-mono text-xs">/{post.slug}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

async function SocialsSection() {
  const socials = await getPublicSocialsData();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold md:text-2xl">Socials</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {socials.length === 0 ? (
          <Card className="sm:col-span-2 md:col-span-3">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No social links available yet.
            </CardContent>
          </Card>
        ) : (
          socials.map((social) => (
            <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="block">
              <Card className="h-full transition-colors hover:border-primary/30 hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  {social.imageUrl ? (
                    <img src={social.imageUrl} alt={social.name} className="h-8 w-8 rounded-md object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{social.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{social.url}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        )}
      </div>
    </section>
  );
}

function HeroSectionLoading() {
  return (
    <section className="rounded-3xl border bg-card/70 p-6 md:p-8">
      <div className="space-y-4">
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted/70" />
        <div className="h-10 w-72 animate-pulse rounded-md bg-muted/70" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded-md bg-muted/60" />
        <div className="h-20 w-full animate-pulse rounded-md bg-muted/50" />
      </div>
    </section>
  );
}

function ProjectsSectionLoading() {
  return (
    <section className="space-y-4">
      <div className="h-8 w-28 animate-pulse rounded-md bg-muted/70" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-6">
              <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/70" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted/60" />
              <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted/50" />
              <div className="h-8 w-24 animate-pulse rounded-md bg-muted/60" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function BlogSectionLoading() {
  return (
    <section className="space-y-4">
      <div className="h-8 w-20 animate-pulse rounded-md bg-muted/70" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted/70" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted/60" />
              <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted/50" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SocialsSectionLoading() {
  return (
    <section className="space-y-4">
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted/70" />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 animate-pulse rounded-md bg-muted/70" />
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted/60" />
                <div className="h-3 w-28 animate-pulse rounded-md bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
