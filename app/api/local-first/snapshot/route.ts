import { desc, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { computeSnapshotHash } from "@/lib/local-first/hash";
import type { LocalSnapshot } from "@/lib/local-first/types";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [profiles, skills, projects, posts, socials] = await Promise.all([
      db.select().from(schema.profile).orderBy(desc(schema.profile.updatedAt)).limit(1),
      db.select().from(schema.skill).orderBy(desc(schema.skill.updatedAt)),
      db.select().from(schema.project).orderBy(desc(schema.project.updatedAt)),
      db.select().from(schema.post).orderBy(desc(schema.post.updatedAt)),
      db.select().from(schema.socialLink).orderBy(desc(schema.socialLink.updatedAt)),
    ]);

    const projectIds = projects.map((item) => item.id);
    const relations =
      projectIds.length > 0
        ? await db
            .select({ projectId: schema.projectSkill.projectId, skillId: schema.projectSkill.skillId })
            .from(schema.projectSkill)
            .where(inArray(schema.projectSkill.projectId, projectIds))
        : [];

    const relationMap = new Map<number, number[]>();

    for (const relation of relations) {
      const existing = relationMap.get(relation.projectId) ?? [];
      existing.push(relation.skillId);
      relationMap.set(relation.projectId, existing);
    }

    const snapshot: LocalSnapshot = {
      profile: profiles[0]
        ? {
            id: profiles[0].id,
            fullName: profiles[0].fullName,
            headline: profiles[0].headline,
            bio: profiles[0].bio,
            location: profiles[0].location,
            email: profiles[0].email,
            phone: profiles[0].phone,
            avatarUrl: profiles[0].avatarUrl,
            resumeUrl: profiles[0].resumeUrl,
            updatedAt: profiles[0].updatedAt.toISOString(),
            createdAt: profiles[0].createdAt.toISOString(),
          }
        : null,
      skills: skills.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        category: item.category,
        proficiency: item.proficiency,
        thumbnailUrl: item.thumbnailUrl,
        updatedAt: item.updatedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
      projects: projects.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        details: item.details,
        projectType: item.projectType,
        repoUrl: item.repoUrl,
        liveUrl: item.liveUrl,
        featured: item.featured,
        thumbnailUrl: item.thumbnailUrl,
        skillIds: relationMap.get(item.id) ?? [],
        updatedAt: item.updatedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
      posts: posts.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        markdownContent: item.markdownContent,
        published: item.published,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
        thumbnailUrl: item.thumbnailUrl,
        updatedAt: item.updatedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
      socials: socials.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        imageUrl: item.imageUrl,
        updatedAt: item.updatedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
      serverUpdatedAt: new Date().toISOString(),
    };

    const hash = computeSnapshotHash(snapshot);

    return NextResponse.json(
      {
        hash,
        snapshot,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error: "Snapshot unavailable",
      },
      { status: 503 },
    );
  }
}
