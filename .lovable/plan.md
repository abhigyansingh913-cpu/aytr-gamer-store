Plan for APK-friendly admin redesign:

1. Rebuild the admin page as a lightweight mobile-first dashboard
   - Keep the same password login and Firebase data actions.
   - Replace heavy glass/gradient dashboard layout with flat, simple panels optimized for Android WebView.
   - Keep `StoreShell performanceMode`, but make the admin content itself avoid blur, glow, animation, and large shadows.

2. Split admin into fast sections instead of rendering everything at once
   - Add a simple tab switcher: `Mods` and `Banners`.
   - Only render the active section so APK does less work.
   - Keep forms collapsed by default with an `Add` button, so long forms do not render until needed.

3. Make lists lighter and less laggy
   - Reduce initial visible rows for APK admin.
   - Use compact rows with smaller images, fixed dimensions, and no transition effects.
   - Add manual `Load more` and `Refresh` controls.
   - Avoid loading banner/mod thumbnails in hidden sections.

4. Improve stuck-free admin actions
   - Add per-action loading states for publish/delete/toggle so the whole page does not feel frozen.
   - Disable only the clicked action while Firebase is working.
   - Keep clear toast feedback for success/failure.

5. Keep existing features unchanged
   - Admin login remains the same password-based flow.
   - Add/delete mods still works.
   - Add/toggle/delete banners still works.
   - No database migration or backend change.

Technical details:
- Main edits will be in `src/routes/admin.tsx`.
- Minor CSS support may be added in `src/styles.css` for APK/admin-lite performance classes.
- Existing `useAdminMods()` and `useAdminAds()` already use manual Firebase reads, so I will keep that pattern and focus on rendering/performance.