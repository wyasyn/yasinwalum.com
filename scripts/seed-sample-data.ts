import "dotenv/config";
import { db, schema } from "../lib/db";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function run() {
  console.log("Seeding sample dashboard content...");

  await db.delete(schema.projectSkill);
  await db.delete(schema.project);
  await db.delete(schema.post);
  await db.delete(schema.skill);
  await db.delete(schema.socialLink);
  await db.delete(schema.profile);

  const profileCreatedAt = daysAgo(120);
  const profileUpdatedAt = daysAgo(3);

  await db.insert(schema.profile).values({
    fullName: "Yasin Walum",
    headline: "Full-Stack Developer building local-first web platforms",
    bio: "I design and ship production-ready applications with Next.js, TypeScript, and PostgreSQL. I focus on reliability, good UX, and systems that continue working offline.",
    location: "Kampala, Uganda",
    email: "yasin@example.com",
    phone: "+256 700 000 000",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    resumeUrl: "https://example.com/yasin-resume.pdf",
    createdAt: profileCreatedAt,
    updatedAt: profileUpdatedAt,
  });

  const skillsData = [
    {
      name: "TypeScript",
      slug: "typescript",
      description: "Type-safe frontend and backend applications.",
      category: "Language",
      proficiency: 92,
      createdAt: daysAgo(200),
      updatedAt: daysAgo(15),
    },
    {
      name: "Next.js",
      slug: "nextjs",
      description: "Server-first applications with App Router and Server Actions.",
      category: "Frontend",
      proficiency: 90,
      createdAt: daysAgo(190),
      updatedAt: daysAgo(10),
    },
    {
      name: "React",
      slug: "react",
      description: "Interactive UI architecture and complex state handling.",
      category: "Frontend",
      proficiency: 91,
      createdAt: daysAgo(185),
      updatedAt: daysAgo(7),
    },
    {
      name: "PostgreSQL",
      slug: "postgresql",
      description: "Schema design, query tuning, and data modeling.",
      category: "Database",
      proficiency: 86,
      createdAt: daysAgo(180),
      updatedAt: daysAgo(12),
    },
    {
      name: "Drizzle ORM",
      slug: "drizzle-orm",
      description: "Type-safe SQL workflows and migrations.",
      category: "Backend",
      proficiency: 84,
      createdAt: daysAgo(165),
      updatedAt: daysAgo(9),
    },
    {
      name: "Tailwind CSS",
      slug: "tailwind-css",
      description: "Fast design systems and responsive layouts.",
      category: "Styling",
      proficiency: 88,
      createdAt: daysAgo(170),
      updatedAt: daysAgo(20),
    },
    {
      name: "Cloudinary",
      slug: "cloudinary",
      description: "Media uploads, transformations, and delivery.",
      category: "Infrastructure",
      proficiency: 79,
      createdAt: daysAgo(130),
      updatedAt: daysAgo(18),
    },
    {
      name: "Better Auth",
      slug: "better-auth",
      description: "Secure auth flows with admin-only access patterns.",
      category: "Backend",
      proficiency: 77,
      createdAt: daysAgo(100),
      updatedAt: daysAgo(5),
    },
  ] as const;

  const insertedSkills = await db
    .insert(schema.skill)
    .values(
      skillsData.map((skill) => ({
        ...skill,
        thumbnailUrl: null,
        thumbnailPublicId: null,
      })),
    )
    .returning({ id: schema.skill.id, slug: schema.skill.slug });

  const skillIdBySlug = new Map(insertedSkills.map((item) => [item.slug, item.id]));

  const projectsData = [
    {
      title: "PulseBoard Analytics",
      slug: "pulseboard-analytics",
      summary: "A SaaS analytics dashboard for distributed product teams.",
      details:
        "## Overview\nPulseBoard helps teams monitor KPI trends, traffic sources, and conversion funnels in one place.\n\n## Stack\n- Next.js\n- TypeScript\n- PostgreSQL\n\n## Outcome\nReduced reporting time by 65% for pilot customers.",
      projectType: "web-app",
      repoUrl: "https://github.com/example/pulseboard",
      liveUrl: "https://pulseboard.example.com",
      featured: true,
      skillSlugs: ["nextjs", "typescript", "postgresql", "drizzle-orm"],
      createdAt: daysAgo(90),
      updatedAt: daysAgo(2),
    },
    {
      title: "FarmLink Marketplace",
      slug: "farmlink-marketplace",
      summary: "A web platform connecting farmers with regional buyers.",
      details:
        "## Overview\nFarmLink manages listings, negotiation workflows, and delivery scheduling.\n\n## Impact\nEnabled over 300 transactions in first quarter.",
      projectType: "website",
      repoUrl: "https://github.com/example/farmlink",
      liveUrl: "https://farmlink.example.com",
      featured: true,
      skillSlugs: ["react", "nextjs", "tailwind-css", "postgresql"],
      createdAt: daysAgo(75),
      updatedAt: daysAgo(6),
    },
    {
      title: "ClinicQueue Mobile",
      slug: "clinicqueue-mobile",
      summary: "A mobile-first appointment and triage management app.",
      details:
        "## Overview\nClinicQueue digitizes check-ins and waiting lists for small clinics.\n\n## Highlights\n- Real-time queue updates\n- Staff dashboard\n- Reminder notifications",
      projectType: "mobile-app",
      repoUrl: "https://github.com/example/clinicqueue",
      liveUrl: null,
      featured: false,
      skillSlugs: ["typescript", "react", "postgresql"],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(9),
    },
    {
      title: "SyncNote Offline CMS",
      slug: "syncnote-offline-cms",
      summary: "A local-first content management dashboard with background sync.",
      details:
        "## Overview\nSyncNote demonstrates offline editing with IndexedDB mirror, queued writes, and conflict-aware reconciliation.\n\n## Key Features\n- Optimistic local mutations\n- Auto-sync on reconnect\n- Health-gated online retries",
      projectType: "web-app",
      repoUrl: "https://github.com/example/syncnote",
      liveUrl: "https://syncnote.example.com",
      featured: true,
      skillSlugs: ["nextjs", "drizzle-orm", "better-auth", "cloudinary"],
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
  ] as const;

  const insertedProjects = await db
    .insert(schema.project)
    .values(
      projectsData.map((project) => ({
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        details: project.details,
        projectType: project.projectType,
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        featured: project.featured,
        thumbnailUrl: null,
        thumbnailPublicId: null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
    )
    .returning({ id: schema.project.id, slug: schema.project.slug });

  const projectIdBySlug = new Map(insertedProjects.map((item) => [item.slug, item.id]));

  const projectSkillRows: Array<{ projectId: number; skillId: number }> = [];

  for (const project of projectsData) {
    const projectId = projectIdBySlug.get(project.slug);
    if (!projectId) {
      continue;
    }

    for (const skillSlug of project.skillSlugs) {
      const skillId = skillIdBySlug.get(skillSlug);
      if (!skillId) {
        continue;
      }

      projectSkillRows.push({ projectId, skillId });
    }
  }

  if (projectSkillRows.length > 0) {
    await db.insert(schema.projectSkill).values(projectSkillRows);
  }

  const postsData = [
    {
      title: "Designing Local-First Dashboards with Next.js",
      slug: "designing-local-first-dashboards-with-nextjs",
      excerpt: "How to combine server-first rendering with resilient offline editing.",
      markdownContent:
        "# Designing Local-First Dashboards\n\nBuilding admin tools that continue working offline requires planning around data ownership, sync queues, and conflict handling.\n\n## Practical pattern\n1. Mirror server data to IndexedDB\n2. Queue writes while offline\n3. Reconcile on reconnect",
      published: true,
      publishedAt: daysAgo(14),
      createdAt: daysAgo(14),
      updatedAt: daysAgo(13),
    },
    {
      title: "Reliable Auth Boundaries for Admin-Only Apps",
      slug: "reliable-auth-boundaries-for-admin-only-apps",
      excerpt: "A pragmatic approach to strict admin access with fallback behavior.",
      markdownContent:
        "# Reliable Auth Boundaries\n\nFor admin-only products, policy consistency is more important than flexible onboarding.\n\n## Recommendations\n- Lock dashboard access to one admin email\n- Enforce verified email\n- Disable implicit social sign-up",
      published: true,
      publishedAt: daysAgo(9),
      createdAt: daysAgo(9),
      updatedAt: daysAgo(8),
    },
    {
      title: "Improving Markdown Workflows in Portfolio CMS",
      slug: "improving-markdown-workflows-in-portfolio-cms",
      excerpt: "Tips for clean authoring, previews, and content structure.",
      markdownContent:
        "# Improving Markdown Workflows\n\nStructured markdown plus predictable components makes content editing easier for non-technical users.\n\n## Editor checklist\n- Autosave drafts\n- Live preview\n- Image upload shortcuts",
      published: false,
      publishedAt: null,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
  ] as const;

  await db.insert(schema.post).values(
    postsData.map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      markdownContent: post.markdownContent,
      published: post.published,
      publishedAt: post.publishedAt,
      thumbnailUrl: null,
      thumbnailPublicId: null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })),
  );

  await db.insert(schema.socialLink).values([
    {
      name: "GitHub",
      url: "https://github.com/yasinwalum",
      imageUrl: null,
      imagePublicId: null,
      createdAt: daysAgo(80),
      updatedAt: daysAgo(6),
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/yasinwalum",
      imageUrl: null,
      imagePublicId: null,
      createdAt: daysAgo(78),
      updatedAt: daysAgo(6),
    },
    {
      name: "X",
      url: "https://x.com/yasinwalum",
      imageUrl: null,
      imagePublicId: null,
      createdAt: daysAgo(76),
      updatedAt: daysAgo(5),
    },
    {
      name: "Portfolio",
      url: "https://yasinwalum.com",
      imageUrl: null,
      imagePublicId: null,
      createdAt: daysAgo(74),
      updatedAt: daysAgo(2),
    },
  ]);

  console.log("Sample content seed completed.");
  console.log(`- Skills: ${skillsData.length}`);
  console.log(`- Projects: ${projectsData.length}`);
  console.log(`- Posts: ${postsData.length}`);
  console.log("- Social links: 4");
  console.log("- Profile: 1");
}

run().catch((error) => {
  console.error("Sample content seed failed:");
  console.error(error);
  process.exit(1);
});
