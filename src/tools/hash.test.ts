import { describe, it, expect } from 'vitest';
import { generateHash } from './hash.js';

describe('generateHash', () => {
  it('generates md5 hash', () => {
    const result = generateHash('hello', 'md5');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('generates sha256 hash', () => {
    const result = generateHash('hello', 'sha256');
    expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('generates sha1 hash', () => {
    const result = generateHash('hello', 'sha1');
    expect(result).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });

  it('throws for unknown algorithm', () => {
    expect(() => generateHash('hello', 'unknown-algo')).toThrow('Digest method not supported');
  });

  it('is case-insensitive for algorithm name', () => {
    const result = generateHash('hello', 'SHA-256');
    expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('handles empty string md5', () => {
    const result = generateHash('', 'md5');
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
});
