"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { createUniqueSlug } from "@/lib/dashboard-utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { skillSchema } from "@/lib/validators/dashboard";

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

  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");
}

export async function deleteSkillAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.skill).where(eq(schema.skill.id, id));

  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");
}
