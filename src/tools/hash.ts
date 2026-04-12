import { createHash } from 'crypto';
import { z } from 'zod';

export const HashInputSchema = z.object({
  input: z.string().describe('Text to hash'),
  algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha384', 'sha512']).default('sha256'),
});

export type HashInput = z.infer<typeof HashInputSchema>;

export function generateHash(input: string, algorithm: string): string {
  return createHash(algorithm).update(input, 'utf8').digest('hex');
}
