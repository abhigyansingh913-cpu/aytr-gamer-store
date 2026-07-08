Plan: Convert AYT R STORE to Android APK with Offline Support

Goal
Wrap the existing web store as a native Android APK using Capacitor so it installs like a real app, works offline for browsing the mod list, and supports sideloading (no Play Store required).

Approach Overview
1. Capacitor wraps the built web app in a native Android WebView.
2. Firebase Realtime DB data is cached locally so the mod list loads without internet.
3. A service worker caches static assets (JS, CSS, fonts) so the UI always renders.
4. Downloads are wired through Capacitor’s native bridge for reliable APK file saving on Android.

Implementation Steps

1. Fix the AdSense Hydration Mismatch
   The AdSense script in `__root.tsx` causes a React hydration error because `<ins>` elements differ between SSR and client. Before mobile packaging, render AdSense units only on the client (inside a `useEffect` guard or a client-only wrapper component) so SSR output is stable.

2. Add Offline Data Caching for the Mod List
   Firebase Realtime Database does not have built-in offline persistence (Firestore does, but the app uses RTDB).
   - Install a lightweight IndexedDB helper (e.g., `idb-keyval`).
   - In `useMods`, on a successful Firebase `onValue` snapshot, write the mod array to IndexedDB.
   - On mount, immediately read from IndexedDB to show cached data, then let the live Firebase update refresh it.
   - Show a small "Offline mode — showing cached data" indicator when the network is unavailable.

3. Add Service Worker + PWA Manifest for Asset Caching
   - Create `public/manifest.webmanifest` with app name, theme color, icons, and `display: standalone`.
   - Add matching `<meta>` theme-color and `apple-touch-icon` links in `__root.tsx`.
   - Use `vite-plugin-pwa` with `generateSW` to produce a service worker that caches the built JS/CSS bundles with `CacheFirst` and HTML navigations with `NetworkFirst`.
   - Guard service-worker registration so it only runs in production and never inside Lovable preview frames.

4. Install & Configure Capacitor for Android
   - Add `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android` as dev dependencies.
   - Create `capacitor.config.ts` with app ID (e.g., `com.aytr.store`), app name, and `webDir` pointing to the Vite build output.
   - Run the Capacitor init and add-android commands so the Android platform folder is generated.
   - Set `server.androidScheme` to `https` and keep `cleartext` disabled for security.

5. Wire Native Downloads
   - Install `@capacitor/filesystem` and `@capacitor/http` (or `@capacitor-community/http`).
   - Replace the `window.open(downloadUrl, "_blank")` call in `DownloadAdGate` with a Capacitor-native download flow when running inside the Capacitor WebView (`Capacitor.isNativePlatform()`).
   - On Android, download the APK to the device’s Downloads folder using the native filesystem API and then trigger the system install prompt.

6. Generate Android App Icons & Splash Screen
   - Generate a square 1024×1024 app icon from the existing AYT R STORE logo.
   - Use Capacitor’s asset generation command (or provide the required PNGs in the correct `android/app/src/main/res/` density folders) for launcher icons.
   - Provide a splash screen background and centered logo for the launch experience.

7. Build & APK Export Instructions
   - Add a build script that runs `vite build && npx cap sync android`.
   - Provide a step-by-step guide for the user to build the final APK locally:
     a. Open the `android/` folder in Android Studio.
     b. Let Gradle sync.
     c. Build → Build Bundle(s) / APK(s) → Build APK(s).
   - Because the sandbox does not include the Android SDK, the final `.apk` file must be built on the user’s local machine.

What This Enables
- A real Android APK that installs from the file manager.
- Full offline browsing: open the app without internet and see the last-synced mod list.
- Faster cold start because static assets are cached and the mod list is pre-loaded from local storage.
- Native download handling so tapping "Download" saves the mod APK directly to the phone.

What Stays the Same
- Admin panel, favorites, ad banners, and UI design remain untouched.
- Online features (live Firebase updates, ads, YouTube embeds) resume automatically when connectivity returns.

Out of Scope for This Plan
- Migrating from Firebase Realtime DB to Firestore.
- Play Store publishing or app signing setup.
- Push notifications.
- iOS build (Android only).

Note
The final `.apk` generation requires Android Studio on a local computer because the sandbox cannot host the Android SDK. All code, configuration, and asset setup will be completed in the project so the user only needs to open the generated `android/` folder in Android Studio and click Build.