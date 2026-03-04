import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = "./apps/web/public/assets/backgrounds";
fs.mkdirSync(OUT, { recursive: true });

const MAP = [
  ["Gemini_Generated_Image_7gj6o37gj6o37gj6.png", "velora-bg-amber.avif"],
  ["Gemini_Generated_Image_e5lompe5lompe5lo.png", "velora-bg-champagne.avif"],
  ["Gemini_Generated_Image_mcowgmmcowgmmcow.png", "velora-bg-blush.avif"],
  ["Gemini_Generated_Image_y4o7a4y4o7a4y4o7.png", "velora-bg-sky.avif"],
  ["Gemini_Generated_Image_c84x56c84x56c84x.png", "velora-bg-lavender.avif"],
];

for (const [src, out] of MAP) {
  const meta = await sharp(src).metadata();
  await sharp(src)
    .extract({
      left: 0,
      top: 0,
      width: Math.floor(meta.width * 0.93),
      height: Math.floor(meta.height * 0.91),
    })
    .blur(10)
    .avif({ quality: 72 })
    .toFile(path.join(OUT, out));
  console.log(`✓ ${out}`);
}
