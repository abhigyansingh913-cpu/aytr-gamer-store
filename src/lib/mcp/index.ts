import { defineMcp } from "@lovable.dev/mcp-js";
import listModsTool from "./tools/list-mods";
import getModTool from "./tools/get-mod";
import listBannersTool from "./tools/list-banners";

export default defineMcp({
  name: "aytr-gamer-store-mcp",
  title: "Aytr Gamer Store",
  version: "0.1.0",
  instructions:
    "Public read-only tools for the Aytr Gamer Store. Use list_mods to browse published mods (optionally filtered by category), get_mod to fetch full details for a single mod, and list_banners to see the current promotional banners. All data returned is already public in the store.",
  tools: [listModsTool, getModTool, listBannersTool],
});
