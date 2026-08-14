import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CATEGORIES, type Mod } from "@/lib/types";
import { fetchNode, recordToArray } from "../firebase";

export default defineTool({
  name: "list_mods",
  title: "List mods",
  description:
    "List published mods from the Aytr Gamer Store. Optionally filter by category and limit the number of results. Returns newest first.",
  inputSchema: {
    category: z.enum(CATEGORIES).optional().describe("Optional category filter."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Max number of mods to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ category, limit }) => {
    const raw = await fetchNode<Record<string, Omit<Mod, "id">>>("mods");
    let mods = recordToArray(raw) as Mod[];
    if (category) mods = mods.filter((m) => m.category === category);
    mods.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const capped = mods.slice(0, limit ?? 20);
    const summary = capped.map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      version: m.version,
      size: m.size,
      imageUrl: m.imageUrl,
    }));
    return {
      content: [
        {
          type: "text",
          text: `Found ${mods.length} mod(s); returning ${capped.length}.\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
      structuredContent: { total: mods.length, mods: summary },
    };
  },
});
