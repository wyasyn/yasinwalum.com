import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

type MinimalSession = {
  session: {
    id: string;
  };
  user: {
    email: string;
  };
};

function parseMinimalSession(value: unknown): MinimalSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybe = value as {
    session?: { id?: unknown };
    user?: { email?: unknown };
  };

  if (
    typeof maybe.session?.id !== "string" ||
    typeof maybe.user?.email !== "string"
  ) {
    return null;
  }

  return {
    session: {
      id: maybe.session.id,
    },
    user: {
      email: maybe.user.email,
    },
  };
}

export const getCurrentSession = cache(async () => {
  const requestHeaders = await headers();
  const safeHeaders = new Headers(requestHeaders);

  try {
    const cookieCache = parseMinimalSession(await getCookieCache(safeHeaders, {
      secret: env.BETTER_AUTH_SECRET,
    }));

    if (cookieCache?.user?.email) {
      return {
        session: cookieCache.session,
        user: cookieCache.user,
      };
    }
  } catch {
    // Fall through to DB-backed session lookup.
  }

  try {
    return await auth.api.getSession({
      headers: safeHeaders,
    });
  } catch {
    return null;
  }
});

export async function requireAdminSession() {
  const requestHeaders = await headers();
  const safeHeaders = new Headers(requestHeaders);
  const sessionCookie = getSessionCookie(safeHeaders);
  const hasSessionCookie = Boolean(sessionCookie);
  const cachedCookieSession = parseMinimalSession(await getCookieCache(safeHeaders, {
    secret: env.BETTER_AUTH_SECRET,
  }).catch(() => null));

  if (cachedCookieSession?.user?.email) {
    if (cachedCookieSession.user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      redirect("/login?error=unauthorized");
    }

    return {
      session: cachedCookieSession.session,
      user: cachedCookieSession.user,
    };
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;

  try {
    session = await auth.api.getSession({
      headers: safeHeaders,
    });
  } catch {
    if (hasSessionCookie) {
      redirect("/offline-dashboard");
    }
    redirect("/login");
  }

  if (!session?.user) {
    if (hasSessionCookie) {
      redirect("/offline-dashboard");
    }
    redirect("/login");
  }

  if (session.user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    redirect("/login?error=unauthorized");
  }

  return session;
}
