import { cache } from "react";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const getPublicProfileData = cache(async () => {
  const rows = await db
    .select()
    .from(schema.profile)
    .orderBy(desc(schema.profile.updatedAt))
    .limit(1);

  return rows[0] ?? null;
});

export type PublicProject = typeof schema.project.$inferSelect & {
  skillNames: string[];
};

export const getPublicProjectsData = cache(async (limit = 6): Promise<PublicProject[]> => {
  const projects = await db
    .select()
    .from(schema.project)
    .orderBy(desc(schema.project.featured), desc(schema.project.updatedAt))
    .limit(limit);

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);
  const relations = await db
    .select()
    .from(schema.projectSkill)
    .where(inArray(schema.projectSkill.projectId, projectIds));

  const skillIds = Array.from(new Set(relations.map((relation) => relation.skillId)));
  const skills =
    skillIds.length > 0
      ? await db.select({ id: schema.skill.id, name: schema.skill.name }).from(schema.skill).where(inArray(schema.skill.id, skillIds))
      : [];

  const skillNameMap = new Map(skills.map((skill) => [skill.id, skill.name]));
  const groupedSkills = new Map<number, string[]>();

  for (const relation of relations) {
    const name = skillNameMap.get(relation.skillId);
    if (!name) {
      continue;
    }

    const existing = groupedSkills.get(relation.projectId) ?? [];
    existing.push(name);
    groupedSkills.set(relation.projectId, existing);
  }

  return projects.map((project) => ({
    ...project,
    skillNames: groupedSkills.get(project.id) ?? [],
  }));
});

export const getPublicPostsData = cache(async (limit = 6) => {
  return db
    .select()
    .from(schema.post)
    .where(eq(schema.post.published, true))
    .orderBy(desc(schema.post.publishedAt), desc(schema.post.updatedAt))
    .limit(limit);
});

export const getPublicSocialsData = cache(async () => {
  return db.select().from(schema.socialLink).orderBy(desc(schema.socialLink.updatedAt));
});
