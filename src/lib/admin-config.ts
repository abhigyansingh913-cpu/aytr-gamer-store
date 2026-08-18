/**
 * Admin authorization configuration.
 *
 * The admin password is NEVER stored in code. Admins sign in with Firebase
 * Authentication (email + password). The password lives only in Firebase.
 *
 * An account is considered an admin when ANY of these are true:
 *  1. its Firebase custom claim is `{ "admin": true }` (recommended — this is
 *     also what the security rules enforce), or
 *  2. its email is listed in VITE_ADMIN_EMAILS (comma-separated), or
 *  3. its UID exists under `admins/{uid}` in the Realtime Database.
 */

function parseEnvEmails(): string[] {
  const raw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Emails configured as admins via VITE_ADMIN_EMAILS. */
export const ADMIN_EMAILS = parseEnvEmails();

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
}

/** Whether any admin authz source is configured. */
export function hasAdminConfigured(): boolean {
  return ADMIN_EMAILS.length > 0;
}
