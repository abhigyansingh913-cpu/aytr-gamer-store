### Goal
Replace the existing "MC Add-ons" category with a new "APKs" category across the app, including both the public Categories page and the Admin upload dashboard.

### Plan

1. **Update category definitions**
   - Edit `src/lib/types.ts`: Replace `"MC Add-ons"` with `"APKs"` in the `CATEGORIES` array.
   - This automatically updates:
     - Category filter buttons on `/categories`
     - Category dropdown in `/admin` upload form
     - Category badge on `AppCard` components

2. **Migrate existing Firebase data**
   - Existing mods stored in Firebase Realtime Database currently have `category: "MC Add-ons"`.
   - These will no longer match the new "APKs" category.
   - Add a one-time server function (or script) to update all `mods` entries where `category === "MC Add-ons"` to `category === "APKs"`.
   - After migration, remove the temporary migration code to keep the codebase clean.

3. **Verify**
   - Build passes without TypeScript errors.
   - `/categories` shows "APKs" instead of "MC Add-ons".
   - `/admin` category dropdown lists "APKs" instead of "MC Add-ons".
   - Existing mods previously under "MC Add-ons" now appear under "APKs" filter.

### Notes
- No UI layout or styling changes needed — only the category label changes.
- The `z.enum(CATEGORIES)` validation in `admin.tsx` will automatically accept "APKs" once the array is updated.