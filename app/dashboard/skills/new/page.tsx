import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSkillAction } from "@/lib/actions/skills-actions";
import { requireAdminSession } from "@/lib/auth/session";

export default async function NewSkillPage() {
  await requireAdminSession();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Skill</h1>
          <p className="text-sm text-muted-foreground">Add a new skill for your portfolio.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/skills">Back to skills</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Form</CardTitle>
          <CardDescription>Use either URL or upload an image to Cloudinary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-local-first="on" data-local-entity="skills" data-local-op="create" action={createSkillAction} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proficiency">Proficiency (1-100)</Label>
              <Input id="proficiency" name="proficiency" type="number" min={1} max={100} defaultValue={70} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="thumbnailFile">Upload Thumbnail (optional)</Label>
              <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
            </div>

            <div className="lg:col-span-2">
              <Button type="submit">Create Skill</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
