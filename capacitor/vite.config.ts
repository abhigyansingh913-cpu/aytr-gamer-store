import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve("."),
  build: {
    outDir: resolve("dist/capacitor"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve("capacitor/index.html"),
    },
  },
  plugins: [tailwindcss(), react(), TanStackRouterVite(), tsconfigPaths()],
});
