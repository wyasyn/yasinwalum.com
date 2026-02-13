"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCAL_FIRST_SNAPSHOT_UPDATED } from "@/lib/local-first/events";
import { readSnapshotEnvelope } from "@/lib/local-first/mirror";
import { outboxCount } from "@/lib/local-first/outbox";
import type { LocalSnapshot } from "@/lib/local-first/types";

type OfflineDashboardProps = {
  adminEmail: string;
};

const OFFLINE_UNLOCK_KEY = "portfolio_offline_unlock";

function readOfflineUnlock() {
  const raw = window.localStorage.getItem(OFFLINE_UNLOCK_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      email?: unknown;
      updatedAt?: unknown;
    };

    if (typeof parsed.email !== "string" || typeof parsed.updatedAt !== "number") {
      return null;
    }

    return {
      email: parsed.email,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function OfflineDashboard({ adminEmail }: OfflineDashboardProps) {
  const [snapshot, setSnapshot] = useState<LocalSnapshot | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [online, setOnline] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(false);

  useEffect(() => {
    function checkAccess() {
      const unlock = readOfflineUnlock();

      if (!unlock) {
        setAllowed(false);
        return;
      }

      setAllowed(unlock.email.toLowerCase() === adminEmail.toLowerCase());
    }

    async function loadData() {
      try {
        const [envelope, pending] = await Promise.all([readSnapshotEnvelope(), outboxCount()]);
        setSnapshot(envelope?.snapshot ?? null);
        setPendingCount(pending);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
    void loadData();

    function refresh() {
      checkAccess();
      void loadData();
    }

    async function checkBackend() {
      if (!navigator.onLine) {
        setBackendReady(false);
        return;
      }

      setCheckingBackend(true);

      try {
        const response = await fetch("/api/local-first/health", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        setBackendReady(response.ok);
      } catch {
        setBackendReady(false);
      } finally {
        setCheckingBackend(false);
      }
    }

    setOnline(navigator.onLine);
    function handleOnlineStatus() {
      setOnline(navigator.onLine);
      void checkBackend();
    }

    window.addEventListener(LOCAL_FIRST_SNAPSHOT_UPDATED, refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    void checkBackend();

    const healthInterval = window.setInterval(() => {
      void checkBackend();
    }, 10000);

    return () => {
      window.removeEventListener(LOCAL_FIRST_SNAPSHOT_UPDATED, refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
      window.clearInterval(healthInterval);
    };
  }, [adminEmail]);

  const stats = useMemo(() => {
    return {
      projects: snapshot?.projects.length ?? 0,
      posts: snapshot?.posts.length ?? 0,
      skills: snapshot?.skills.length ?? 0,
      socials: snapshot?.socials.length ?? 0,
    };
  }, [snapshot]);

  if (!allowed) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Offline access unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>This browser has no offline unlock for the admin account.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Offline Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Running from local mirror data. Changes are queued and will sync automatically when online.
        </p>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline" size="sm" disabled={!backendReady}>
            <Link href="/dashboard">Try Online Dashboard</Link>
          </Button>
          <p className="self-center text-xs text-muted-foreground">
            {!online
              ? "Offline detected."
              : checkingBackend
                ? "Checking backend health..."
                : backendReady
                  ? "Backend reachable. Retry is enabled."
                  : "Network is on but backend is unreachable."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.projects}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.posts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.skills}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Socials</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.socials}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Queued</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{pendingCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {loading ? <p>Loading local data...</p> : null}
          {!loading && !snapshot?.profile ? <p className="text-muted-foreground">No local profile data yet.</p> : null}
          {snapshot?.profile ? (
            <>
              <p className="font-medium">{snapshot.profile.fullName}</p>
              <p>{snapshot.profile.headline}</p>
              {snapshot.profile.email ? <p>{snapshot.profile.email}</p> : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {snapshot?.projects.slice(0, 8).map((item) => (
              <p key={item.id}>{item.title}</p>
            ))}
            {snapshot && snapshot.projects.length === 0 ? <p className="text-muted-foreground">No local projects yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {snapshot?.posts.slice(0, 8).map((item) => (
              <p key={item.id}>{item.title}</p>
            ))}
            {snapshot && snapshot.posts.length === 0 ? <p className="text-muted-foreground">No local posts yet.</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
