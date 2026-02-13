import type { LocalSnapshot } from "@/lib/local-first/types";

export function computeSnapshotHash(snapshot: LocalSnapshot) {
  const serialized = JSON.stringify(snapshot);
  let hash = 5381;

  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash * 33) ^ serialized.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}
