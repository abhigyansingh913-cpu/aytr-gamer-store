import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "..",
  build: {
    outDir: "dist/capacitor",
    emptyOutDir: true,
    rollupOptions: {
      input: "capacitor/index.html",
    },
  },
  plugins: [tailwindcss(), react(), TanStackRouterVite(), tsconfigPaths()],
});
