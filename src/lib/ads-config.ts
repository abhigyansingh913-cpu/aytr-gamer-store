// Google AdSense configuration.
// Jab aapko AdSense se publisher ID (ca-pub-XXXXXXXXXXXXXXXX) mile,
// use yahan paste karein. Tab tak AdSense band rahega aur sirf
// admin panel ke custom banners dikhenge.
export const ADSENSE_CLIENT = ""; // e.g. "ca-pub-1234567890123456"

export const ADSENSE_ENABLED = /^ca-pub-\d+$/.test(ADSENSE_CLIENT.trim());
