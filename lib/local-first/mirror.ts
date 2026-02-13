import type { OutboxEntry } from "@/lib/local-first/outbox";
import type {
  LocalEntity,
  LocalPost,
  LocalProfile,
  LocalProject,
  LocalSkill,
  LocalSnapshot,
  LocalSnapshotEnvelope,
  LocalSocial,
} from "@/lib/local-first/types";

const DB_NAME = "portfolio-local-first";
const DB_VERSION = 2;
const SNAPSHOT_STORE = "snapshot";
const OUTBOX_STORE = "outbox";
const SNAPSHOT_KEY = "current";

type SnapshotRecord = {
  key: string;
  hash: string;
  snapshot: LocalSnapshot;
  updatedAt: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE, {
          keyPath: "key",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (snapshotStore: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SNAPSHOT_STORE, mode);
    const store = transaction.objectStore(SNAPSHOT_STORE);

    callback(store)
      .then((value) => {
        transaction.oncomplete = () => {
          db.close();
          resolve(value);
        };
      })
      .catch((error) => {
        db.close();
        reject(error);
      });

    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    };
  });
}

function safeDate(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function cloneSnapshot(snapshot: LocalSnapshot): LocalSnapshot {
  return {
    profile: snapshot.profile ? { ...snapshot.profile } : null,
    skills: snapshot.skills.map((item) => ({ ...item })),
    projects: snapshot.projects.map((item) => ({ ...item, skillIds: [...item.skillIds] })),
    posts: snapshot.posts.map((item) => ({ ...item })),
    socials: snapshot.socials.map((item) => ({ ...item })),
    serverUpdatedAt: snapshot.serverUpdatedAt,
  };
}

export function createEmptySnapshot(): LocalSnapshot {
  return {
    profile: null,
    skills: [],
    projects: [],
    posts: [],
    socials: [],
    serverUpdatedAt: new Date(0).toISOString(),
  };
}

export async function readSnapshotEnvelope(): Promise<LocalSnapshotEnvelope | null> {
  return withStore("readonly", async (store) => {
    const result = await requestToPromise(store.get(SNAPSHOT_KEY) as IDBRequest<SnapshotRecord | undefined>);

    if (!result) {
      return null;
    }

    return {
      hash: result.hash,
      snapshot: result.snapshot,
    };
  });
}

export async function writeSnapshotEnvelope(envelope: LocalSnapshotEnvelope) {
  await withStore("readwrite", async (store) => {
    await requestToPromise(
      store.put({
        key: SNAPSHOT_KEY,
        hash: envelope.hash,
        snapshot: envelope.snapshot,
        updatedAt: Date.now(),
      }),
    );
  });
}

function nextTempId(items: Array<{ id: number }>) {
  const minId = items.reduce((min, item) => (item.id < min ? item.id : min), 0);
  return minId <= 0 ? minId - 1 : -1;
}

function upsertById<T extends { id: number }>(items: T[], nextItem: T) {
  const index = items.findIndex((item) => item.id === nextItem.id);

  if (index >= 0) {
    const updated = [...items];
    updated[index] = nextItem;
    return updated;
  }

  return [nextItem, ...items];
}

function deleteById<T extends { id: number }>(items: T[], id: number) {
  return items.filter((item) => item.id !== id);
}

function getTextField(fields: OutboxEntry["fields"], name: string) {
  const match = fields.find((field) => field.name === name && field.kind === "text");
  return match?.kind === "text" ? match.value : "";
}

function hasCheckedField(fields: OutboxEntry["fields"], name: string) {
  return fields.some((field) => field.name === name && field.kind === "text");
}

function getNumberFields(fields: OutboxEntry["fields"], name: string) {
  return fields
    .filter(
      (field): field is Extract<OutboxEntry["fields"][number], { kind: "text" }> =>
        field.name === name && field.kind === "text",
    )
    .map((field) => Number(field.value))
    .filter((value) => Number.isFinite(value));
}

function getTargetId(entry: OutboxEntry) {
  if (typeof entry.meta?.targetId === "number") {
    return entry.meta.targetId;
  }

  const raw = getTextField(entry.fields, "id");
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function applyOptimisticMutation(snapshot: LocalSnapshot, entry: OutboxEntry) {
  const next = cloneSnapshot(snapshot);
  const entity = entry.meta?.entity;
  const operation = entry.meta?.operation;
  const nowIso = new Date(entry.createdAt).toISOString();

  if (!entity || !operation) {
    return next;
  }

  if (entity === "profile" && operation === "upsert") {
    const currentId = next.profile?.id ?? 1;
    const profile: LocalProfile = {
      id: currentId,
      fullName: getTextField(entry.fields, "fullName"),
      headline: getTextField(entry.fields, "headline"),
      bio: getTextField(entry.fields, "bio"),
      location: getTextField(entry.fields, "location") || null,
      email: getTextField(entry.fields, "email") || null,
      phone: getTextField(entry.fields, "phone") || null,
      avatarUrl: getTextField(entry.fields, "avatarUrl") || null,
      resumeUrl: getTextField(entry.fields, "resumeUrl") || null,
      createdAt: next.profile?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    next.profile = profile;
    return next;
  }

  if (entity === "skills") {
    if (operation === "delete") {
      const targetId = getTargetId(entry);
      if (targetId !== null) {
        next.skills = deleteById(next.skills, targetId);
      }
      return next;
    }

    const targetId = getTargetId(entry);
    const id = targetId ?? nextTempId(next.skills);
    const existing = next.skills.find((item) => item.id === id);
    const skill: LocalSkill = {
      id,
      name: getTextField(entry.fields, "name") || existing?.name || "",
      slug: existing?.slug ?? `local-skill-${Math.abs(id)}`,
      description: getTextField(entry.fields, "description") || null,
      category: getTextField(entry.fields, "category") || existing?.category || "",
      proficiency: Number(getTextField(entry.fields, "proficiency") || existing?.proficiency || 50),
      thumbnailUrl: getTextField(entry.fields, "thumbnailUrl") || existing?.thumbnailUrl || null,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    next.skills = upsertById(next.skills, skill);
    return next;
  }

  if (entity === "projects") {
    if (operation === "delete") {
      const targetId = getTargetId(entry);
      if (targetId !== null) {
        next.projects = deleteById(next.projects, targetId);
      }
      return next;
    }

    const targetId = getTargetId(entry);
    const id = targetId ?? nextTempId(next.projects);
    const existing = next.projects.find((item) => item.id === id);
    const featured = operation === "toggle_featured"
      ? !Boolean(existing?.featured)
      : hasCheckedField(entry.fields, "featured");

    const project: LocalProject = {
      id,
      title: getTextField(entry.fields, "title") || existing?.title || "",
      slug: existing?.slug ?? `local-project-${Math.abs(id)}`,
      summary: getTextField(entry.fields, "summary") || existing?.summary || "",
      details: getTextField(entry.fields, "details") || existing?.details || "",
      projectType: getTextField(entry.fields, "projectType") || existing?.projectType || "website",
      repoUrl: getTextField(entry.fields, "repoUrl") || existing?.repoUrl || null,
      liveUrl: getTextField(entry.fields, "liveUrl") || existing?.liveUrl || null,
      featured,
      thumbnailUrl: getTextField(entry.fields, "thumbnailUrl") || existing?.thumbnailUrl || null,
      skillIds: operation === "toggle_featured" ? existing?.skillIds ?? [] : getNumberFields(entry.fields, "skillIds"),
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    next.projects = upsertById(next.projects, project);
    return next;
  }

  if (entity === "posts") {
    if (operation === "delete") {
      const targetId = getTargetId(entry);
      if (targetId !== null) {
        next.posts = deleteById(next.posts, targetId);
      }
      return next;
    }

    const targetId = getTargetId(entry);
    const id = targetId ?? nextTempId(next.posts);
    const existing = next.posts.find((item) => item.id === id);
    const published = operation === "toggle_published"
      ? !Boolean(existing?.published)
      : hasCheckedField(entry.fields, "published");

    const post: LocalPost = {
      id,
      title: getTextField(entry.fields, "title") || existing?.title || "",
      slug: existing?.slug ?? `local-post-${Math.abs(id)}`,
      excerpt: getTextField(entry.fields, "excerpt") || existing?.excerpt || "",
      markdownContent: getTextField(entry.fields, "markdownContent") || existing?.markdownContent || "",
      published,
      publishedAt: published ? nowIso : null,
      thumbnailUrl: getTextField(entry.fields, "thumbnailUrl") || existing?.thumbnailUrl || null,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    next.posts = upsertById(next.posts, post);
    return next;
  }

  if (entity === "socials") {
    if (operation === "delete") {
      const targetId = getTargetId(entry);
      if (targetId !== null) {
        next.socials = deleteById(next.socials, targetId);
      }
      return next;
    }

    const targetId = getTargetId(entry);
    const id = targetId ?? nextTempId(next.socials);
    const existing = next.socials.find((item) => item.id === id);
    const social: LocalSocial = {
      id,
      name: getTextField(entry.fields, "name") || existing?.name || "",
      url: getTextField(entry.fields, "url") || existing?.url || "",
      imageUrl: getTextField(entry.fields, "imageUrl") || existing?.imageUrl || null,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    next.socials = upsertById(next.socials, social);
    return next;
  }

  return next;
}

function getEntityUpdatedAt(item: { updatedAt: string }) {
  return safeDate(item.updatedAt);
}

function hasPendingFor(entity: LocalEntity, id: number, pendingEntries: OutboxEntry[]) {
  return pendingEntries.some((entry) => {
    if (entry.meta?.entity !== entity) {
      return false;
    }

    return getTargetId(entry) === id;
  });
}

function mergeEntityById<T extends { id: number; updatedAt: string }>(
  remoteItems: T[],
  localItems: T[],
  entity: LocalEntity,
  pendingEntries: OutboxEntry[],
) {
  const localMap = new Map(localItems.map((item) => [item.id, item]));
  const nextItems: T[] = [];

  for (const remote of remoteItems) {
    const local = localMap.get(remote.id);

    if (!local) {
      nextItems.push(remote);
      continue;
    }

    if (hasPendingFor(entity, remote.id, pendingEntries)) {
      nextItems.push(local);
      continue;
    }

    nextItems.push(getEntityUpdatedAt(local) > getEntityUpdatedAt(remote) ? local : remote);
  }

  for (const local of localItems) {
    if (remoteItems.some((remote) => remote.id === local.id)) {
      continue;
    }

    if (hasPendingFor(entity, local.id, pendingEntries) || local.id < 0) {
      nextItems.push(local);
    }
  }

  return nextItems;
}

export function mergeRemoteWithLocal(
  remote: LocalSnapshot,
  local: LocalSnapshot | null,
  pendingEntries: OutboxEntry[],
): LocalSnapshot {
  if (!local) {
    return remote;
  }

  const merged: LocalSnapshot = {
    profile: remote.profile,
    skills: mergeEntityById(remote.skills, local.skills, "skills", pendingEntries),
    projects: mergeEntityById(remote.projects, local.projects, "projects", pendingEntries),
    posts: mergeEntityById(remote.posts, local.posts, "posts", pendingEntries),
    socials: mergeEntityById(remote.socials, local.socials, "socials", pendingEntries),
    serverUpdatedAt: remote.serverUpdatedAt,
  };

  if (local.profile && pendingEntries.some((entry) => entry.meta?.entity === "profile")) {
    merged.profile = local.profile;
  } else if (local.profile && !remote.profile) {
    merged.profile = local.profile;
  }

  return merged;
}

function findRemoteItemUpdatedAt(remote: LocalSnapshot, entry: OutboxEntry): number {
  const entity = entry.meta?.entity;
  const targetId = getTargetId(entry);

  if (!entity || targetId === null) {
    return 0;
  }

  if (entity === "skills") {
    return safeDate(remote.skills.find((item) => item.id === targetId)?.updatedAt);
  }

  if (entity === "projects") {
    return safeDate(remote.projects.find((item) => item.id === targetId)?.updatedAt);
  }

  if (entity === "posts") {
    return safeDate(remote.posts.find((item) => item.id === targetId)?.updatedAt);
  }

  if (entity === "socials") {
    return safeDate(remote.socials.find((item) => item.id === targetId)?.updatedAt);
  }

  if (entity === "profile") {
    return safeDate(remote.profile?.updatedAt);
  }

  return 0;
}

export function detectConflicts(remote: LocalSnapshot, pendingEntries: OutboxEntry[]) {
  let conflicts = 0;

  for (const entry of pendingEntries) {
    const remoteUpdatedAt = findRemoteItemUpdatedAt(remote, entry);

    if (remoteUpdatedAt > entry.createdAt) {
      conflicts += 1;
    }
  }

  return conflicts;
}
