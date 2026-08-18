# AYT R STORE — Admin & Security Setup

This document explains how to secure the admin panel. The app **never stores a
password in code** — the old hardcoded client-side password has been removed.

## How admin auth works now

1. Admin signs in with **email + password** through **Firebase Authentication**
   (provider: Email/Password).
2. The account is treated as an admin when **any** of these is true:
   - its Firebase **custom claim** is `{ "admin": true }` (recommended — this is
     what the security rules enforce), or
   - its email is listed in `VITE_ADMIN_EMAILS`, or
   - its UID exists under `admins/{uid}` in the Realtime Database.
3. Security rules reject writes from anyone who is not an authenticated admin.

## Setup steps

### 1. Enable Email/Password sign-in (Firebase Console)

- Firebase Console → **Authentication → Sign-in method**.
- Enable **Email/Password**.
- **Authentication → Users → Add user**: enter the admin email and a strong
  password. (This password is stored only in Firebase.)

### 2. Set the admin custom claim (recommended)

- **Authentication → Users** → click the admin user → ⋮ → **Edit** →
  **Custom claims**: paste `{"admin": true}` and save.
- The user must **sign out and sign back in** for the claim to take effect.

### 3. Configure the client allowlist (optional but recommended)

Copy `.env.example` to `.env.local` and set:

```
VITE_ADMIN_EMAILS=admin@yourdomain.com
```

This gates the admin UI even before claims are refreshed, and is a second
layer on top of the rules.

### 4. Publish the security rules

Replace the current rules with the files in this repo:

- Realtime Database: `firebase.rules.json`
  - **Firebase Console → Realtime Database → Rules** → paste and publish.
- Cloud Storage: `firebase.storage.rules`
  - **Firebase Console → Storage → Rules** → paste and publish.

What the rules do:

| Path | Read | Write |
| --- | --- | --- |
| `mods` / `mods/{id}` | public | admin only (`auth.token.admin === true`) |
| `mods/{id}/downloads` | public | anyone may increment by exactly +1 (download counter) |
| `categories` | public | admin only |
| `ads` | public | admin only |
| `admins` | public | **never** (bootstrap in console) |
| Storage files | public | admin only, with size caps per folder |

Notes:

- The public download counter still works without an account because the rules
  only allow `newValue === oldValue + 1` on that single field.
- The `admins/{uid}` node is write-protected; add admin UIDs from the console:
  Realtime Database → `admins` → **+** → key = the user's UID → value `true`.
- Anonymous visitors can never write items, categories, banners, or storage.

## Migrating existing data

The new data model is fully backward-compatible. Existing records in `mods`
(`title`, `description`, `category`, `imageUrl`, `screenshots`, `downloadLink`,
`version`, `size`, `youtubeUrl`, `createdAt`) keep working unchanged. New fields
(`downloads`, `featured`, `published`, `tags`, `updatedAt`, `categoryId`) are
optional and default safely when missing, so no migration script is required.

## Troubleshooting

- **"Failed to save. Check database rules."** — your account is missing the
  `admin` custom claim or `VITE_ADMIN_EMAILS` doesn't include your email.
  Re-check steps 2–3, sign out and back in.
- **Upload fails** — verify Storage rules are published and your account has the
  claim; also check the file is under the per-folder size cap.
- **Login says "This account has no admin access."** — the email is not
  authorized; add it to `VITE_ADMIN_EMAILS` or grant the custom claim.

## Reverting

To restore public write access (not recommended), publish permissive rules. The
app code itself is agnostic — it always calls the same database/storage paths.
