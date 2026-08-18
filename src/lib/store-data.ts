import { get, push, ref, remove, runTransaction, set, update } from "firebase/database";
import {
  deleteObject,
  ref as sref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { DB_PATHS } from "./constants";
import type { Ad, Category, ModInput } from "./types";

/**
 * All writes go through Firebase Realtime Database + Storage.
 * Authorization is enforced server-side by security rules (see firebase.rules.json).
 */

function getModPath(id: string) {
  return `${DB_PATHS.mods}/${id}`;
}

/** Atomic +1 to a mod's download counter (leaf path so public writes stay scoped). */
export async function incrementDownloads(id: string): Promise<number> {
  const leafRef = ref(db, `${DB_PATHS.mods}/${id}/downloads`);
  const result = await runTransaction(leafRef, (current) => {
    return (typeof current === "number" ? current : 0) + 1;
  });
  return result.snapshot.val() ?? 0;
}

export async function createMod(data: ModInput): Promise<string> {
  const modRef = push(ref(db, DB_PATHS.mods));
  await set(modRef, {
    ...data,
    downloads: 0,
    published: data.published,
    featured: data.featured,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return modRef.key as string;
}

export async function updateMod(id: string, data: ModInput): Promise<void> {
  await update(ref(db, getModPath(id)), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteMod(id: string): Promise<void> {
  await remove(ref(db, getModPath(id)));
}

export async function setModFlag(
  id: string,
  flag: "published" | "featured",
  value: boolean,
): Promise<void> {
  await update(ref(db, getModPath(id)), {
    [flag]: value,
    updatedAt: Date.now(),
  });
}

export async function clearStorageObject(path: string): Promise<void> {
  try {
    await deleteObject(sref(storage, path));
  } catch {
    /* object may not exist — safe to ignore */
  }
}

export async function uploadToStorage(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
): Promise<string> {
  const fileRef = sref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/**
 * Resumable upload with progress callback. Rejects on failure so callers can
 * surface an error and let the user retry.
 */
export function uploadToStorageResumable(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
  onProgress?: (percent: number) => void,
): UploadTask {
  const fileRef = sref(storage, path);
  const task = uploadBytesResumable(fileRef, file);
  if (onProgress) {
    task.on(
      "state_changed",
      (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => {},
    );
  }
  return task;
}

/* ---------------- Categories ---------------- */

export async function createCategory(name: string): Promise<string> {
  const catRef = push(ref(db, DB_PATHS.categories));
  await set(catRef, {
    name: name.trim(),
    order: Date.now(),
    enabled: true,
    createdAt: Date.now(),
  });
  return catRef.key as string;
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, "name" | "order" | "enabled">>,
): Promise<void> {
  await update(ref(db, `${DB_PATHS.categories}/${id}`), patch);
}

export async function deleteCategory(id: string): Promise<void> {
  await remove(ref(db, `${DB_PATHS.categories}/${id}`));
}

/* ---------------- Ads ---------------- */

export async function createAd(data: Pick<Ad, "imageUrl" | "linkUrl">): Promise<void> {
  const adRef = push(ref(db, DB_PATHS.ads));
  await set(adRef, {
    ...data,
    active: true,
    createdAt: Date.now(),
  });
}

export async function toggleAd(id: string, active: boolean): Promise<void> {
  await update(ref(db, `${DB_PATHS.ads}/${id}`), { active: !active });
}

export async function deleteAd(id: string): Promise<void> {
  await remove(ref(db, `${DB_PATHS.ads}/${id}`));
}
