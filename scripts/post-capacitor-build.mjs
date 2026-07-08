import { readFileSync, writeFileSync, readdirSync, renameSync } from "fs";
import { join } from "path";

const buildDir = "capacitor-build";
const htmlPath = join(buildDir, "capacitor.html");
const assetsDir = join(buildDir, "assets");

const files = readdirSync(assetsDir);
const stylesFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!stylesFile) {
  console.error("styles-*.css not found in", assetsDir);
  process.exit(1);
}

let html = readFileSync(htmlPath, "utf-8");
const linkTag = `<link rel="stylesheet" crossorigin href="./assets/${stylesFile}">`;

if (!html.includes(stylesFile)) {
  html = html.replace(
    "</head>",
    `  ${linkTag}\n  </head>`,
  );
  writeFileSync(htmlPath, html);
  console.log("Injected stylesheet:", stylesFile);
}

renameSync(htmlPath, join(buildDir, "index.html"));
console.log("Renamed capacitor.html → index.html");
