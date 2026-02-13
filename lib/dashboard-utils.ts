import { count, desc, eq, ilike, sql } from "drizzle-orm";
import slugify from "slugify";
import { db, schema } from "@/lib/db";

export type Pagination = {
  page: number;
  pageSize: number;
};

export function parsePagination(searchParams: {
  page?: string;
  pageSize?: string;
}): Pagination {
  const page = Number(searchParams.page ?? "1");
  const pageSize = Number(searchParams.pageSize ?? "10");

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 50 ? pageSize : 10,
  };
}

export function getOffset({ page, pageSize }: Pagination) {
  return (page - 1) * pageSize;
}

export async function createUniqueSlug(
  source: string,
  table: "project" | "post" | "skill",
): Promise<string> {
  const base = slugify(source, {
    lower: true,
    strict: true,
    trim: true,
  });

  const safeBase = base.length > 0 ? base : "item";

  if (table === "project") {
    const existing = await db
      .select({ slug: schema.project.slug })
      .from(schema.project)
      .where(ilike(schema.project.slug, `${safeBase}%`))
      .orderBy(desc(schema.project.slug));

    if (existing.length === 0) {
      return safeBase;
    }

    const nextSuffix = existing.length + 1;
    return `${safeBase}-${nextSuffix}`;
  }

  if (table === "post") {
    const existing = await db
      .select({ slug: schema.post.slug })
      .from(schema.post)
      .where(ilike(schema.post.slug, `${safeBase}%`))
      .orderBy(desc(schema.post.slug));

    if (existing.length === 0) {
      return safeBase;
    }

    const nextSuffix = existing.length + 1;
    return `${safeBase}-${nextSuffix}`;
  }

  const existing = await db
    .select({ slug: schema.skill.slug })
    .from(schema.skill)
    .where(ilike(schema.skill.slug, `${safeBase}%`))
    .orderBy(desc(schema.skill.slug));

  if (existing.length === 0) {
    return safeBase;
  }

  return `${safeBase}-${existing.length + 1}`;
}

export async function getTotalItems(
  table: "project" | "post" | "skill" | "social",
): Promise<number> {
  if (table === "project") {
    const result = await db
      .select({ value: count() })
      .from(schema.project)
      .where(sql`1=1`);
    return result[0]?.value ?? 0;
  }

  if (table === "post") {
    const result = await db
      .select({ value: count() })
      .from(schema.post)
      .where(sql`1=1`);
    return result[0]?.value ?? 0;
  }

  if (table === "skill") {
    const result = await db
      .select({ value: count() })
      .from(schema.skill)
      .where(sql`1=1`);
    return result[0]?.value ?? 0;
  }

  const result = await db
    .select({ value: count() })
    .from(schema.socialLink)
    .where(sql`1=1`);
  return result[0]?.value ?? 0;
}

export async function getProfileOrNull() {
  const profiles = await db
    .select()
    .from(schema.profile)
    .orderBy(desc(schema.profile.updatedAt))
    .limit(1);

  return profiles[0] ?? null;
}

export async function getSkillIdsForProject(projectId: number) {
  const rows = await db
    .select({ skillId: schema.projectSkill.skillId })
    .from(schema.projectSkill)
    .where(eq(schema.projectSkill.projectId, projectId));

  return rows.map((row) => row.skillId);
}
