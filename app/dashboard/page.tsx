import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfflineDataPanel } from "@/components/local-first/offline-data-panel";
import { getOverviewData } from "@/lib/dashboard-queries";
import { requireAdminSession } from "@/lib/auth/session";

export default async function DashboardOverviewPage() {
  await requireAdminSession();
  let projectsCount = 0;
  let postsCount = 0;
  let skillsCount = 0;
  let socialsCount = 0;
  let latestProject: { title: string; slug: string } | undefined = undefined;
  let latestPost: { title: string; slug: string } | undefined = undefined;
  let dbUnavailable = false;

  try {
    const overview = await getOverviewData();
    projectsCount = overview.projectsCount;
    postsCount = overview.postsCount;
    skillsCount = overview.skillsCount;
    socialsCount = overview.socialsCount;
    latestProject = overview.latestProject;
    latestPost = overview.latestPost;
  } catch {
    dbUnavailable = true;
  }

  const stats = [
    { label: "Projects", value: projectsCount, href: "/dashboard/projects" },
    { label: "Blog Posts", value: postsCount, href: "/dashboard/blog" },
    { label: "Skills", value: skillsCount, href: "/dashboard/skills" },
    { label: "Social Links", value: socialsCount, href: "/dashboard/socials" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Manage profile, projects, blog posts, skills, and social links.
        </p>
      </div>
      <OfflineDataPanel entity="overview" dbUnavailable={dbUnavailable} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link className="text-sm text-primary underline-offset-4 hover:underline" href={stat.href}>
                Open {stat.label}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest Project</CardTitle>
          </CardHeader>
          <CardContent>
            {latestProject ? (
              <Link href="/dashboard/projects" className="text-primary hover:underline">
                {latestProject.title}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No project created yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            {latestPost ? (
              <Link href="/dashboard/blog" className="text-primary hover:underline">
                {latestPost.title}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No post created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
