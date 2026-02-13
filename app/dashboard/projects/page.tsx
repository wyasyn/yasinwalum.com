import { desc, inArray } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import {
  createProjectAction,
  deleteProjectAction,
  toggleProjectFeaturedAction,
} from "@/lib/actions/projects-actions";
import { db, schema } from "@/lib/db";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: {
    page?: string;
    pageSize?: string;
  };
};

export default async function DashboardProjectsPage({ searchParams }: PageProps) {
  const pagination = parsePagination(searchParams ?? {});
  const totalItems = await getTotalItems("project");
  const offset = getOffset(pagination);

  const [projects, skills] = await Promise.all([
    db
      .select()
      .from(schema.project)
      .orderBy(desc(schema.project.createdAt))
      .limit(pagination.pageSize)
      .offset(offset),
    db.select().from(schema.skill).orderBy(desc(schema.skill.createdAt)),
  ]);

  const projectIds = projects.map((project) => project.id);

  const relations =
    projectIds.length > 0
      ? await db
          .select({ projectId: schema.projectSkill.projectId, skillId: schema.projectSkill.skillId })
          .from(schema.projectSkill)
          .where(inArray(schema.projectSkill.projectId, projectIds))
      : [];

  const skillMap = new Map(skills.map((item) => [item.id, item.name]));
  const projectSkillMap = new Map<number, string[]>();

  for (const relation of relations) {
    const name = skillMap.get(relation.skillId);
    if (!name) {
      continue;
    }
    const existing = projectSkillMap.get(relation.projectId) ?? [];
    existing.push(name);
    projectSkillMap.set(relation.projectId, existing);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage mobile apps, websites, and web applications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
          <CardDescription>Attach technologies, links, and Cloudinary thumbnails.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProjectAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Type</Label>
                <select
                  id="projectType"
                  name="projectType"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  required
                >
                  <option value="mobile-app">Mobile App</option>
                  <option value="website">Website</option>
                  <option value="web-app">Web App</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" name="summary" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea id="details" name="details" rows={5} required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL (optional)</Label>
                <Input id="repoUrl" name="repoUrl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL (optional)</Label>
                <Input id="liveUrl" name="liveUrl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload Thumbnail to Cloudinary (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <div className="space-y-2">
              <Label>Attach Skills</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                    <input className="h-4 w-4" type="checkbox" name="skillIds" value={String(skill.id)} />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input className="h-4 w-4" type="checkbox" name="featured" />
              <span>Mark as featured</span>
            </label>

            <Button type="submit">Create Project</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Featured</th>
                  <th className="p-2">Skills</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b align-top">
                    <td className="p-2 font-medium">{project.title}</td>
                    <td className="p-2">{project.projectType}</td>
                    <td className="p-2">{project.featured ? "Yes" : "No"}</td>
                    <td className="p-2">{(projectSkillMap.get(project.id) ?? []).join(", ") || "-"}</td>
                    <td className="space-y-2 p-2">
                      <form action={toggleProjectFeaturedAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="featured" value={String(project.featured)} />
                        <Button type="submit" variant="outline" size="sm">
                          Toggle Featured
                        </Button>
                      </form>
                      <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DashboardPagination
            basePath="/dashboard/projects"
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
