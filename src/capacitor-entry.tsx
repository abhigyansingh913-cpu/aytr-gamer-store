import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/history";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// Native APK loads from an internal file server, so path-based URLs (/admin)
// 404. Hash history keeps every route client-side (#/admin) and never hits the
// file server. The web/SSR build keeps browser history via getRouter().
const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  history: createHashHistory(),
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
