"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { socialSchema } from "@/lib/validators/dashboard";
import { DASHBOARD_CACHE_TAGS } from "@/lib/dashboard-queries";

function revalidateSocials(id?: number) {
  revalidateTag(DASHBOARD_CACHE_TAGS.socials, "max");
  revalidatePath("/dashboard/socials");
  revalidatePath("/dashboard");

  if (id) {
    revalidatePath(`/dashboard/socials/${id}/edit`);
  }
}

export async function createSocialAction(formData: FormData) {
  await requireAdminSession();

  const payload = socialSchema.parse({
    name: formData.get("name"),
    url: formData.get("url"),
    imageUrl: formData.get("imageUrl"),
  });

  const imageFile = formData.get("imageFile");
  const uploadedImage =
    imageFile instanceof File
      ? await uploadImageToCloudinary(imageFile, "portfolio/socials")
      : null;

  const now = new Date();

  await db.insert(schema.socialLink).values({
    name: payload.name,
    url: payload.url,
    imageUrl: uploadedImage?.url ?? payload.imageUrl ?? null,
    imagePublicId: uploadedImage?.publicId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  revalidateSocials();
}

export async function updateSocialAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  const payload = socialSchema.parse({
    name: formData.get("name"),
    url: formData.get("url"),
    imageUrl: formData.get("imageUrl"),
  });

  const imageFile = formData.get("imageFile");
  const uploadedImage =
    imageFile instanceof File
      ? await uploadImageToCloudinary(imageFile, "portfolio/socials")
      : null;

  await db
    .update(schema.socialLink)
    .set({
      name: payload.name,
      url: payload.url,
      imageUrl: uploadedImage?.url ?? payload.imageUrl ?? null,
      imagePublicId: uploadedImage?.publicId ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.socialLink.id, id));

  revalidateSocials(id);
}

export async function deleteSocialAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.socialLink).where(eq(schema.socialLink.id, id));

  revalidateSocials(id);
}
