# APK Fixes: 404, Admin Panel & Lag

Your three APK problems have one shared cause plus one extra cause. Here's what's happening and how I'll fix each.

## What's going wrong

**1. "404 Page not found" (and Admin panel not opening)**
The APK loads the app from an internal `https://localhost` file server. The app currently uses normal URL paths (`/admin`, `/categories`, etc.). When the WebView tries to open a path like `/admin`, the local file server looks for a real `/admin` file, doesn't find one, and shows 404. This is why the Admin panel "doesn't work" — tapping it just lands on the 404 page. It's the same root cause for every non-home page inside the APK.

**Fix:** Use **hash-based routing** for the Capacitor build only (URLs become `#/admin`, `#/categories`, etc.). Hash routes never hit the file server, so every page — including Admin — opens correctly. The website build stays exactly as it is (normal URLs, good for SEO).

**2. Too much lag**
The app loads Google AdSense inside the APK. AdSense is built for websites in a browser, not for an APK WebView — it keeps trying to load ads, injects hidden elements, and repeatedly retries, which causes the lag and stutter you're feeling. AdSense also can't legitimately earn inside a sideloaded APK.

**Fix:** Automatically **disable AdSense when the app runs as a native APK** (detected via the Capacitor runtime). Your own custom banners from the Admin panel still show. The website version keeps AdSense unchanged.

## Technical changes

1. **`src/capacitor-entry.tsx`** — create the router with `createHashHistory()` so the native app uses hash routing. (The SSR/web `getRouter` in `src/router.tsx` stays on browser history.)
2. **`src/lib/ads-config.ts`** — add a native-app check so `ADSENSE_ENABLED` is `false` when running inside the Capacitor APK (keeps AdSense on for the website).
3. Rebuild the Capacitor bundle (`capacitor-build/`) so the updated logic ships in the next APK.

## After the fix — how to get the working APK

1. I apply the changes and rebuild the Capacitor web bundle.
2. On your computer: pull the latest code (via GitHub), run `npx cap sync android`, open in Android Studio, and build a fresh APK.
3. Install the new APK — Admin panel opens, no 404, and the lag is gone.

## Notes
- No design or feature changes — same UI, same golden theme.
- Admin login/password and Firebase uploads are unchanged; they'll work once routing is fixed.
- The website (published Lovable URL) is unaffected by these APK-only changes.