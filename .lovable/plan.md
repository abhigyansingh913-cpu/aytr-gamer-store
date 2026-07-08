# Enable AdSense with your publisher ID

Aapne publisher ID diya: `pub-4394249029646548`. AdSense ke liye full client ID hota hai `ca-pub-4394249029646548` (Google `ca-` prefix add karta hai).

## Kya karunga

### 1. AdSense config activate (`src/lib/ads-config.ts`)
- `ADSENSE_CLIENT = "ca-pub-4394249029646548"` set karunga.
- Isse `ADSENSE_ENABLED` apne aap `true` ho jayega, aur:
  - `__root.tsx` ka AdSense script `<head>` me load hoga.
  - Home page top/bottom aur download gate ke `AdSenseUnit` live ads dikhayenge.

## Zaroori note (padhein)
- **Ads turant paise nahi dikhayenge** — Google ko pehle site ko **approve** karna padega (AdSense dashboard me site add + review). Approval tak `<ins>` slots khaali ya blank reh sakte hain — yeh normal hai.
- Behtar earnings ke liye AdSense dashboard me **ad units** bana ke unke **slot IDs** milte hain. Abhi code auto-format slot use karta hai. Agar aap slot IDs do to main un specific slots ko wire kar sakta hoon (optional, baad me).
- Custom banners (admin panel se) approval ka wait kiye bina abhi bhi chalte rahenge.

## Files
- `src/lib/ads-config.ts` — publisher ID paste (ek line change).

Approve karein to main ID enable kar deta hoon.
