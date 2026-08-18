import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { normalizeMod } from "@/lib/types";
import { fetchNode } from "../firebase";

export default defineTool({
  name: "list_mods",
  title: "List mods",
  description:
    "List published mods from the Aytr Gamer Store. Optionally filter by category and limit the number of results. Returns newest first.",
  inputSchema: {
    category: z.string().optional().describe("Optional category filter (exact name)."),
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
    const raw = await fetchNode<Record<string, Record<string, unknown>>>("mods");
    const mods = Object.entries(raw ?? {}).map(([id, data]) => normalizeMod(id, data));
    const published = mods.filter((m) => m.published);
    let filtered = published;
    if (category) filtered = published.filter((m) => m.category === category);
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    const capped = filtered.slice(0, limit ?? 20);
    const summary = capped.map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      version: m.version,
      size: m.size,
      downloads: m.downloads ?? 0,
      imageUrl: m.imageUrl,
    }));
    return {
      content: [
        {
          type: "text",
          text: `Found ${filtered.length} mod(s); returning ${capped.length}.\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
      structuredContent: { total: filtered.length, mods: summary },
    };
  },
});
