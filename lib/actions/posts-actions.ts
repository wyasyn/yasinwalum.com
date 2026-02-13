"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { createUniqueSlug } from "@/lib/dashboard-utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { postSchema } from "@/lib/validators/dashboard";

export async function createPostAction(formData: FormData) {
  await requireAdminSession();

  const payload = postSchema.parse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    markdownContent: formData.get("markdownContent"),
    published: formData.get("published") === "on",
    thumbnailUrl: formData.get("thumbnailUrl"),
  });

  const thumbnailFile = formData.get("thumbnailFile");
  const uploadedImage =
    thumbnailFile instanceof File
      ? await uploadImageToCloudinary(thumbnailFile, "portfolio/posts")
      : null;

  const now = new Date();
  const slug = await createUniqueSlug(payload.title, "post");

  await db.insert(schema.post).values({
    title: payload.title,
    slug,
    excerpt: payload.excerpt,
    markdownContent: payload.markdownContent,
    published: payload.published,
    publishedAt: payload.published ? now : null,
    thumbnailUrl: uploadedImage?.url ?? payload.thumbnailUrl ?? null,
    thumbnailPublicId: uploadedImage?.publicId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard");
}

export async function deletePostAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.post).where(eq(schema.post.id, id));

  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard");
}

export async function togglePostPublishedAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  const published = formData.get("published") === "true";

  if (!Number.isFinite(id)) {
    return;
  }

  await db
    .update(schema.post)
    .set({
      published: !published,
      publishedAt: !published ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.post.id, id));

  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard");
}
