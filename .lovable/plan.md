## Problem

APK me admin page open karte hi stuck ho jata hai / crash hota hai. Reason:

1. **Form typing = poori list re-render** — `Dashboard` component me hi form state hai. Har keystroke pe saari mods list + banners list + unke images dobara render hote hain. APK ke WebView me ye bahut heavy hai.
2. **Saari mod images ek saath load** — `mods.map(...)` bina `loading="lazy"` ke chalti hai. Agar 30–50 mods hain to 50 thumbnails ek saath fetch → memory spike → WebView freeze/crash.
3. **Live Firebase listener** — `useMods` + `useAds` dono `onValue` pe hain, background me update aate rahte hain aur poori list re-render karte hain jab admin type kar raha hota hai.
4. **Koi image size/decoding hint nahi** — decode main thread block karta hai.

## Fix (admin page hi, baaki app untouched)

### 1. Form ko alag component me nikaalo
`Dashboard` me se add-mod form aur ads-add form ko `AddModForm` / `AddBannerForm` child components me move karo, apna local `useState` un ke andar. Isse type karte waqt sirf form re-render hoga, list nahi.

### 2. Mods list ko memoize + lazy images
- `ModRow` naam ka `React.memo` component banao (image + title + delete).
- `<img>` pe `loading="lazy"`, `decoding="async"`, fixed `width={48} height={48}`.
- Default me sirf **latest 20 mods** dikhao, neeche "Show all (N)" button — bade libraries me 100+ thumbnails ek saath render hi nahi honge.

### 3. Banners list bhi same treatment
`AdRow` memo component, lazy image, fixed size.

### 4. Admin route pe live listener ko halka karo
Admin page pe `useMods` alag `useAdminMods` hook use kare jo `onValue` ki jagah ek `get()` (one-shot fetch) + manual refresh button use kare. Isse type karte waqt background updates list ko re-render nahi karenge. (Ya simply: admin me `useMods` ka result `useMemo` + list ko `React.memo` — no live spam.)

### 5. Chhota cleanup
- Field/Input already fine, bas `AddModForm` ke andar `useCallback` handlers.
- `screenshots` inputs ko ek chhote collapsible me daalo taki initial DOM chhota ho.

## Files touch honge

- `src/routes/admin.tsx` — split into `LoginForm`, `Dashboard`, `AddModForm`, `ModsList` + `ModRow`, `AddBannerForm`, `BannersList` + `AdRow`. Slice to top 20 with toggle.
- `src/hooks/use-mods.ts` — export additional `useAdminMods()` (one-shot `get` + manual `refresh`). Existing `useMods` unchanged so store UI same rahe.

## Result

- Admin page open hone pe sirf 20 thumbnails load → fast open, no freeze.
- Typing smooth — sirf form re-render.
- Background Firebase updates admin ko disturb nahi karenge.
- Baaki app (home, categories, favorites, download flow, website) bilkul same rahega.
- Naya APK build karna hoga (pehle wale steps se) tabhi ye fixes phone pe aayenge.
