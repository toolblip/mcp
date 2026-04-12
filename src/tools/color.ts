// Color converter — HEX ↔ RGB ↔ HSL

export interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  valid: boolean;
  error?: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function convertColor(input: string, format: 'hex' | 'rgb' | 'hsl'): ColorResult {
  const clean = input.trim();

  // Parse HEX
  if (clean.startsWith('#') || /^[0-9a-fA-F]{3,6}$/.test(clean)) {
    const rgb = hexToRgb(clean);
    if (!rgb) return { valid: false, error: 'Invalid HEX color', hex: '', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl, valid: true };
  }

  // Parse RGB
  const rgbMatch = clean.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i) ||
                   clean.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
  if (rgbMatch || format === 'rgb') {
    const [r, g, b] = rgbMatch
      ? [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
      : (() => { const m = clean.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/); return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [null, null, null]; })();
    if (r === null) {
      const rgb = { r: parseInt(clean), g: parseInt(clean), b: parseInt(clean) };
      if (isNaN(rgb.r)) return { valid: false, error: 'Invalid RGB', hex: '', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return { hex, rgb, hsl, valid: true };
    }
    if (r > 255 || g > 255 || b > 255) return { valid: false, error: 'RGB values must be 0-255', hex: '', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    return { hex, rgb: { r, g, b }, hsl, valid: true };
  }

  // Parse HSL
  const hslMatch = clean.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i) ||
                  clean.match(/^(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?$/);
  if (hslMatch || format === 'hsl') {
    let h: number, s: number, l: number;
    if (hslMatch) {
      h = parseInt(hslMatch[1]); s = parseInt(hslMatch[2]); l = parseInt(hslMatch[3]);
    } else {
      const m = clean.match(/^(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?$/);
      if (!m) return { valid: false, error: 'Unrecognized color format. Use HEX (#fff, #ffffff), RGB (rgb(255,0,0) or 255,0,0), or HSL (hsl(0,100%,50%) or 0,100,50)', hex: '', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
      h = parseInt(m[1]); s = parseInt(m[2]); l = parseInt(m[3]);
    }
    if (h > 360 || s > 100 || l > 100) return { valid: false, error: 'Invalid HSL values', hex: '', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl: { h, s, l }, valid: true };
  }

  return {
    valid: false,
    error: 'Unrecognized format. Use HEX (#fff or #ffffff), RGB (rgb(255,0,0) or 255,0,0), or HSL (hsl(0,100%,50%) or 0,100,50)',
    hex: '',
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
  };
}
