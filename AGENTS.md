# AGENTS.md

Project operating rules and conventions for contributors/agents.

## Purpose

This file defines how to work in this repo consistently.
It is not required by Next.js, but strongly recommended for team/AI consistency.

## Project Stack

- Framework: Next.js (App Router)
- Language: TypeScript (strict, avoid `any`)
- UI: shadcn/ui
- Icons: `@hugeicons/react` + `@hugeicons/core-free-icons` (do not use `lucide-react`)
- Auth: Better Auth
- DB: Neon Postgres + Drizzle ORM
- Media: Cloudinary
- Styling: Tailwind CSS

## Core Rules

- Keep server-first architecture.
- Use Server Actions for mutations.
- Avoid client components unless necessary.
- Keep create/list/edit flows on separate pages.
- Use pagination for list tables.
- Hide pagination controls when not needed (small/no data).
- Use `proxy.ts` (not old `middleware.ts` pattern).
- Keep admin-only dashboard access.

## Auth Rules

- Only admin email can access dashboard.
- Credential sign-in should enforce verified email before dashboard access.
- Social sign-in must stay restricted (no open signup).
- Prefer explicit account linking for social providers when needed.

## UI Rules

- Keep shadcn visual language and tokens.
- Use semantic shadcn theme tokens/classes (`bg-card`, `text-muted-foreground`, `border-border`, etc.) instead of hardcoded hex/rgba or arbitrary color values.
- Use Hugeicons everywhere for icons.
- Sidebar is collapsible and should preserve avatar shape in collapsed mode.
- Markdown preview should render with proper typography styles.
- For any route or layout with async data fetching, always provide explicit loading UX:
  use `loading.tsx` and/or `Suspense` fallbacks so navigation never appears stalled.
- Prefer existing shadcn form primitives already used in the repo (e.g. `Select` from `components/ui/select`) instead of native `<select>` for app forms.
- Keep public dock behavior/design consistent unless explicitly requested; avoid unrequested structural changes.

## Data Rules

- Projects, blog posts, skills, socials, and profile data stored in Postgres via Drizzle.
- Slugs generated from title.
- Markdown content supported for blog and project details.
- Images uploaded through app and stored on Cloudinary URLs.

## Environment Variables

Required:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `ADMIN_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_NAME`
- `ADMIN_PASSWORD` (used by admin seed script)

## Common Commands

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`
- Lint: `pnpm lint`
- Type check: `pnpm exec tsc --noEmit`
- Drizzle generate: `pnpm db:generate`
- Drizzle migrate: `pnpm db:migrate`
- Seed admin: `pnpm db:seed-admin`

## Code Quality

- No `any` types.
- Keep components focused and small.
- Prefer clear naming over clever abstractions.
- Validate payloads with zod.
- Revalidate affected routes after mutations.

## Notes

- If mail provider envs are missing, verification/reset emails may fallback to logs in development.
- Public-facing pages (`/`, `/about`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`) should use a centered container with max width `1024px`.
- In development, service worker registration should remain disabled/unregistered to avoid stale-cache UX while building.
- Use Sonner for user feedback toasts on front-facing form mutations.
- Contact/inquiry emails should use React Email templates for structured output.
- Update this file when architecture or conventions change.
