import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const svg = (size: number, pad: number) => {
  const r = Math.round(size * 0.18);
  const fs1 = Math.round(size * 0.34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${pad ? 0 : r}" fill="#9a6a24"/>
  <text x="50%" y="50%" dy="0.06em" text-anchor="middle" dominant-baseline="middle"
    font-family="monospace" font-weight="700" font-size="${fs1}" fill="#faf8f4" letter-spacing="-2">ND</text>
</svg>`;
};

async function main() {
  const pub = path.join(process.cwd(), "public");
  await fs.mkdir(pub, { recursive: true });
  // Standard icons
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg(size, 0))).png().toFile(path.join(pub, `icon-${size}.png`));
  }
  // Maskable 512 (full-bleed background, centered glyph -> safe zone)
  await sharp(Buffer.from(svg(512, 1))).png().toFile(path.join(pub, "icon-maskable-512.png"));
  // Apple touch icon
  await sharp(Buffer.from(svg(180, 0))).png().toFile(path.join(pub, "apple-icon.png"));
  console.log("icons written:", (await fs.readdir(pub)).filter(f => f.endsWith(".png")));
}
main().then(() => process.exit(0));
