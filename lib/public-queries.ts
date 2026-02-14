import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const PUBLIC_CACHE_REVALIDATE_SECONDS = 300;

export const PUBLIC_CACHE_TAGS = {
  profile: "public:profile",
  projects: "public:projects",
  posts: "public:posts",
  socials: "public:socials",
} as const;

export type PublicProject = typeof schema.project.$inferSelect & {
  skillNames: string[];
};
export type PublicPost = typeof schema.post.$inferSelect;

type PublicProjectsFilters = {
  featured?: boolean;
  projectType?: string;
};

type PublicPostsFilters = {
  query?: string;
};

async function hydrateProjectsWithSkills(
  projects: Array<typeof schema.project.$inferSelect>,
): Promise<PublicProject[]> {
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
      ? await db
          .select({ id: schema.skill.id, name: schema.skill.name })
          .from(schema.skill)
          .where(inArray(schema.skill.id, skillIds))
      : [];

  const skillNameMap = new Map(skills.map((skill) => [skill.id, skill.name]));
  const groupedSkills = new Map<number, string[]>();

  for (const relation of relations) {
    const skillName = skillNameMap.get(relation.skillId);
    if (!skillName) {
      continue;
    }

    const existing = groupedSkills.get(relation.projectId) ?? [];
    existing.push(skillName);
    groupedSkills.set(relation.projectId, existing);
  }

  return projects.map((project) => ({
    ...project,
    skillNames: groupedSkills.get(project.id) ?? [],
  }));
}

const getPublicProfileDataCached = unstable_cache(
  async () => {
    const rows = await db
      .select()
      .from(schema.profile)
      .orderBy(desc(schema.profile.updatedAt))
      .limit(1);

    return rows[0] ?? null;
  },
  ["public-profile"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.profile],
  },
);

export const getPublicProfileData = cache(async () => {
  return getPublicProfileDataCached();
});

const getPublicProjectsDataCached = unstable_cache(
  async (limit: number) => {
    const projects = await db
      .select()
      .from(schema.project)
      .orderBy(desc(schema.project.featured), desc(schema.project.updatedAt))
      .limit(limit);

    return hydrateProjectsWithSkills(projects);
  },
  ["public-projects"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

export const getPublicProjectsData = cache(async (limit = 6): Promise<PublicProject[]> => {
  return getPublicProjectsDataCached(limit);
});

type PublicProjectsPageData = {
  projects: PublicProject[];
  totalItems: number;
  totalPages: number;
};

const getPublicProjectsPageDataCached = unstable_cache(
  async (page: number, pageSize: number): Promise<PublicProjectsPageData> => {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 8;
    const offset = (safePage - 1) * safePageSize;

    const [totalRows, projects] = await Promise.all([
      db.select({ value: count() }).from(schema.project),
      db
        .select()
        .from(schema.project)
        .orderBy(desc(schema.project.featured), desc(schema.project.updatedAt))
        .limit(safePageSize)
        .offset(offset),
    ]);

    const totalItems = totalRows[0]?.value ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

    return {
      projects: await hydrateProjectsWithSkills(projects),
      totalItems,
      totalPages,
    };
  },
  ["public-projects-page"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

export const getPublicProjectsPageData = cache(async (page: number, pageSize: number) => {
  return getPublicProjectsPageDataCached(page, pageSize);
});

const getPublicPostsDataCached = unstable_cache(
  async (limit: number) => {
    return db
      .select()
      .from(schema.post)
      .where(eq(schema.post.published, true))
      .orderBy(desc(schema.post.publishedAt), desc(schema.post.updatedAt))
      .limit(limit);
  },
  ["public-posts"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.posts],
  },
);

export const getPublicPostsData = cache(async (limit = 6) => {
  return getPublicPostsDataCached(limit);
});

type PublicPostsPageData = {
  posts: PublicPost[];
  totalItems: number;
  totalPages: number;
};

function toSafeLikeTerm(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  return `%${normalized}%`;
}

function getProjectsWhereClause(filters?: PublicProjectsFilters): SQL | undefined {
  if (!filters) {
    return undefined;
  }

  const conditions: SQL[] = [];

  if (filters.featured !== undefined) {
    conditions.push(eq(schema.project.featured, filters.featured));
  }

  if (filters.projectType) {
    conditions.push(eq(schema.project.projectType, filters.projectType));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function getPostsWhereClause(filters?: PublicPostsFilters): SQL {
  const likeTerm = toSafeLikeTerm(filters?.query);
  const conditions: SQL[] = [eq(schema.post.published, true)];

  if (likeTerm) {
    conditions.push(
      or(
        ilike(schema.post.title, likeTerm),
        ilike(schema.post.excerpt, likeTerm),
        ilike(schema.post.markdownContent, likeTerm),
      )!,
    );
  }

  return and(...conditions)!;
}

const getPublicProjectBySlugCached = unstable_cache(
  async (slug: string): Promise<PublicProject | null> => {
    const [project] = await db.select().from(schema.project).where(eq(schema.project.slug, slug)).limit(1);
    if (!project) {
      return null;
    }

    const [hydrated] = await hydrateProjectsWithSkills([project]);
    return hydrated ?? null;
  },
  ["public-project-by-slug"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

export const getPublicProjectBySlug = cache(async (slug: string) => {
  return getPublicProjectBySlugCached(slug);
});

const getPublicProjectSlugsCached = unstable_cache(
  async () => {
    return db.select({ slug: schema.project.slug }).from(schema.project);
  },
  ["public-project-slugs"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

export const getPublicProjectSlugs = cache(async () => {
  return getPublicProjectSlugsCached();
});

const getPublicProjectsPageDataWithFiltersCached = unstable_cache(
  async (page: number, pageSize: number, filters?: PublicProjectsFilters): Promise<PublicProjectsPageData> => {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 8;
    const offset = (safePage - 1) * safePageSize;
    const whereClause = getProjectsWhereClause(filters);

    const totalRowsQuery = db.select({ value: count() }).from(schema.project);
    const projectsQuery = db
      .select()
      .from(schema.project)
      .orderBy(desc(schema.project.featured), desc(schema.project.updatedAt))
      .limit(safePageSize)
      .offset(offset);

    const [totalRows, projects] = await Promise.all([
      whereClause ? totalRowsQuery.where(whereClause) : totalRowsQuery,
      whereClause ? projectsQuery.where(whereClause) : projectsQuery,
    ]);

    const totalItems = totalRows[0]?.value ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

    return {
      projects: await hydrateProjectsWithSkills(projects),
      totalItems,
      totalPages,
    };
  },
  ["public-projects-page-with-filters"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

export const getPublicProjectsPageDataWithFilters = cache(
  async (page: number, pageSize: number, filters?: PublicProjectsFilters) => {
    return getPublicProjectsPageDataWithFiltersCached(page, pageSize, filters);
  },
);

const getPublicPostBySlugCached = unstable_cache(
  async (slug: string): Promise<PublicPost | null> => {
    const [post] = await db
      .select()
      .from(schema.post)
      .where(and(eq(schema.post.slug, slug), eq(schema.post.published, true)))
      .limit(1);

    return post ?? null;
  },
  ["public-post-by-slug"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.posts],
  },
);

export const getPublicPostBySlug = cache(async (slug: string) => {
  return getPublicPostBySlugCached(slug);
});

const getPublicPostSlugsCached = unstable_cache(
  async () => {
    return db.select({ slug: schema.post.slug }).from(schema.post).where(eq(schema.post.published, true));
  },
  ["public-post-slugs"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.posts],
  },
);

export const getPublicPostSlugs = cache(async () => {
  return getPublicPostSlugsCached();
});

const getPublicPostsPageDataCached = unstable_cache(
  async (page: number, pageSize: number, filters?: PublicPostsFilters): Promise<PublicPostsPageData> => {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 8;
    const offset = (safePage - 1) * safePageSize;
    const whereClause = getPostsWhereClause(filters);

    const [totalRows, posts] = await Promise.all([
      db.select({ value: count() }).from(schema.post).where(whereClause),
      db
        .select()
        .from(schema.post)
        .where(whereClause)
        .orderBy(desc(schema.post.publishedAt), desc(schema.post.updatedAt))
        .limit(safePageSize)
        .offset(offset),
    ]);

    const totalItems = totalRows[0]?.value ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

    return {
      posts,
      totalItems,
      totalPages,
    };
  },
  ["public-posts-page"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.posts],
  },
);

export const getPublicPostsPageData = cache(
  async (page: number, pageSize: number, filters?: PublicPostsFilters) => {
    return getPublicPostsPageDataCached(page, pageSize, filters);
  },
);

const getPublicSocialsDataCached = unstable_cache(
  async () => {
    return db.select().from(schema.socialLink).orderBy(desc(schema.socialLink.updatedAt));
  },
  ["public-socials"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.socials],
  },
);

export const getPublicSocialsData = cache(async () => {
  return getPublicSocialsDataCached();
});
