export type SerializedField =
  | {
      name: string;
      kind: "text";
      value: string;
    }
  | {
      name: string;
      kind: "file";
      blob: Blob;
      fileName: string;
      fileType: string;
      lastModified: number;
    };

export type OutboxEntry = {
  id?: number;
  method: "POST";
  url: string;
  pagePath: string;
  createdAt: number;
  meta?: {
    entity?: "profile" | "skills" | "projects" | "posts" | "socials";
    operation?: "upsert" | "create" | "update" | "delete" | "toggle_featured" | "toggle_published";
    targetId?: number;
  };
  fields: SerializedField[];
};

const DB_NAME = "portfolio-local-first";
const DB_VERSION = 2;
const OUTBOX_STORE = "outbox";
const SNAPSHOT_STORE = "snapshot";

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

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OUTBOX_STORE, mode);
    const store = transaction.objectStore(OUTBOX_STORE);

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

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export async function enqueueOutboxEntry(entry: Omit<OutboxEntry, "id">) {
  const createdAt = entry.createdAt ?? Date.now();

  await withStore("readwrite", async (store) => {
    await requestToPromise(
      store.add({
        ...entry,
        createdAt,
      }),
    );
  });
}

export async function getOutboxEntries() {
  return withStore<OutboxEntry[]>("readonly", async (store) => {
    return requestToPromise(store.getAll());
  });
}

export async function deleteOutboxEntry(id: number) {
  await withStore("readwrite", async (store) => {
    await requestToPromise(store.delete(id));
  });
}

export async function outboxCount() {
  return withStore<number>("readonly", async (store) => {
    return requestToPromise(store.count());
  });
}

export function serializeFormData(formData: FormData): SerializedField[] {
  const fields: SerializedField[] = [];

  for (const [name, value] of formData.entries()) {
    if (typeof value === "string") {
      fields.push({
        name,
        kind: "text",
        value,
      });
      continue;
    }

    fields.push({
      name,
      kind: "file",
      blob: value,
      fileName: value.name,
      fileType: value.type,
      lastModified: value.lastModified,
    });
  }

  return fields;
}

export function deserializeFormData(fields: SerializedField[]) {
  const formData = new FormData();

  for (const field of fields) {
    if (field.kind === "text") {
      formData.append(field.name, field.value);
      continue;
    }

    const file = new File([field.blob], field.fileName, {
      type: field.fileType,
      lastModified: field.lastModified,
    });

    formData.append(field.name, file);
  }

  return formData;
}
