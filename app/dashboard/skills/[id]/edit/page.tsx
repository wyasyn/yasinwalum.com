import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSkillAction } from "@/lib/actions/skills-actions";
import { db, schema } from "@/lib/db";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSkillPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [skill] = await db.select().from(schema.skill).where(eq(schema.skill.id, id)).limit(1);

  if (!skill) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Skill</h1>
          <p className="text-sm text-muted-foreground">Update metadata and thumbnail.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/skills">Back to skills</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Form</CardTitle>
          <CardDescription>Changes are saved immediately when submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="skills" data-local-op="update" action={updateSkillAction} className="grid gap-6 lg:grid-cols-2">
            <input type="hidden" name="id" value={skill.id} />

            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input id="name" name="name" defaultValue={skill.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={skill.category} required />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={skill.description ?? ""} rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proficiency">Proficiency (1-100)</Label>
              <Input
                id="proficiency"
                name="proficiency"
                type="number"
                min={1}
                max={100}
                defaultValue={skill.proficiency}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={skill.thumbnailUrl ?? ""} />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="thumbnailFile">Upload New Thumbnail (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <div className="lg:col-span-2">
              <Button type="submit">Update Skill</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
