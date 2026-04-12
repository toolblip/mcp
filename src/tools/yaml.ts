import { z } from 'zod';

export const YamlInputSchema = z.object({
  input: z.string().describe('YAML or JSON string to convert'),
  action: z.enum(['yaml_to_json', 'json_to_yaml', 'validate_yaml', 'validate_json']).default('yaml_to_json'),
});

export type YamlInput = z.infer<typeof YamlInputSchema>;

// Minimal YAML parser for common cases
// For production use, install js-yaml or yaml npm package

function parseYaml(input: string): any {
  const lines = input.split('\n');
  const result: any = {};
  const stack: { obj: any; indent: number }[] = [{ obj: result, indent: -1 }];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Array item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim();
      const current = stack[stack.length - 1].obj;
      if (!Array.isArray(current)) continue;

      let item: any;
      if (value.includes(':') && !value.startsWith('"') && !value.startsWith("'")) {
        // Nested object as array item
        item = {};
        const colonIdx = value.indexOf(':');
        const key = value.slice(0, colonIdx).trim();
        const rest = value.slice(colonIdx + 1).trim();
        item[key] = parseValue(rest);
        current.push(item);
      } else {
        current.push(parseValue(value));
      }
      continue;
    }

    // Pop stack to correct depth
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const rawValue = trimmed.slice(colonIdx + 1).trim();
    const current = stack[stack.length - 1].obj;

    if (rawValue === '' || rawValue === '|' || rawValue === '>') {
      // Nested object
      const nested: any = [];
      current[key] = nested;
      stack.push({ obj: nested, indent });
    } else {
      current[key] = parseValue(rawValue);
    }
  }

  return Array.isArray(result) ? result[0] : result;
}

function parseValue(value: string): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function toYaml(obj: any, indent: number = 0): string {
  const spaces = ' '.repeat(indent);
  let result = '';

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        const nested = toYaml(item, indent + 2);
        result += `${spaces}- ${nested.trimStart()}\n`;
      } else {
        result += `${spaces}- ${formatScalar(item)}\n`;
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n${toYaml(value, indent + 2)}`;
      } else {
        result += `${spaces}${key}: ${formatScalar(value)}\n`;
      }
    }
  }

  return result;
}

function formatScalar(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (String(value).includes('\n')) return `"${value}"`;
  return String(value);
}

export function convertYaml(input: string, action: string): { result?: string; valid: boolean; error?: string } {
  try {
    if (action === 'yaml_to_json') {
      const parsed = parseYaml(input);
      return { result: JSON.stringify(parsed, null, 2), valid: true };
    }
    if (action === 'json_to_yaml') {
      const parsed = JSON.parse(input);
      return { result: toYaml(parsed).trimEnd() + '\n', valid: true };
    }
    if (action === 'validate_yaml') {
      try {
        parseYaml(input);
        return { valid: true };
      } catch {
        return { valid: false, error: 'Invalid YAML syntax' };
      }
    }
    if (action === 'validate_json') {
      try {
        JSON.parse(input);
        return { valid: true };
      } catch (e: any) {
        return { valid: false, error: `Invalid JSON: ${e.message}` };
      }
    }
    return { valid: false, error: 'Unknown action' };
  } catch (e: any) {
    return { valid: false, error: `Parse error: ${e.message}` };
  }
}
