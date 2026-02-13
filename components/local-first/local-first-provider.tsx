"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCAL_FIRST_SNAPSHOT_UPDATED } from "@/lib/local-first/events";
import {
  applyOptimisticMutation,
  createEmptySnapshot,
  detectConflicts,
  mergeRemoteWithLocal,
  readSnapshotEnvelope,
  writeSnapshotEnvelope,
} from "@/lib/local-first/mirror";
import { computeSnapshotHash } from "@/lib/local-first/hash";
import {
  deleteOutboxEntry,
  deserializeFormData,
  enqueueOutboxEntry,
  getOutboxEntries,
  outboxCount,
  serializeFormData,
  type OutboxEntry,
} from "@/lib/local-first/outbox";
import type { LocalSnapshotEnvelope } from "@/lib/local-first/types";

type LocalFirstProviderProps = {
  adminEmail: string;
};

const OFFLINE_UNLOCK_KEY = "portfolio_offline_unlock";
type EntryMeta = NonNullable<OutboxEntry["meta"]>;

function getAbsoluteUrl(rawAction: string | null) {
  if (!rawAction) {
    return window.location.href;
  }

  return new URL(rawAction, window.location.origin).toString();
}

function parseTargetId(formData: FormData) {
  const raw = String(formData.get("id") ?? "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function fetchRemoteSnapshot(): Promise<LocalSnapshotEnvelope | null> {
  const response = await fetch("/api/local-first/snapshot", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as LocalSnapshotEnvelope;

  if (!payload?.hash || !payload?.snapshot) {
    return null;
  }

  return payload;
}

function broadcastSnapshotUpdate() {
  window.dispatchEvent(new Event(LOCAL_FIRST_SNAPSHOT_UPDATED));
}

export function LocalFirstProvider({ adminEmail }: LocalFirstProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string>("");
  const [conflictCount, setConflictCount] = useState(0);
  const syncingRef = useRef(false);
  const router = useRouter();

  const statusText = useMemo(() => {
    const conflictText =
      conflictCount > 0 ? ` Conflict resolution applied for ${conflictCount} pending change${conflictCount === 1 ? "" : "s"}.` : "";

    if (!isOnline) {
      return `Offline mode. ${pendingCount} queued change${pendingCount === 1 ? "" : "s"}.${conflictText}`;
    }

    if (syncing) {
      return `Online. Syncing ${pendingCount} queued change${pendingCount === 1 ? "" : "s"}.${conflictText}`;
    }

    if (syncError) {
      return `${syncError}${conflictText}`;
    }

    if (pendingCount > 0) {
      return `Online. ${pendingCount} queued change${pendingCount === 1 ? "" : "s"} waiting to sync.${conflictText}`;
    }

    return `Online. Local mirror and database are in sync.${conflictText}`;
  }, [conflictCount, isOnline, pendingCount, syncError, syncing]);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await outboxCount();
      setPendingCount(count);
      return count;
    } catch {
      setPendingCount(0);
      return 0;
    }
  }, []);

  const refreshMirrorFromServer = useCallback(async (pendingEntries: OutboxEntry[]) => {
    const remoteEnvelope = await fetchRemoteSnapshot();

    if (!remoteEnvelope) {
      return;
    }

    const localEnvelope = await readSnapshotEnvelope();
    const mergedSnapshot = mergeRemoteWithLocal(
      remoteEnvelope.snapshot,
      localEnvelope?.snapshot ?? null,
      pendingEntries,
    );

    const mergedEnvelope: LocalSnapshotEnvelope = {
      hash: computeSnapshotHash(mergedSnapshot),
      snapshot: mergedSnapshot,
    };

    await writeSnapshotEnvelope(mergedEnvelope);
    broadcastSnapshotUpdate();

    const conflicts = detectConflicts(remoteEnvelope.snapshot, pendingEntries);
    setConflictCount(conflicts);
  }, []);

  const queueFormSubmission = useCallback(async (form: HTMLFormElement) => {
    const action = getAbsoluteUrl(form.getAttribute("action"));
    const formData = new FormData(form);
    const fields = serializeFormData(formData);
    const createdAt = Date.now();

    const entry: Omit<OutboxEntry, "id"> = {
      method: "POST",
      url: action,
      pagePath: window.location.pathname + window.location.search,
      createdAt,
      meta: {
        entity: (form.dataset.localEntity as EntryMeta["entity"] | undefined) ?? undefined,
        operation: (form.dataset.localOp as EntryMeta["operation"] | undefined) ?? undefined,
        targetId: parseTargetId(formData),
      },
      fields,
    };

    await enqueueOutboxEntry(entry);

    const existingEnvelope = await readSnapshotEnvelope();
    const baseSnapshot = existingEnvelope?.snapshot ?? createEmptySnapshot();
    const nextSnapshot = applyOptimisticMutation(baseSnapshot, entry as OutboxEntry);

    await writeSnapshotEnvelope({
      hash: computeSnapshotHash(nextSnapshot),
      snapshot: nextSnapshot,
    });
    broadcastSnapshotUpdate();

    await refreshPendingCount();
  }, [refreshPendingCount]);

  const syncOutbox = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) {
      return;
    }

    syncingRef.current = true;
    setSyncing(true);
    setSyncError("");

    try {
      const entries = await getOutboxEntries();

      for (const entry of entries) {
        const formData = deserializeFormData(entry.fields);
        const response = await fetch(entry.url, {
          method: entry.method,
          body: formData,
          credentials: "include",
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error(`Sync failed with status ${response.status}.`);
        }

        if (typeof entry.id === "number") {
          await deleteOutboxEntry(entry.id);
        }
      }

      await refreshPendingCount();
      const remainingEntries = await getOutboxEntries();
      await refreshMirrorFromServer(remainingEntries);
      router.refresh();
    } catch {
      setSyncError("Sync paused. Keep this tab open online to continue syncing.");
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [refreshMirrorFromServer, refreshPendingCount, router]);

  const runFullSync = useCallback(async () => {
    await refreshPendingCount();

    if (!navigator.onLine) {
      return;
    }

    const beforeSyncEntries = await getOutboxEntries();

    if (beforeSyncEntries.length > 0) {
      await syncOutbox();
      return;
    }

    await refreshMirrorFromServer(beforeSyncEntries);
  }, [refreshMirrorFromServer, refreshPendingCount, syncOutbox]);

  useEffect(() => {
    window.localStorage.setItem(
      OFFLINE_UNLOCK_KEY,
      JSON.stringify({
        email: adminEmail.toLowerCase(),
        updatedAt: Date.now(),
      }),
    );

    setIsOnline(navigator.onLine);
    void runFullSync();

    function handleOnline() {
      setIsOnline(true);
      void runFullSync();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    async function handleSubmit(event: Event) {
      const target = event.target;

      if (!(target instanceof HTMLFormElement)) {
        return;
      }

      if (target.dataset.localFirst !== "on") {
        return;
      }

      if (navigator.onLine) {
        return;
      }

      event.preventDefault();

      await queueFormSubmission(target);
      setSyncError("");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("submit", handleSubmit, true);

    const interval = window.setInterval(() => {
      void runFullSync();
    }, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("submit", handleSubmit, true);
      window.clearInterval(interval);
    };
  }, [adminEmail, queueFormSubmission, runFullSync]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-md rounded-md border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <p>{statusText}</p>
    </div>
  );
}

export function clearOfflineUnlock() {
  window.localStorage.removeItem(OFFLINE_UNLOCK_KEY);
}
