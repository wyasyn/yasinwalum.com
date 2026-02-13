import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";

export default async function DashboardOverviewPage() {
  await requireAdminSession();

  const [projectsCount, postsCount, skillsCount, socialsCount] = await Promise.all([
    db.select({ value: count() }).from(schema.project),
    db.select({ value: count() }).from(schema.post),
    db.select({ value: count() }).from(schema.skill),
    db.select({ value: count() }).from(schema.socialLink),
  ]);

  const [latestProject] = await db
    .select({ title: schema.project.title, slug: schema.project.slug })
    .from(schema.project)
    .orderBy(desc(schema.project.createdAt))
    .limit(1);

  const [latestPost] = await db
    .select({ title: schema.post.title, slug: schema.post.slug })
    .from(schema.post)
    .orderBy(desc(schema.post.createdAt))
    .limit(1);

  const stats = [
    { label: "Projects", value: projectsCount[0]?.value ?? 0, href: "/dashboard/projects" },
    { label: "Blog Posts", value: postsCount[0]?.value ?? 0, href: "/dashboard/blog" },
    { label: "Skills", value: skillsCount[0]?.value ?? 0, href: "/dashboard/skills" },
    { label: "Social Links", value: socialsCount[0]?.value ?? 0, href: "/dashboard/socials" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Manage profile, projects, blog posts, skills, and social links.
        </p>
      </div>

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
