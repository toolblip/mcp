// JSON formatter/minifier/validator

export interface JsonResult {
  result?: string;
  valid: boolean;
  error?: string;
  parsed?: unknown;
}

export function formatJson(input: string, action: 'format' | 'minify' | 'validate'): JsonResult {
  try {
    const parsed = JSON.parse(input);
    if (action === 'validate') {
      return { valid: true, parsed };
    }
    if (action === 'minify') {
      return { result: JSON.stringify(parsed), valid: true };
    }
    return { result: JSON.stringify(parsed, null, 2), valid: true };
  } catch (e: any) {
    if (action === 'validate') {
      return { valid: false, error: e.message };
    }
    return { valid: false, error: `Invalid JSON: ${e.message}` };
  }
}
