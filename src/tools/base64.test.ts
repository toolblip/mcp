import { describe, it, expect } from 'vitest';
import { base64Encode, base64Decode } from './src/tools/base64.js';

describe('base64_encode', () => {
  it('encodes basic ASCII text', () => {
    const result = base64Encode('Hello, World!');
    expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('encodes Unicode text', () => {
    const result = base64Encode('こんにちは');
    expect(result).toBe('44GT44KT44Gr44Gh44Gv');
  });

  it('encodes empty string', () => {
    const result = base64Encode('');
    expect(result).toBe('');
  });

  it('encodes JSON-like text', () => {
    const result = base64Encode('{"name":"Harun Ray"}');
    expect(result).toBe('eyJuYW1lIjoiSGFydW4gUmF5In0=');
  });

  it('roundtrips with decode', () => {
    const original = 'Toolblip is awesome!';
    const encoded = base64Encode(original);
    const decoded = base64Decode(encoded);
    expect(decoded).toBe(original);
  });
});

describe('base64_decode', () => {
  it('decodes basic ASCII', () => {
    const result = base64Decode('SGVsbG8sIFdvcmxkIQ==');
    expect(result).toBe('Hello, World!');
  });

  it('decodes Unicode', () => {
    const result = base64Decode('44GT44KT44Gr44Gh44Gv');
    expect(result).toBe('こんにちは');
  });

  it('decodes empty string', () => {
    const result = base64Decode('');
    expect(result).toBe('');
  });

  it('decodes invalid base64 as garbage (no validation)', () => {
    // Buffer.from doesn't validate - returns garbage for invalid chars
    const result = base64Decode('not-valid-base64!!!');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('roundtrips with encode', () => {
    const original = 'Test with special chars: @#$%';
    const decoded = base64Decode(base64Encode(original));
    expect(decoded).toBe(original);
  });
});
