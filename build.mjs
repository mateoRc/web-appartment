import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = new URL("./", import.meta.url);
const output = new URL("./dist/", root);
await mkdir(new URL("assets/", output), { recursive: true });

// Publish only the files used by the website, never the repository directory.
const files = [
  "index.html",
  "styles.css",
  "script.js",
  "locales.js",
  "calendar.js",
  "offline.js",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "assets/favicon.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/terrace-960.webp",
  "assets/terrace-1920.webp",
  "assets/terrace-1200.jpg",
  "assets/from_the_beach-upscaled-2x.png",
  "assets/hallway_1.jpg",
  "assets/separator-historical-upscaled-2x.png",
  "assets/historical_1-upscaled-2x.png",
  "assets/details.jpg",
  "assets/living.jpg",
  "assets/bedroom.jpg",
  "assets/bedroom2.jpg",
  "assets/booking-logo.svg",
  "assets/airbnb-logo.svg",
];
for (const file of files) {
  await copyFile(new URL(file, root), new URL(file, output));
}
// Content-based cache versions ensure every deployed update retires old offline assets.
const workerSource = await readFile(new URL("sw.js", root), "utf8");
const hash = createHash("sha256").update(workerSource);
for (const file of files) hash.update(await readFile(new URL(file, root)));
await writeFile(new URL("sw.js", output), workerSource.replace("__BUILD_VERSION__", hash.digest("hex").slice(0, 16)));
await writeFile(
  new URL(".assetsignore", output),
  ".git\n.git/**\n.wrangler\n.wrangler/**\n",
);
console.log(`Built ${files.length} website files in ${fileURLToPath(output)}`);
