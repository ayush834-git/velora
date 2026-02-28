export interface DominantColor {
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  hex: string;
  css: string;
  cssSubdued: string;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function extractDominantColor(imageElement: HTMLImageElement): DominantColor {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return getDefaultColor();

  const size = 50;
  canvas.width = size;
  canvas.height = size;

  try {
    ctx.drawImage(imageElement, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    const colorCounts: Record<string, { r: number; g: number; b: number; count: number }> = {};

    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 16) * 16;
      const g = Math.round(data[i + 1] / 16) * 16;
      const b = Math.round(data[i + 2] / 16) * 16;

      // Skip very dark or very light pixels
      const brightness = (r + g + b) / 3;
      if (brightness < 30 || brightness > 225) continue;

      const key = `${r},${g},${b}`;
      if (!colorCounts[key]) {
        colorCounts[key] = { r, g, b, count: 0 };
      }
      colorCounts[key].count++;
    }

    const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    if (sorted.length === 0) return getDefaultColor();

    const dominant = sorted[0];
    const [h, s, l] = rgbToHsl(dominant.r, dominant.g, dominant.b);
    const clampedS = Math.min(s, 60);
    const clampedL = Math.max(20, Math.min(l, 50));

    return {
      r: dominant.r,
      g: dominant.g,
      b: dominant.b,
      h,
      s: clampedS,
      l: clampedL,
      hex: `#${dominant.r.toString(16).padStart(2, "0")}${dominant.g.toString(16).padStart(2, "0")}${dominant.b.toString(16).padStart(2, "0")}`,
      css: `hsl(${h}, ${clampedS}%, ${clampedL}%)`,
      cssSubdued: `hsl(${h}, ${Math.max(clampedS - 20, 10)}%, ${Math.max(clampedL - 15, 10)}%)`,
    };
  } catch {
    return getDefaultColor();
  }
}

function getDefaultColor(): DominantColor {
  return {
    r: 99,
    g: 102,
    b: 241,
    h: 239,
    s: 50,
    l: 40,
    hex: "#6366f1",
    css: "hsl(239, 50%, 40%)",
    cssSubdued: "hsl(239, 30%, 25%)",
  };
}
