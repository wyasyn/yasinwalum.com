import { cache } from "react";
import { unstable_cache } from "next/cache";
import { count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const DASHBOARD_CACHE_TAGS = {
  profile: "dashboard:profile",
  skills: "dashboard:skills",
  projects: "dashboard:projects",
  posts: "dashboard:posts",
  socials: "dashboard:socials",
} as const;

const CACHE_REVALIDATE_SECONDS = 60;
const CACHE_DEBUG = process.env.CACHE_DEBUG === "1";

type PageableEntity = "skills" | "projects" | "posts" | "socials";

function pageFromOffset(pageSize: number, offset: number) {
  if (pageSize <= 0) {
    return 1;
  }

  return Math.floor(offset / pageSize) + 1;
}

function pageTag(entity: PageableEntity, page: number, pageSize: number) {
  return `dashboard:${entity}:page:${page}:size:${pageSize}`;
}

function keyPart(entity: string, suffix: string) {
  return `dashboard:${entity}:${suffix}`;
}

function logCacheLookup(name: string, context?: Record<string, number | string>) {
  if (!CACHE_DEBUG) {
    return;
  }

  console.info(`[cache:lookup] ${name}`, context ?? {});
}

function logCacheFill(name: string, durationMs: number, context?: Record<string, number | string>) {
  if (!CACHE_DEBUG) {
    return;
  }

  console.info(`[cache:fill] ${name} ${durationMs.toFixed(1)}ms`, context ?? {});
}

async function withCacheLookupLog<T>(
  name: string,
  run: () => Promise<T>,
  context?: Record<string, number | string>,
) {
  const startedAt = performance.now();
  logCacheLookup(name, context);
  const result = await run();

  if (CACHE_DEBUG) {
    const duration = performance.now() - startedAt;
    console.info(`[cache:return] ${name} ${duration.toFixed(1)}ms`, context ?? {});
  }

  return result;
}

const getOverviewCached = unstable_cache(
  async () => {
    const startedAt = performance.now();

    const [projectsCount, postsCount, skillsCount, socialsCount] = await Promise.all([
      db.select({ value: count() }).from(schema.project),
      db.select({ value: count() }).from(schema.post),
      db.select({ value: count() }).from(schema.skill),
      db.select({ value: count() }).from(schema.socialLink),
    ]);

    const [latestProject] = await db
      .select({ title: schema.project.title, slug: schema.project.slug })
      .from(schema.project)
      .orderBy(desc(schema.project.createdAt))
      .limit(1);

    const [latestPost] = await db
      .select({ title: schema.post.title, slug: schema.post.slug })
      .from(schema.post)
      .orderBy(desc(schema.post.createdAt))
      .limit(1);

    logCacheFill("overview", performance.now() - startedAt);

    return {
      projectsCount: projectsCount[0]?.value ?? 0,
      postsCount: postsCount[0]?.value ?? 0,
      skillsCount: skillsCount[0]?.value ?? 0,
      socialsCount: socialsCount[0]?.value ?? 0,
      latestProject,
      latestPost,
    };
  },
  ["dashboard-overview"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [
      DASHBOARD_CACHE_TAGS.projects,
      DASHBOARD_CACHE_TAGS.posts,
      DASHBOARD_CACHE_TAGS.skills,
      DASHBOARD_CACHE_TAGS.socials,
    ],
  },
);

export const getOverviewData = cache(async () => {
  return withCacheLookupLog("overview", async () => getOverviewCached());
});

export const getSkillsPageData = cache(async (pageSize: number, offset: number) => {
  const page = pageFromOffset(pageSize, offset);
  const cacheKey = keyPart("skills-page", `${page}-size-${pageSize}`);
  const pageScopedTag = pageTag("skills", page, pageSize);

  const cached = unstable_cache(
    async () => {
      const startedAt = performance.now();
      const [totalItems, skills] = await Promise.all([
        db.select({ value: count() }).from(schema.skill),
        db
          .select()
          .from(schema.skill)
          .orderBy(desc(schema.skill.createdAt))
          .limit(pageSize)
          .offset(offset),
      ]);

      logCacheFill("skills-page", performance.now() - startedAt, { page, pageSize });

      return {
        totalItems: totalItems[0]?.value ?? 0,
        skills,
      };
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [DASHBOARD_CACHE_TAGS.skills, pageScopedTag],
    },
  );

  return withCacheLookupLog("skills-page", async () => cached(), { page, pageSize });
});

export const getPostsPageData = cache(async (pageSize: number, offset: number) => {
  const page = pageFromOffset(pageSize, offset);
  const cacheKey = keyPart("posts-page", `${page}-size-${pageSize}`);
  const pageScopedTag = pageTag("posts", page, pageSize);

  const cached = unstable_cache(
    async () => {
      const startedAt = performance.now();
      const [totalItems, posts] = await Promise.all([
        db.select({ value: count() }).from(schema.post),
        db
          .select()
          .from(schema.post)
          .orderBy(desc(schema.post.createdAt))
          .limit(pageSize)
          .offset(offset),
      ]);

      logCacheFill("posts-page", performance.now() - startedAt, { page, pageSize });

      return {
        totalItems: totalItems[0]?.value ?? 0,
        posts,
      };
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [DASHBOARD_CACHE_TAGS.posts, pageScopedTag],
    },
  );

  return withCacheLookupLog("posts-page", async () => cached(), { page, pageSize });
});

export const getSocialsPageData = cache(async (pageSize: number, offset: number) => {
  const page = pageFromOffset(pageSize, offset);
  const cacheKey = keyPart("socials-page", `${page}-size-${pageSize}`);
  const pageScopedTag = pageTag("socials", page, pageSize);

  const cached = unstable_cache(
    async () => {
      const startedAt = performance.now();
      const [totalItems, socialLinks] = await Promise.all([
        db.select({ value: count() }).from(schema.socialLink),
        db
          .select()
          .from(schema.socialLink)
          .orderBy(desc(schema.socialLink.createdAt))
          .limit(pageSize)
          .offset(offset),
      ]);

      logCacheFill("socials-page", performance.now() - startedAt, { page, pageSize });

      return {
        totalItems: totalItems[0]?.value ?? 0,
        socialLinks,
      };
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [DASHBOARD_CACHE_TAGS.socials, pageScopedTag],
    },
  );

  return withCacheLookupLog("socials-page", async () => cached(), { page, pageSize });
});

export const getProjectsPageData = cache(async (pageSize: number, offset: number) => {
  const page = pageFromOffset(pageSize, offset);
  const cacheKey = keyPart("projects-page", `${page}-size-${pageSize}`);
  const pageScopedTag = pageTag("projects", page, pageSize);

  const cached = unstable_cache(
    async () => {
      const startedAt = performance.now();

      const [totalItemsRows, projects, skills] = await Promise.all([
        db.select({ value: count() }).from(schema.project),
        db
          .select()
          .from(schema.project)
          .orderBy(desc(schema.project.createdAt))
          .limit(pageSize)
          .offset(offset),
        db.select().from(schema.skill).orderBy(desc(schema.skill.createdAt)),
      ]);

      const projectIds = projects.map((project) => project.id);

      const relations =
        projectIds.length > 0
          ? await db
              .select({ projectId: schema.projectSkill.projectId, skillId: schema.projectSkill.skillId })
              .from(schema.projectSkill)
              .where(inArray(schema.projectSkill.projectId, projectIds))
          : [];

      logCacheFill("projects-page", performance.now() - startedAt, { page, pageSize });

      return {
        totalItems: totalItemsRows[0]?.value ?? 0,
        projects,
        skills,
        relations,
      };
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [DASHBOARD_CACHE_TAGS.projects, DASHBOARD_CACHE_TAGS.skills, pageScopedTag],
    },
  );

  return withCacheLookupLog("projects-page", async () => cached(), { page, pageSize });
});

const getProfileCached = unstable_cache(
  async () => {
    const startedAt = performance.now();
    const profiles = await db
      .select()
      .from(schema.profile)
      .orderBy(desc(schema.profile.updatedAt))
      .limit(1);

    logCacheFill("profile", performance.now() - startedAt);
    return profiles[0] ?? null;
  },
  ["dashboard-profile"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.profile],
  },
);

export const getProfileData = cache(async () => {
  return withCacheLookupLog("profile", async () => getProfileCached());
});

const getSkillsCatalogCached = unstable_cache(
  async () => {
    const startedAt = performance.now();
    const skills = await db.select().from(schema.skill).orderBy(desc(schema.skill.createdAt));
    logCacheFill("skills-catalog", performance.now() - startedAt);
    return skills;
  },
  ["dashboard-skills-catalog"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.skills],
  },
);

export const getSkillsCatalog = cache(async () => {
  return withCacheLookupLog("skills-catalog", async () => getSkillsCatalogCached());
});

const getSkillIdsForProjectCached = unstable_cache(
  async (projectId: number) => {
    const startedAt = performance.now();
    const rows = await db
      .select({ skillId: schema.projectSkill.skillId })
      .from(schema.projectSkill)
      .where(eq(schema.projectSkill.projectId, projectId));

    logCacheFill("project-skill-ids", performance.now() - startedAt, { projectId });
    return rows.map((row) => row.skillId);
  },
  ["dashboard-project-skill-ids"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.projects],
  },
);

export const getSkillIdsForProjectData = cache(async (projectId: number) => {
  return withCacheLookupLog("project-skill-ids", async () => getSkillIdsForProjectCached(projectId), {
    projectId,
  });
});

const getProjectByIdCached = unstable_cache(
  async (id: number) => {
    const startedAt = performance.now();
    const [project] = await db.select().from(schema.project).where(eq(schema.project.id, id)).limit(1);
    logCacheFill("project-by-id", performance.now() - startedAt, { id });
    return project ?? null;
  },
  ["dashboard-project-by-id"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.projects],
  },
);

export const getProjectByIdData = cache(async (id: number) => {
  return withCacheLookupLog("project-by-id", async () => getProjectByIdCached(id), { id });
});

const getSkillByIdCached = unstable_cache(
  async (id: number) => {
    const startedAt = performance.now();
    const [skill] = await db.select().from(schema.skill).where(eq(schema.skill.id, id)).limit(1);
    logCacheFill("skill-by-id", performance.now() - startedAt, { id });
    return skill ?? null;
  },
  ["dashboard-skill-by-id"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.skills],
  },
);

export const getSkillByIdData = cache(async (id: number) => {
  return withCacheLookupLog("skill-by-id", async () => getSkillByIdCached(id), { id });
});

const getPostByIdCached = unstable_cache(
  async (id: number) => {
    const startedAt = performance.now();
    const [post] = await db.select().from(schema.post).where(eq(schema.post.id, id)).limit(1);
    logCacheFill("post-by-id", performance.now() - startedAt, { id });
    return post ?? null;
  },
  ["dashboard-post-by-id"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.posts],
  },
);

export const getPostByIdData = cache(async (id: number) => {
  return withCacheLookupLog("post-by-id", async () => getPostByIdCached(id), { id });
});

const getSocialByIdCached = unstable_cache(
  async (id: number) => {
    const startedAt = performance.now();
    const [social] = await db.select().from(schema.socialLink).where(eq(schema.socialLink.id, id)).limit(1);
    logCacheFill("social-by-id", performance.now() - startedAt, { id });
    return social ?? null;
  },
  ["dashboard-social-by-id"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [DASHBOARD_CACHE_TAGS.socials],
  },
);

export const getSocialByIdData = cache(async (id: number) => {
  return withCacheLookupLog("social-by-id", async () => getSocialByIdCached(id), { id });
});

export const getProjectEditParams = cache(async () => {
  try {
    const rows = await db.select({ id: schema.project.id }).from(schema.project);
    return rows.map((row) => ({ id: String(row.id) }));
  } catch {
    return [] as Array<{ id: string }>;
  }
});

export const getSkillEditParams = cache(async () => {
  try {
    const rows = await db.select({ id: schema.skill.id }).from(schema.skill);
    return rows.map((row) => ({ id: String(row.id) }));
  } catch {
    return [] as Array<{ id: string }>;
  }
});

export const getPostEditParams = cache(async () => {
  try {
    const rows = await db.select({ id: schema.post.id }).from(schema.post);
    return rows.map((row) => ({ id: String(row.id) }));
  } catch {
    return [] as Array<{ id: string }>;
  }
});

export const getSocialEditParams = cache(async () => {
  try {
    const rows = await db.select({ id: schema.socialLink.id }).from(schema.socialLink);
    return rows.map((row) => ({ id: String(row.id) }));
  } catch {
    return [] as Array<{ id: string }>;
  }
});
