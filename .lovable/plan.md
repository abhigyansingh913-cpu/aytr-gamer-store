# AYT R STORE — Build Plan

A premium, mobile-first mod/APK store with a white background, golden glassmorphism UI, smooth animations, and Firebase-powered dynamic content. Built in this project's React + TanStack Start stack (styled to look exactly like the requested pure-HTML concept).

## Visual Design
- **Palette:** pure white backgrounds; golden accents (`#D4AF37` / `#F5D67B` glow), soft translucent gold glass surfaces with blur, subtle gold borders and glowing shadows.
- **Glassmorphism:** frosted cards/panels using `backdrop-blur` + translucent gold tint + inner/outer gold glow. Fully rounded corners (`rounded-2xl`/`rounded-3xl`).
- **Typography:** Outfit for headings, Figtree for body (loaded via @fontsource).
- **Motion:** fade-in, scale-in, hover glow/scale on cards, smooth page transitions, animated splash loading bar.
- All colors added as semantic tokens in `src/styles.css` (no hardcoded color classes in components).

## Firebase Integration
Uses the exact config you provided (client-side publishable keys — safe in code).
- **Realtime Database** stores all mods/apps: `title, description, category, imageUrl, screenshots[], downloadLink, version, size, createdAt`.
- **Authentication (email/password)** secures the admin panel — no credentials in the frontend code.
- **Storage:** not used — images/screenshots are provided as URLs (per your choice).
- Content renders dynamically: home grid, detail pages, and categories all read live from the database.

### Secure admin auth
Instead of hardcoding the username/password (which would be visible in the app), admin access uses real Firebase Authentication:
- The admin logs in through a glass popup in Settings using an email + password Firebase account.
- I'll wire the login to a Firebase Auth account. You'll create that admin account once in the Firebase console (Authentication → Add user). I'll document the exact steps; recommended email/password can be based on your provided credentials (e.g. `landlordop@aytrstore.app`).
- Database security rules: **public read**, **write only for authenticated admin**, so nobody can inject/edit content without logging in.

## Pages & Structure
- **Splash / loading** (`/`): centered logo (your ibb.co image), animated golden loading bar, white bg with gold glow, then smooth fade into home. Shown once per session.
- **Home**: responsive grid of golden glass square cards — thumbnail, title, small Open button, hover glow + scale.
- **Detail** (`/app/$id`): large preview image, description, version, category, screenshots gallery, download size, and a final download button that redirects to the admin-provided download link.
- **Categories** (`/categories`): tabs/sections for Texture Packs, Skins, MC Add-ons, Add-ons, MC Templates; each uploaded item auto-appears under its selected category.
- **Favorites** (`/favorites`): save/unsave mods; stored in browser `localStorage`; heart toggle on cards and detail page.
- **Settings** (`/settings`): premium glass page with YouTube, Telegram, and Support buttons (your links), plus a hidden Admin entry that opens the secure login popup.
- **Admin dashboard** (protected route, only after Firebase login): upload form with App title, Description, Category selector, Image URL, Download link, Screenshots (URLs), Version, File size — plus a list to edit/delete existing entries. All writes go to Realtime Database.
- **Floating bottom navigation**: glassmorphism pill with three icons only — Settings, Favorites, Categories.

## Technical Notes
- New routes under `src/routes/` (`index` splash+home, `app.$id`, `categories`, `favorites`, `settings`, `_admin` protected layout + dashboard).
- `src/lib/firebase.ts` initializes Firebase (`firebase` npm package) with your config.
- Data access via a small hook/query layer reading Realtime DB; favorites via a `localStorage` hook.
- Admin route guarded by Firebase auth state (redirects to Settings login if not authenticated).
- Input validation with zod on the admin form; URLs sanitized/encoded before use.
- `src/routes/__root.tsx` head updated with real title/description/OG tags for "AYT R STORE".
- Icons via `lucide-react`; toasts via existing `sonner`.

## What I need from you (after build)
- Create the admin user in Firebase console (Authentication → Users → Add user). I'll give exact instructions in the build.
- Confirm Realtime Database is enabled in the Firebase console (it appears to be, given the `databaseURL`).

Once you approve, I'll implement everything and verify the UI and Firebase reads/writes.