### Goal
Upgrade the admin upload form: replace the single screenshot textarea with two dedicated screenshot URL slots, and add one YouTube video link slot related to the mod. The YouTube video then plays on the mod detail page.

### Changes

1. **`src/lib/types.ts`**
   - Add an optional `youtubeUrl?: string` field to the `Mod` interface (so existing mods without a video still work).

2. **`src/routes/admin.tsx`** (admin panel)
   - Replace the current "Screenshot URLs (textarea)" field with **two separate input slots**: "Screenshot URL 1" and "Screenshot URL 2".
   - Add **one YouTube video link** input slot: "YouTube video link (optional)".
   - Update the empty form state, the Zod validation schema, and the submit handler:
     - Combine the two screenshot inputs into the `screenshots` array (skipping any left blank).
     - Save `youtubeUrl` with the mod (validated as an optional URL).
   - No other admin fields change.

3. **`src/routes/app.$id.tsx`** (mod detail page)
   - If the mod has a `youtubeUrl`, show an embedded YouTube player (or a "Watch on YouTube" section) below the screenshots, so the added link is actually usable.

### Notes
- Screenshots stay stored as an array, so the existing screenshot carousel on the detail page keeps working unchanged.
- `youtubeUrl` is optional — old mods and mods without a video are unaffected.
- No styling/layout changes elsewhere and no other admin fields touched.
