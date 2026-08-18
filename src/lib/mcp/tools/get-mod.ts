import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { normalizeMod, type Mod } from "@/lib/types";
import { fetchNode } from "../firebase";

export default defineTool({
  name: "get_mod",
  title: "Get mod details",
  description:
    "Get full details for a single mod by its id, including description, screenshots, download link, and YouTube URL if present.",
  inputSchema: {
    id: z.string().min(1).describe("The mod id (Firebase key)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ id }) => {
    const raw = await fetchNode<Record<string, unknown>>(`mods/${encodeURIComponent(id)}`);
    if (!raw) {
      return {
        content: [{ type: "text", text: `No mod found with id "${id}".` }],
        isError: true,
      };
    }
    const full: Mod = normalizeMod(id, raw);
    return {
      content: [{ type: "text", text: JSON.stringify(full, null, 2) }],
      structuredContent: { mod: full },
    };
  },
});
