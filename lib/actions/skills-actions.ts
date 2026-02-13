"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { createUniqueSlug } from "@/lib/dashboard-utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { skillSchema } from "@/lib/validators/dashboard";
import { DASHBOARD_CACHE_TAGS } from "@/lib/dashboard-queries";

function revalidateSkills(id?: number) {
  revalidateTag(DASHBOARD_CACHE_TAGS.skills, "max");
  revalidateTag(DASHBOARD_CACHE_TAGS.projects, "max");
  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");

  if (id) {
    revalidatePath(`/dashboard/skills/${id}/edit`);
  }
}

export async function createSkillAction(formData: FormData) {
  await requireAdminSession();

  const payload = skillSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    proficiency: formData.get("proficiency"),
    thumbnailUrl: formData.get("thumbnailUrl"),
  });

  const thumbnailFile = formData.get("thumbnailFile");
  const uploadedImage =
    thumbnailFile instanceof File
      ? await uploadImageToCloudinary(thumbnailFile, "portfolio/skills")
      : null;

  const now = new Date();
  const slug = await createUniqueSlug(payload.name, "skill");

  await db.insert(schema.skill).values({
    name: payload.name,
    slug,
    description: payload.description || null,
    category: payload.category,
    proficiency: payload.proficiency,
    thumbnailUrl: uploadedImage?.url ?? payload.thumbnailUrl ?? null,
    thumbnailPublicId: uploadedImage?.publicId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  revalidateSkills();
}

export async function updateSkillAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  const payload = skillSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    proficiency: formData.get("proficiency"),
    thumbnailUrl: formData.get("thumbnailUrl"),
  });

  const thumbnailFile = formData.get("thumbnailFile");
  const uploadedImage =
    thumbnailFile instanceof File
      ? await uploadImageToCloudinary(thumbnailFile, "portfolio/skills")
      : null;

  await db
    .update(schema.skill)
    .set({
      name: payload.name,
      description: payload.description || null,
      category: payload.category,
      proficiency: payload.proficiency,
      thumbnailUrl: uploadedImage?.url ?? payload.thumbnailUrl ?? null,
      thumbnailPublicId: uploadedImage?.publicId ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.skill.id, id));

  revalidateSkills(id);
}

export async function deleteSkillAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.skill).where(eq(schema.skill.id, id));

  revalidateSkills(id);
}
