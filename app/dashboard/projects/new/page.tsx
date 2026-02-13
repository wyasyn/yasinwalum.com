import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { ProjectTypeSelect } from "@/components/dashboard/project-type-select";
import { createProjectAction } from "@/lib/actions/projects-actions";
import { getSkillsCatalog } from "@/lib/dashboard-queries";
import { requireAdminSession } from "@/lib/auth/session";

export default async function NewProjectPage() {
  await requireAdminSession();
  const skills = await getSkillsCatalog();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Project</h1>
          <p className="text-sm text-muted-foreground">Add details, markdown body, and skills mapping.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/projects">Back to projects</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Form</CardTitle>
          <CardDescription>Use markdown for full details with live preview.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="projects" data-local-op="create" action={createProjectAction} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <ProjectTypeSelect name="projectType" defaultValue="mobile-app" />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={3} required />
            </div>

            <div className="lg:col-span-2">
              <MarkdownEditor id="details" name="details" label="Project Details (Markdown)" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL (optional)</Label>
              <Input id="repoUrl" name="repoUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL (optional)</Label>
              <Input id="liveUrl" name="liveUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Upload Thumbnail (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Attach Skills</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                    <input className="h-4 w-4" type="checkbox" name="skillIds" value={String(skill.id)} />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm lg:col-span-2">
              <input className="h-4 w-4" type="checkbox" name="featured" />
              <span>Mark as featured</span>
            </label>

            <div className="lg:col-span-2">
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
