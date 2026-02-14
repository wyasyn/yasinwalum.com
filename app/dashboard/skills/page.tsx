import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { deleteSkillAction } from "@/lib/actions/skills-actions";
import { schema } from "@/lib/db";
import { getOffset, parsePagination } from "@/lib/dashboard-utils";
import { OfflineDataPanel } from "@/components/local-first/offline-data-panel";
import { getSkillsPageData } from "@/lib/dashboard-queries";
import { requireAdminSession } from "@/lib/auth/session";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

type SkillRow = typeof schema.skill.$inferSelect;

export default async function DashboardSkillsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
  const offset = getOffset(pagination);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Skills</h1>
          <p className="text-sm text-muted-foreground">Manage all technologies and capabilities.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/skills/new">New Skill</Link>
        </Button>
      </div>

      <Suspense fallback={<SkillsTableLoadingSection />}>
        <SkillsDataSection pagination={pagination} offset={offset} />
      </Suspense>
    </div>
  );
}

async function SkillsDataSection({
  pagination,
  offset,
}: {
  pagination: ReturnType<typeof parsePagination>;
  offset: number;
}) {
  let totalItems = 0;
  let skills: SkillRow[] = [];
  let dbUnavailable = false;

  try {
    const data = await getSkillsPageData(pagination.pageSize, offset);
    totalItems = data.totalItems;
    skills = data.skills;
  } catch {
    dbUnavailable = true;
  }

  return (
    <>
      <OfflineDataPanel entity="skills" dbUnavailable={dbUnavailable} />

      <Card>
        <CardHeader>
          <CardTitle>All Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Proficiency</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">{item.proficiency}%</td>
                    <td className="flex flex-wrap gap-2 p-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/skills/${item.id}/edit`}>Edit</Link>
                      </Button>
                      <form data-local-first="on" data-local-entity="skills" data-local-op="delete" action={deleteSkillAction}>
                        <input type="hidden" name="id" value={item.id} />
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
            basePath="/dashboard/skills"
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </>
  );
}

function SkillsTableLoadingSection() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-200">
      <Card>
        <CardHeader>
          <CardTitle>All Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-9 w-full animate-pulse rounded-md bg-muted/60" />
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-3">
                <div className="h-5 animate-pulse rounded-md bg-muted/80" />
                <div className="h-5 animate-pulse rounded-md bg-muted/70" />
                <div className="h-5 animate-pulse rounded-md bg-muted/60" />
                <div className="h-5 animate-pulse rounded-md bg-muted/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
