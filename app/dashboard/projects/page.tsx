import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth/session";
import {
  deleteProjectAction,
  toggleProjectFeaturedAction,
} from "@/lib/actions/projects-actions";
import { schema } from "@/lib/db";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { getOffset, parsePagination } from "@/lib/dashboard-utils";
import { OfflineDataPanel } from "@/components/local-first/offline-data-panel";
import { getProjectsPageData } from "@/lib/dashboard-queries";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

type ProjectRow = typeof schema.project.$inferSelect;
type SkillRow = typeof schema.skill.$inferSelect;

export default async function DashboardProjectsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
  const offset = getOffset(pagination);
  let totalItems = 0;
  let projects: ProjectRow[] = [];
  let skills: SkillRow[] = [];
  let relations: Array<{ projectId: number; skillId: number }> = [];
  let dbUnavailable = false;

  try {
    const data = await getProjectsPageData(pagination.pageSize, offset);
    totalItems = data.totalItems;
    projects = data.projects;
    skills = data.skills;
    relations = data.relations;
  } catch {
    dbUnavailable = true;
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage mobile apps, websites, and web apps.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">New Project</Link>
        </Button>
      </div>
      <OfflineDataPanel entity="projects" dbUnavailable={dbUnavailable} />

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
                    <td className="flex flex-wrap gap-2 p-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/projects/${project.id}/edit`}>Edit</Link>
                      </Button>

                      <form data-local-first="on" data-local-entity="projects" data-local-op="toggle_featured" action={toggleProjectFeaturedAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="featured" value={String(project.featured)} />
                        <Button type="submit" variant="outline" size="sm">
                          Toggle Featured
                        </Button>
                      </form>

                      <form data-local-first="on" data-local-entity="projects" data-local-op="delete" action={deleteProjectAction}>
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
