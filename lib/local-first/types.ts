export type LocalEntity = "profile" | "skills" | "projects" | "posts" | "socials";

export type LocalProfile = {
  id: number;
  fullName: string;
  headline: string;
  bio: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  updatedAt: string;
  createdAt: string;
};

export type LocalSkill = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  proficiency: number;
  thumbnailUrl: string | null;
  updatedAt: string;
  createdAt: string;
};

export type LocalProject = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  details: string;
  projectType: string;
  repoUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  thumbnailUrl: string | null;
  skillIds: number[];
  updatedAt: string;
  createdAt: string;
};

export type LocalPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  markdownContent: string;
  published: boolean;
  publishedAt: string | null;
  thumbnailUrl: string | null;
  updatedAt: string;
  createdAt: string;
};

export type LocalSocial = {
  id: number;
  name: string;
  url: string;
  imageUrl: string | null;
  updatedAt: string;
  createdAt: string;
};

export type LocalSnapshot = {
  profile: LocalProfile | null;
  skills: LocalSkill[];
  projects: LocalProject[];
  posts: LocalPost[];
  socials: LocalSocial[];
  serverUpdatedAt: string;
};

export type LocalSnapshotEnvelope = {
  hash: string;
  snapshot: LocalSnapshot;
};
