/**
 * Génère favicon.ico (16, 32, 48 px) et apple-icon.png (180 px) à partir de src/app/icon.svg,
 * puis l’image de partage (Open Graph, 1200 × 630) à partir du logo blanc.
 * Usage : npm run favicon:generate
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("src/app/icon.svg");
const png = (size) =>
  sharp(svg, { density: 72 * (size / 64) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();

// ICO : en-tête, un répertoire de 16 octets par image, puis les PNG bruts.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(size, at);
  header.writeUInt8(size, at + 1);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(images[i].length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += images[i].length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...images]));

// Icône Apple : fond plein (iOS arrondit lui-même les coins).
const apple = await sharp({
  create: { width: 180, height: 180, channels: 4, background: "#0a1a48" },
})
  .composite([{ input: await png(180) }])
  .png()
  .toBuffer();
await writeFile("src/app/apple-icon.png", apple);
// Image de partage : logo blanc centré sur fond navy, filet bleu dessous.
const logo = await sharp("public/logo-white.png").resize({ width: 620 }).png().toBuffer();
const { height: logoHeight = 0 } = await sharp(logo).metadata();
const line = await sharp({
  create: { width: 160, height: 6, channels: 4, background: "#4d7df0" },
})
  .png()
  .toBuffer();
const top = Math.round((630 - logoHeight - 40) / 2);
const og = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: "#0a1a48" },
})
  .composite([
    { input: logo, top, left: 290 },
    { input: line, top: top + logoHeight + 34, left: 520 },
  ])
  .png()
  .toBuffer();
await writeFile("src/app/opengraph-image.png", og);
await writeFile("src/app/twitter-image.png", og);
console.log("favicon.ico, apple-icon.png et images de partage générés.");
