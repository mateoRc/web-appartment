import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("./", import.meta.url);
const output = new URL("./dist/", root);
await mkdir(new URL("assets/", output), { recursive: true });

// Publish only the files used by the website, never the repository directory.
const files = [
  "index.html",
  "styles.css",
  "script.js",
  "assets/terrace.jpg",
  "assets/from_the_beach-upscaled-2x.png",
  "assets/hallway_1.jpg",
  "assets/separator-historical-upscaled-2x.png",
  "assets/historical_1-upscaled-2x.png",
  "assets/historical_2-upscaled-2x.png",
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
await writeFile(
  new URL(".assetsignore", output),
  ".git\n.git/**\n.wrangler\n.wrangler/**\n",
);
console.log(`Built ${files.length} website files in ${fileURLToPath(output)}`);
