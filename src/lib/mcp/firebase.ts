// Server-safe Firebase Realtime Database REST fetcher for MCP tools.
// Uses the public REST endpoint (same public reads the app itself does).
const DB_URL = "https://appfor-mod-default-rtdb.firebaseio.com";

export async function fetchNode<T = unknown>(path: string): Promise<T | null> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Firebase read failed (${res.status}) for ${path}`);
  }
  const data = (await res.json()) as T | null;
  return data;
}

export function recordToArray<T extends object>(
  record: Record<string, T> | null,
): Array<T & { id: string }> {
  if (!record) return [];
  return Object.entries(record).map(([id, value]) => ({ ...value, id }));
}
