import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = './apps/web/public/assets/backgrounds';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const images = [
  { src: 'Gemini_Generated_Image_7gj6o37gj6o37gj6.png', out: 'velora-bg-amber.avif'      },
  { src: 'Gemini_Generated_Image_e5lompe5lompe5lo.png',  out: 'velora-bg-champagne.avif'  },
  { src: 'Gemini_Generated_Image_mcowgmmcowgmmcow.png',  out: 'velora-bg-blush.avif'      },
  { src: 'Gemini_Generated_Image_y4o7a4y4o7a4y4o7.png',  out: 'velora-bg-sky.avif'        },
  { src: 'Gemini_Generated_Image_c84x56c84x56c84x.png',  out: 'velora-bg-lavender.avif'   },
];

for (const { src, out } of images) {
  const srcPath = path.resolve(src);
  const outPath = path.join(OUTPUT_DIR, out);

  const meta = await sharp(srcPath).metadata();
  const cropW = Math.floor(meta.width  * 0.93);
  const cropH = Math.floor(meta.height * 0.91);

  await sharp(srcPath)
    .extract({ left: 0, top: 0, width: cropW, height: cropH })
    .blur(10)
    .avif({ quality: 72 })
    .toFile(outPath);

  const stat = fs.statSync(outPath);
  console.log(`✓ ${out} — ${(stat.size / 1024).toFixed(0)}kb`);
}

console.log('All 5 background images processed.');
