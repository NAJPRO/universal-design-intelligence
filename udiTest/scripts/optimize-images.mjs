import sharp from "sharp";
import { stat, writeFile } from "node:fs/promises";

// CC BY-SA 4.0 source records and modifications are published at /credits.
// Every derivative is resized DOWN from its actual source crop. Never upscale.
const jobs = [
  { source: "revuelto-source.jpg", output: "hero-landscape.webp", crop: { left: 0, top: 950, width: 6000, height: 3000 }, width: 5120 },
  { source: "revuelto-source.jpg", output: "hero-portrait.webp", crop: { left: 3500, top: 0, width: 2000, height: 4000 }, width: 1920 },
  { source: "revuelto-source.jpg", output: "revuelto-collection.webp", crop: { left: 0, top: 950, width: 6000, height: 3000 }, width: 3840 },
  { source: "revuelto-source.jpg", output: "revuelto-detail.webp", crop: { left: 1900, top: 1950, width: 3600, height: 1800 }, width: 3600 },
  { source: "urus-source.jpg", output: "urus-collection.webp", width: 3840 },
  { source: "temerario-source.jpg", output: "temerario-collection.webp", crop: { left: 500, top: 650, width: 2350, height: 1250 }, width: 2350 },
  // Remove the people visible through the windshield while preserving cockpit detail.
  { source: "cockpit.jpg", output: "cockpit-detail.webp", crop: { left: 600, top: 680, width: 3368, height: 1500 }, width: 3200 },
];
const inventory = [];
for (const job of jobs) {
  let image = sharp(`public/images/${job.source}`);
  const source = await image.metadata();
  if (job.crop) image = image.extract(job.crop);
  await image.resize({ width: job.width, withoutEnlargement: true }).webp({ quality: 85 }).toFile(`public/images/${job.output}`);
  const output = await sharp(`public/images/${job.output}`).metadata();
  const record = { ...job, sourceWidth: source.width, sourceHeight: source.height, width: output.width, height: output.height, bytes: (await stat(`public/images/${job.output}`)).size };
  inventory.push(record);
  console.log(`${job.output}: ${output.width}×${output.height}, ${Math.round(record.bytes / 1024)} KiB`);
}
await writeFile("docs/udi/mission-005-image-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
