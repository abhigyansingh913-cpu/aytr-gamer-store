# Ads system — AYT R STORE

## Zaroori clarification (padhein)
- **AdMob nahi lag sakta** — woh sirf native Android/iOS apps ke liye hai. Yeh app website hai, isliye Google ka website-ad product **AdSense** use hoga.
- AdSense ke liye aapko baad me **publisher ID (ca-pub-xxxx)** dena hoga aur Google se site approval leni hogi. Tab tak custom banners chalenge; AdSense ka code lag jayega bas ID enable karni hogi.

## Kya banega

### 1. Google AdSense support (site-wide)
- `__root.tsx` ke `<head>` me AdSense script slot add karna (publisher ID ke saath).
- Ek reusable `AdSenseUnit` component jo `<ins class="adsbygoogle">` render kare.
- Publisher ID abhi placeholder rahega; jab aap ID doge (secret ya config), tab live ho jayega.

### 2. Custom banner ads (admin controlled)
- Naya Firebase node `ads` — admin panel se banner add/delete.
- Har banner: image URL, click link (target URL), aur on/off toggle.
- Admin panel me ek naya section "Ads / Banners" — screenshot slots ki tarah URL cleaning ke saath (`cleanImageUrl`).
- Reusable `AdBanner` component jo active custom banners rotate/show kare.

### 3. Home page placement
- Home page (`index.tsx`) ke **top** par ek ad (custom banner ya AdSense).
- Home page ke **bottom** par ek aur ad.

### 4. Download se pehle interstitial ad (aapki main request)
- Jab user mod detail page (`app.$id.tsx`) par **Download** dabaye:
  - Ek full-screen ad overlay khulega (custom banner + AdSense unit).
  - Uspar countdown "Download starting in 5s…" chalega.
  - Countdown khatam hone par ya "Skip & Download" par actual download link khul jayega.
- Yeh common "ad gate before download" pattern hai — glass/gold design ke hisaab se banega.

## Technical details
- `src/lib/types.ts` — `Ad` type add (imageUrl, linkUrl, active).
- `src/hooks/use-ads.ts` — Firebase `ads` node ka realtime read.
- `src/components/store/AdBanner.tsx` — custom banner display.
- `src/components/store/AdSenseUnit.tsx` — AdSense `<ins>` unit.
- `src/components/store/DownloadAdGate.tsx` — interstitial overlay + countdown.
- `src/routes/admin.tsx` — banners manage karne ka section.
- `src/routes/index.tsx` — top/bottom ad slots.
- `src/routes/app.$id.tsx` — download button ko ad-gate se wrap karna.
- `src/routes/__root.tsx` — AdSense head script.

## Design
- Sab kuch existing white + golden glassmorphism theme me. Koi naya color nahi.
- Ads clearly "Ad / Sponsored" label ke saath dikhenge (accha UX + AdSense policy).

## Aage kya chahiye aapse
1. AdSense **publisher ID (ca-pub-...)** — jab mile tab.
2. Custom banner ke liye image URLs + kaunse link par jaye (yeh admin panel se khud daal sakoge).
