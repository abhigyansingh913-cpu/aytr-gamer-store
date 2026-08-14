// Google AdSense configuration.
// Jab aapko AdSense se publisher ID (ca-pub-XXXXXXXXXXXXXXXX) mile,
// use yahan paste karein. Tab tak AdSense band rahega aur sirf
// admin panel ke custom banners dikhenge.
export const ADSENSE_CLIENT = "ca-pub-4394249029646548";

// Detect the native Capacitor APK. AdSense is a web-only product — inside the
// APK WebView it just retries endlessly and causes lag, so we disable it there.
function isNativeApp() {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

export const ADSENSE_ENABLED = /^ca-pub-\d+$/.test(ADSENSE_CLIENT.trim()) && !isNativeApp();
