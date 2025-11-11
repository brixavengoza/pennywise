/**
 * Generate a pastel color from a unique string ID
 * Uses HSL color space to ensure distinct hues (purple, blue, green, orange, etc.)
 */
function generateHash(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Generate a light pastel color from a unique string ID
 * Uses HSL to ensure distinct color hues
 */
export function generateRandomColor(id: string): string {
  const hash = generateHash(id);
  
  // Generate distinct hues (0-360) - ensures different colors like purple, blue, green, orange
  const hue = hash % 360;                          // 0-360 (full color spectrum)
  const saturation = 60 + (hash % 25);             // 60-85% (strong saturation)
  const lightness = 45 + (hash % 15);              // 45-60% (medium-dark, bold)

  const [r, g, b] = hslToRgb(hue, saturation, lightness);

  // Convert to hex
  const toHex = (x: number) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate darker colors for dark mode
 * Same hues but darker for better white text contrast
 */
export function generateRandomColorDark(id: string): string {
  const hash = generateHash(id);
  
  // Generate distinct hues (0-360) - same as light mode
  const hue = hash % 360;                          // 0-360 (full color spectrum)
  const saturation = 60 + (hash % 25);             // 60-85% (strong saturation)
  const lightness = 30 + (hash % 15);              // 30-45% (darker for white text contrast)

  const [r, g, b] = hslToRgb(hue, saturation, lightness);

  // Convert to hex
  const toHex = (x: number) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

