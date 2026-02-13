import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { createSkillAction, deleteSkillAction } from "@/lib/actions/skills-actions";
import { db, schema } from "@/lib/db";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: {
    page?: string;
    pageSize?: string;
  };
};

export default async function DashboardSkillsPage({ searchParams }: PageProps) {
  const pagination = parsePagination(searchParams ?? {});
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
      <div>
        <h1 className="text-2xl font-semibold">Skills</h1>
        <p className="text-sm text-muted-foreground">Create skills and proficiency tags for your projects.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Skill</CardTitle>
          <CardDescription>Add a skill with an optional Cloudinary image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSkillAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="Frontend, Backend, Mobile..." required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proficiency">Proficiency (1-100)</Label>
                <Input id="proficiency" name="proficiency" type="number" min={1} max={100} defaultValue={70} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                <Input id="thumbnailUrl" name="thumbnailUrl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload Thumbnail to Cloudinary (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <Button type="submit">Create Skill</Button>
          </form>
        </CardContent>
      </Card>

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
                    <td className="p-2">
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
