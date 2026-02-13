import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

export const profileSchema = z.object({
  fullName: nonEmpty,
  headline: nonEmpty,
  bio: nonEmpty,
  location: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  resumeUrl: z.string().trim().url().optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const skillSchema = z.object({
  name: nonEmpty,
  description: z.string().trim().optional(),
  category: nonEmpty,
  proficiency: z.coerce.number().int().min(1).max(100),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const projectSchema = z.object({
  title: nonEmpty,
  summary: nonEmpty,
  details: nonEmpty,
  projectType: z.enum(["mobile-app", "website", "web-app"]),
  repoUrl: z.string().trim().url().optional().or(z.literal("")),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  featured: z.boolean(),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
  skillIds: z.array(z.number().int()).default([]),
});

export const postSchema = z.object({
  title: nonEmpty,
  excerpt: nonEmpty,
  markdownContent: nonEmpty,
  published: z.boolean(),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const socialSchema = z.object({
  name: nonEmpty,
  url: z.string().trim().url(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
});
