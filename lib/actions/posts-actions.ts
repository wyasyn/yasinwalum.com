"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";
import { createUniqueSlug } from "@/lib/dashboard-utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { postSchema } from "@/lib/validators/dashboard";
import { DASHBOARD_CACHE_TAGS } from "@/lib/dashboard-queries";

function isChecked(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function revalidatePosts(id?: number) {
  revalidateTag(DASHBOARD_CACHE_TAGS.posts, "max");
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard");

  if (id) {
    revalidatePath(`/dashboard/blog/${id}/edit`);
  }
}

export async function createPostAction(formData: FormData) {
  await requireAdminSession();

  const payload = postSchema.parse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    markdownContent: formData.get("markdownContent"),
    published: isChecked(formData.get("published")),
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

  revalidatePosts();
}

export async function updatePostAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  const payload = postSchema.parse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    markdownContent: formData.get("markdownContent"),
    published: isChecked(formData.get("published")),
    thumbnailUrl: formData.get("thumbnailUrl"),
  });

  const thumbnailFile = formData.get("thumbnailFile");
  const uploadedImage =
    thumbnailFile instanceof File
      ? await uploadImageToCloudinary(thumbnailFile, "portfolio/posts")
      : null;

  await db
    .update(schema.post)
    .set({
      title: payload.title,
      excerpt: payload.excerpt,
      markdownContent: payload.markdownContent,
      published: payload.published,
      publishedAt: payload.published ? new Date() : null,
      thumbnailUrl: uploadedImage?.url ?? payload.thumbnailUrl ?? null,
      thumbnailPublicId: uploadedImage?.publicId ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.post.id, id));

  revalidatePosts(id);
}

export async function deletePostAction(formData: FormData) {
  await requireAdminSession();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(schema.post).where(eq(schema.post.id, id));

  revalidatePosts(id);
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

  revalidatePosts(id);
}
