"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { profileSchema } from "@/lib/validators/dashboard";
import { requireAdminSession } from "@/lib/auth/session";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { DASHBOARD_CACHE_TAGS } from "@/lib/dashboard-queries";

export async function saveProfileAction(formData: FormData) {
  await requireAdminSession();

  const payload = profileSchema.parse({
    fullName: formData.get("fullName"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    location: formData.get("location"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    resumeUrl: formData.get("resumeUrl"),
    avatarUrl: formData.get("avatarUrl"),
  });

  const avatarFile = formData.get("avatarFile");
  const uploadedAvatar =
    avatarFile instanceof File
      ? await uploadImageToCloudinary(avatarFile, "portfolio/profile")
      : null;

  const now = new Date();

  const existing = await db.select().from(schema.profile).limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.profile)
      .set({
        fullName: payload.fullName,
        headline: payload.headline,
        bio: payload.bio,
        location: payload.location || null,
        email: payload.email || null,
        phone: payload.phone || null,
        resumeUrl: payload.resumeUrl || null,
        avatarUrl: uploadedAvatar?.url ?? payload.avatarUrl ?? null,
        avatarPublicId: uploadedAvatar?.publicId ?? null,
        updatedAt: now,
      })
      .where(eq(schema.profile.id, existing[0].id));
  } else {
    await db.insert(schema.profile).values({
      fullName: payload.fullName,
      headline: payload.headline,
      bio: payload.bio,
      location: payload.location || null,
      email: payload.email || null,
      phone: payload.phone || null,
      resumeUrl: payload.resumeUrl || null,
      avatarUrl: uploadedAvatar?.url ?? payload.avatarUrl ?? null,
      avatarPublicId: uploadedAvatar?.publicId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidateTag(DASHBOARD_CACHE_TAGS.profile, "max");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
}
