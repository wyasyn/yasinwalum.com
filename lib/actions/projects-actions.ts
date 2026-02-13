"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { createUniqueSlug } from "@/lib/dashboard-utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { projectSchema } from "@/lib/validators/dashboard";

function parseSkillIds(formData: FormData): number[] {
  const values = formData.getAll("skillIds");

  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function isChecked(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function revalidateProjects(id?: number) {
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");

  if (id) {
    revalidatePath(`/dashboard/projects/${id}/edit`);
  }
}

export async function createProjectAction(formData: FormData) {
  await requireAdminSession();

  const payload = projectSchema.parse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    details: formData.get("details"),
    projectType: formData.get("projectType"),
    repoUrl: formData.get("repoUrl"),
    liveUrl: formData.get("liveUrl"),
    featured: isChecked(formData.get("featured")),
    thumbnailUrl: formData.get("thumbnailUrl"),
    skillIds: parseSkillIds(formData),
  });

  const thumbnailFile = formData.get("thumbnailFile");
  const uploadedImage =
    thumbnailFile instanceof File
      ? await uploadImageToCloudinary(thumbnailFile, "portfolio/projects")
      : null;

  const now = new Date();
  const slug = await createUniqueSlug(payload.title, "project");

  const inserted = await db
    .insert(schema.project)
    .values({
      title: payload.title,
      slug,
      summary: payload.summary,
      details: payload.details,
      projectType: payload.projectType,
      repoUrl: payload.repoUrl || null,
      liveUrl: payload.liveUrl || null,
      featured: payload.featured,
      thumbnailUrl: uploadedImage?.url ?? payload.thumbnailUrl ?? null,
      thumbnailPublicId: uploadedImage?.publicId ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: schema.project.id });

  const projectId = inserted[0]?.id;

  if (projectId && payload.skillIds.length > 0) {
    await db.insert(schema.projectSkill).values(
      payload.skillIds.map((skillId) => ({
        projectId,
        skillId,
      })),
    );
  }

  revalidateProjects();
}

export async function updateProjectAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  const payload = projectSchema.parse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    details: formData.get("details"),
    projectType: formData.get("projectType"),
    repoUrl: formData.get("repoUrl"),
    liveUrl: formData.get("liveUrl"),
    featured: isChecked(formData.get("featured")),
    thumbnailUrl: formData.get("thumbnailUrl"),
    skillIds: parseSkillIds(formData),
  });

  const thumbnailFile = formData.get("thumbnailFile");
  const uploadedImage =
    thumbnailFile instanceof File
      ? await uploadImageToCloudinary(thumbnailFile, "portfolio/projects")
      : null;

  await db
    .update(schema.project)
    .set({
      title: payload.title,
      summary: payload.summary,
      details: payload.details,
      projectType: payload.projectType,
      repoUrl: payload.repoUrl || null,
      liveUrl: payload.liveUrl || null,
      featured: payload.featured,
      thumbnailUrl: uploadedImage?.url ?? payload.thumbnailUrl ?? null,
      thumbnailPublicId: uploadedImage?.publicId ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.project.id, id));

  await db.delete(schema.projectSkill).where(eq(schema.projectSkill.projectId, id));

  if (payload.skillIds.length > 0) {
    await db.insert(schema.projectSkill).values(
      payload.skillIds.map((skillId) => ({
        projectId: id,
        skillId,
      })),
    );
  }

  revalidateProjects(id);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.project).where(eq(schema.project.id, id));

  revalidateProjects(id);
}

export async function toggleProjectFeaturedAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  const featured = formData.get("featured") === "true";

  if (!Number.isFinite(id)) {
    return;
  }

  await db
    .update(schema.project)
    .set({ featured: !featured, updatedAt: new Date() })
    .where(eq(schema.project.id, id));

  revalidateProjects(id);
}
