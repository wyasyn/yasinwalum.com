import Link from "next/link";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { deleteSkillAction } from "@/lib/actions/skills-actions";
import { db, schema } from "@/lib/db";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function DashboardSkillsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
  const totalItems = await getTotalItems("skill");
  const offset = getOffset(pagination);

  const skills = await db
    .select()
    .from(schema.skill)
    .orderBy(desc(schema.skill.createdAt))
    .limit(pagination.pageSize)
    .offset(offset);

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
                      <form action={deleteSkillAction}>
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
    </div>
  );
}
