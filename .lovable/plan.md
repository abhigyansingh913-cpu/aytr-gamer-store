### Problem
Screenshots mod detail page par show nahi ho rahe kyunki admin form mein screenshot slots mein direct image URL ki jagah ibb.co ka poora HTML embed snippet paste hua hai (e.g. `https://ibb.co/xxx"><img src="https://i.ibb.co/xxx/file.jpg" ...></a>`). Yeh `new URL()` validation paar kar gaya aur galat form mein Firebase mein save ho gaya, isliye `<img src>` broken hai (naturalWidth 0). Thumbnail theek hai kyunki wahan clean direct link tha.

### Goal
Paste kiye gaye HTML embed code se asli direct image link automatically nikaalna, taaki naye entries clean save hon aur pehle se save galat entries bhi sahi render hon.

### Changes

1. **`src/lib/utils.ts`** — Ek helper `cleanImageUrl(raw: string)` add karna:
   - Agar string mein `<img ... src="...">` ho to us `src` ko extract kare.
   - Warna string mein pehla `https://...(jpg|jpeg|png|webp|gif|avif)` match nikaale.
   - Warna trimmed string wapas kare.
   - Trailing quote/markup characters strip kare.

2. **`src/routes/admin.tsx`** (admin panel)
   - Submit par har screenshot input, `imageUrl` (thumbnail) aur `downloadLink` ko `cleanImageUrl` se saaf karke phir validate/save karna — future entries clean rahenge.

3. **`src/routes/app.$id.tsx`** (mod detail page)
   - Render karte waqt har screenshot aur thumbnail par `cleanImageUrl` apply karna, taaki pehle se save galat URLs bhi sahi dikhein bina Firebase data manually theek kiye.

4. **`src/components/store/AppCard.tsx`**
   - Card thumbnail par bhi `cleanImageUrl` apply karna consistency ke liye.

### Notes
- Koi layout/design change nahi — sirf URL cleaning.
- Existing broken mod (jo abhi khula hai) migration ke bina hi theek dikhega, kyunki cleaning render par bhi lagti hai.
