import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import type { Ad } from "@/lib/types";
import { fetchNode, recordToArray } from "../firebase";

export default defineTool({
  name: "list_banners",
  title: "List promotional banners",
  description:
    "List promotional banners shown in the Aytr Gamer Store. By default returns only active banners.",
  inputSchema: {
    includeInactive: z
      .boolean()
      .optional()
      .describe("Include hidden/inactive banners (default false)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ includeInactive }) => {
    const raw = await fetchNode<Record<string, Omit<Ad, "id">>>("ads");
    let ads = recordToArray(raw) as Ad[];
    if (!includeInactive) ads = ads.filter((a) => a.active);
    ads.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return {
      content: [
        {
          type: "text",
          text: `Returning ${ads.length} banner(s).\n${JSON.stringify(ads, null, 2)}`,
        },
      ],
      structuredContent: { total: ads.length, banners: ads },
    };
  },
});
