"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { socialSchema } from "@/lib/validators/dashboard";

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

  revalidatePath("/dashboard/socials");
  revalidatePath("/dashboard");
}

export async function deleteSocialAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.socialLink).where(eq(schema.socialLink.id, id));

  revalidatePath("/dashboard/socials");
  revalidatePath("/dashboard");
}
