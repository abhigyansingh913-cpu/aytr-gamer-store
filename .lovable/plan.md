# GitHub Sync Verify + Naya APK Build Guide

Code changes (hash routing + APK me AdSense band) pehle hi apply ho chuke hain aur native bundle rebuild ho gaya hai. Ab sirf 2 kaam bache hain: (A) GitHub pe code confirm karna, (B) naya APK banana.

## Part A — GitHub connect / verify

**Agar GitHub pehle se connected hai:**
- Lovable ke changes automatically GitHub pe sync hote hain — manual push ki zaroorat nahi.
- Confirm karein: GitHub repo kholein → latest commit dekhein → in 2 files me recent change hona chahiye:
  - `src/capacitor-entry.tsx`
  - `src/lib/ads-config.ts`

**Agar GitHub connect nahi hai (mobile):**
1. Lovable me chat input ke paas **Plus (+)** menu kholein
2. **GitHub** → **Connect project**
3. GitHub pe **Authorize** karein
4. Account/organization chunein
5. **Create Repository** tap karein
6. Ek baar sync hone ke baad saara code (naye fixes ke saath) repo me aa jayega

> Note: Ek time pe ek hi GitHub account connect ho sakta hai. Free plan pe code sync/edit ke liye paid workspace chahiye.

## Part B — Naya APK build (computer pe zaroori)

APK mobile pe direct nahi banta — laptop/PC pe Android Studio chahiye.

1. **Code laayein:** GitHub repo → `Code` → `Download ZIP` (ya `git clone`), fir extract karein
2. **Terminal me project folder me jaakar:**
   ```
   npm install
   npm run build   # ya capacitor bundle build (agar alag script hai)
   npx cap sync android
   ```
3. **Android Studio me kholें:** `npx cap open android`
4. Android Studio me: **Build → Build Bundle(s)/APK(s) → Build APK(s)**
5. Ban chuka APK install karein → 404 gayab, admin panel chalega, lag remove

> Purana installed APK me fix nahi dikhega — sirf is naye APK me dikhega.

## Zaroori dhyan
- Design/feature kuch change nahi hua — same golden UI.
- Admin password aur Firebase upload waise ke waise kaam karenge.
- Website (published Lovable URL) pe koi asar nahi — ye fixes sirf APK ke liye hain.