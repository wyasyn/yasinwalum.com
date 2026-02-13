"use client";

import { useEffect, useMemo, useState } from "react";
import { LOCAL_FIRST_SNAPSHOT_UPDATED } from "@/lib/local-first/events";
import { readSnapshotEnvelope } from "@/lib/local-first/mirror";
import type { LocalEntity, LocalSnapshot } from "@/lib/local-first/types";

type OfflineDataPanelProps = {
  entity: LocalEntity | "overview";
  dbUnavailable: boolean;
};

function byUpdatedAtDesc<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function OfflineDataPanel({ entity, dbUnavailable }: OfflineDataPanelProps) {
  const [snapshot, setSnapshot] = useState<LocalSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const envelope = await readSnapshotEnvelope();
        setSnapshot(envelope?.snapshot ?? null);
      } finally {
        setLoading(false);
      }
    }

    void load();

    function refresh() {
      void load();
    }

    setOnline(navigator.onLine);
    function handleOnlineStatus() {
      setOnline(navigator.onLine);
    }

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    window.addEventListener(LOCAL_FIRST_SNAPSHOT_UPDATED, refresh);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
      window.removeEventListener(LOCAL_FIRST_SNAPSHOT_UPDATED, refresh);
    };
  }, []);

  const rows = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    if (entity === "skills") {
      return byUpdatedAtDesc(snapshot.skills).map((item) => `${item.name} (${item.category}) • ${item.proficiency}%`);
    }

    if (entity === "projects") {
      return byUpdatedAtDesc(snapshot.projects).map((item) => `${item.title} • ${item.projectType} • ${item.featured ? "Featured" : "Not featured"}`);
    }

    if (entity === "posts") {
      return byUpdatedAtDesc(snapshot.posts).map((item) => `${item.title} • ${item.published ? "Published" : "Draft"}`);
    }

    if (entity === "socials") {
      return byUpdatedAtDesc(snapshot.socials).map((item) => `${item.name} • ${item.url}`);
    }

    if (entity === "profile") {
      if (!snapshot.profile) {
        return [];
      }

      return [
        snapshot.profile.fullName,
        snapshot.profile.headline,
        snapshot.profile.email ?? "",
      ].filter(Boolean);
    }

    const overviewRows = [
      `Projects: ${snapshot.projects.length}`,
      `Posts: ${snapshot.posts.length}`,
      `Skills: ${snapshot.skills.length}`,
      `Socials: ${snapshot.socials.length}`,
    ];

    return overviewRows;
  }, [entity, snapshot]);

  const shouldShow = dbUnavailable || !online;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
      <p className="font-medium text-amber-700">Using local mirror data</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {dbUnavailable
          ? "Database is unavailable. Showing last synced local snapshot."
          : "Offline mode. Showing last synced local snapshot."}
      </p>

      {loading ? <p className="mt-2 text-xs">Loading local data...</p> : null}
      {!loading && rows.length === 0 ? <p className="mt-2 text-xs">No local data available yet.</p> : null}
      {!loading && rows.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs">
          {rows.slice(0, 8).map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
