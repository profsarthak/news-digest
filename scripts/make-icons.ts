import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// Brand mark: square (no radii), orange accent field, paper wordmark.
const svg = (size: number) => {
  const fs1 = Math.round(size * 0.34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#e8531d"/>
  <text x="50%" y="50%" dy="0.06em" text-anchor="middle" dominant-baseline="middle"
    font-family="'Space Grotesk','Arial Narrow',sans-serif" font-weight="700" font-size="${fs1}" fill="#f4f3ec" letter-spacing="-3">ND</text>
</svg>`;
};

async function main() {
  const pub = path.join(process.cwd(), "public");
  await fs.mkdir(pub, { recursive: true });
  // Standard icons
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg(size))).png().toFile(path.join(pub, `icon-${size}.png`));
  }
  // Maskable 512 (full-bleed field, centered glyph -> safe zone)
  await sharp(Buffer.from(svg(512))).png().toFile(path.join(pub, "icon-maskable-512.png"));
  // Apple touch icon
  await sharp(Buffer.from(svg(180))).png().toFile(path.join(pub, "apple-icon.png"));
  console.log("icons written:", (await fs.readdir(pub)).filter(f => f.endsWith(".png")));
}
main().then(() => process.exit(0));
