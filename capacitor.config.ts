import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aytr.store",
  appName: "AYT R STORE",
  webDir: "capacitor-build",
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchFadeOutDuration: 300,
      backgroundColor: "#0a0a0b",
      androidScaleType: "centerCrop",
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: "#0a0a0b",
      style: "DARK",
      overlaysWebView: false,
    },
  },
};

export default config;
