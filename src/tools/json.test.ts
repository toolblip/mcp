import { describe, it, expect } from 'vitest';
import { formatJson } from './src/tools/json.js';

describe('formatJson', () => {
  it('formats valid JSON with indentation', () => {
    const result = formatJson('{"name":"Toolblip","version":"1.0"}');
    expect(result.valid).toBe(true);
    expect(result.result).toBeTruthy();
    expect(result.result).toContain('\n'); // formatted has indentation
  });

  it('minifies JSON via action', () => {
    const result = formatJson('{\n  "name": "Harun",\n  "age": 30\n}', 'minify');
    expect(result.result).toBe('{"name":"Harun","age":30}');
  });

  it('validates valid JSON', () => {
    const result = formatJson('{"key":"value"}', 'validate');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns error for invalid JSON', () => {
    const result = formatJson('{invalid json}', 'validate');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('minify already-minified JSON', () => {
    const result = formatJson('{"a":1}', 'minify');
    expect(result.result).toBe('{"a":1}');
  });
});
