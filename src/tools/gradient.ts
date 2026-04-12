// CSS gradient generator

export type GradientType = 'linear' | 'radial' | 'conic';
export type ColorStop = { color: string; position: number }; // position 0-100

export interface GradientResult {
  css: string;
  valid: boolean;
  error?: string;
}

function parseColorStop(input: string): { color: string; position: number } | null {
  const match = input.match(/^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|rgba?\([^)]+\))\s*(\d+(?:\.\d+)?%)?$/);
  if (!match) return null;
  return { color: match[1], position: match[2] ? parseFloat(match[2]) : Math.random() * 100 };
}

function colorToHex(color: string): string {
  if (color.startsWith('#')) return color;
  // Very basic named color → hex (just common ones)
  const named: Record<string, string> = {
    red: '#ff0000', green: '#00ff00', blue: '#0000ff',
    white: '#ffffff', black: '#000000', yellow: '#ffff00',
    cyan: '#00ffff', magenta: '#ff00ff', orange: '#ff8000',
    purple: '#8000ff', pink: '#ff0080', gray: '#808080',
    grey: '#808080', transparent: '#00000000',
  };
  return named[color.toLowerCase()] || color;
}

function generateLinearGradient(angle: number, stops: string[]): string {
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
}

function generateRadialGradient(stops: string[]): string {
  return `radial-gradient(circle, ${stops.join(', ')})`;
}

function generateConicGradient(angle: number, stops: string[]): string {
  return `conic-gradient(from ${angle}deg at 50% 50%, ${stops.join(', ')})`;
}

export function generateGradient(
  type: GradientType,
  stopsInput: string[],
  angle: number = 90,
): GradientResult {
  try {
    const stops: string[] = [];
    for (const stop of stopsInput) {
      const parsed = parseColorStop(stop.trim());
      if (!parsed) {
        return { valid: false, error: `Invalid color stop: "${stop}". Use format "color" or "color 50%"`, css: '' };
      }
      const hex = colorToHex(parsed.color);
      const pos = parsed.position;
      stops.push(`${hex} ${pos}%`);
    }

    if (stops.length < 2) {
      return { valid: false, error: 'Need at least 2 color stops', css: '' };
    }

    let css: string;
    switch (type) {
      case 'linear':
        css = generateLinearGradient(angle, stops);
        break;
      case 'radial':
        css = generateRadialGradient(stops);
        break;
      case 'conic':
        css = generateConicGradient(angle, stops);
        break;
    }

    return { css, valid: true };
  } catch (e: any) {
    return { valid: false, error: e.message, css: '' };
  }
}
