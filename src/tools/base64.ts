import { z } from 'zod';

export const Base64InputSchema = z.object({
  input: z.string().describe('Text to encode or decode'),
  mode: z.enum(['encode', 'decode']).default('encode'),
});

export type Base64Input = z.infer<typeof Base64InputSchema>;

export function base64Encode(input: string): string {
  // Node.js Buffer supports UTF-8 natively
  return Buffer.from(input, 'utf-8').toString('base64');
}

export function base64Decode(input: string): string {
  // Add padding if needed
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}
