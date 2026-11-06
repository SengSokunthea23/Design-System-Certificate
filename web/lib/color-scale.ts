/**
 * Generate a Tailwind-style color scale (50–900) from a single hex color.
 * Uses HSL interpolation: hue stays constant, lightness and saturation shift.
 */

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export type ColorScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;

const LIGHTNESS_STEPS: Record<number, number> = {
  50: 97, 100: 94, 200: 86, 300: 75, 400: 62, 500: 50, 600: 42, 700: 33, 800: 24, 900: 15,
};

export function generateScale(hex: string): ColorScale {
  if (!hex || hex.length !== 7) {
    return Object.fromEntries(Object.keys(LIGHTNESS_STEPS).map((k) => [k, hex ?? "#888888"])) as unknown as ColorScale;
  }
  const [h, s] = hexToHsl(hex);
  const result: Record<number, string> = {};
  for (const [step, l] of Object.entries(LIGHTNESS_STEPS)) {
    // Saturate darker shades slightly
    const adjustedS = Math.min(100, s + (l < 50 ? (50 - l) * 0.3 : 0));
    result[Number(step)] = hslToHex(h, adjustedS, l);
  }
  return result as unknown as ColorScale;
}
