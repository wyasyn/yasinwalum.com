import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { ProjectTypeSelect } from "@/components/dashboard/project-type-select";
import { updateProjectAction } from "@/lib/actions/projects-actions";
import { db, schema } from "@/lib/db";
import { getSkillIdsForProject } from "@/lib/dashboard-utils";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [project, skills, skillIds] = await Promise.all([
    db.select().from(schema.project).where(eq(schema.project.id, id)).limit(1),
    db.select().from(schema.skill).orderBy(desc(schema.skill.createdAt)),
    getSkillIdsForProject(id),
  ]);

  const item = project[0];

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Project</h1>
          <p className="text-sm text-muted-foreground">Update metadata, markdown body, and associations.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/projects">Back to projects</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Form</CardTitle>
          <CardDescription>Changes are reflected after save.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProjectAction} className="grid gap-6 lg:grid-cols-2">
            <input type="hidden" name="id" value={item.id} />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={item.title} required />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <ProjectTypeSelect name="projectType" defaultValue={item.projectType as "mobile-app" | "website" | "web-app"} />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={3} defaultValue={item.summary} required />
            </div>

            <div className="lg:col-span-2">
              <MarkdownEditor
                id="details"
                name="details"
                label="Project Details (Markdown)"
                defaultValue={item.details}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL (optional)</Label>
              <Input id="repoUrl" name="repoUrl" defaultValue={item.repoUrl ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL (optional)</Label>
              <Input id="liveUrl" name="liveUrl" defaultValue={item.liveUrl ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={item.thumbnailUrl ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload New Thumbnail (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Attach Skills</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                    <input
                      className="h-4 w-4"
                      type="checkbox"
                      name="skillIds"
                      value={String(skill.id)}
                      defaultChecked={skillIds.includes(skill.id)}
                    />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm lg:col-span-2">
              <input className="h-4 w-4" type="checkbox" name="featured" defaultChecked={item.featured} />
              <span>Mark as featured</span>
            </label>

            <div className="lg:col-span-2">
              <Button type="submit">Update Project</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
