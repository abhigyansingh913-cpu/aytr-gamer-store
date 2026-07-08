import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aytr.store",
  appName: "AYT R STORE",
  webDir: "capacitor-build/capacitor/capacitor",
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#F5D67B",
    },
  },
};

export default config;
