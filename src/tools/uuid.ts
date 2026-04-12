import { randomUUID } from 'crypto';
import { z } from 'zod';

export const UuidInputSchema = z.object({
  count: z.number().int().min(1).max(100).default(1).optional(),
  version: z.enum(['v4', 'v7']).default('v4').optional(),
});

export type UuidInput = z.infer<typeof UuidInputSchema>;

// v7 UUIDs are time-sortable and based on timestamp + random data
export function generateV7(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0');

  // 48 bits of timestamp
  const timestamp = BigInt('0x' + timeHex);

  // 80 bits of random data
  const random = BigInt('0x' + Buffer.from(crypto.randomBytes(10)).toString('hex'));

  // Construct v7 UUID
  // Unix Epoch time in milliseconds as 48-bit integer
  const time_low = (timestamp & BigInt(0xFFFFFFFFn)) << 16;
  const time_mid = ((timestamp >> 32n) & BigInt(0xFFFFn)) | BigInt(0x7000n); // version 7
  const time_hi_and_version = ((timestamp >> 48n) & BigInt(0x0FFFn)) | BigInt(0x8000n); // variant

  const randomBytes = Buffer.from(crypto.randomBytes(8));
  const clock_seq_hi_and_reserved = (randomBytes[0] & 0x3f) | 0x80;
  const clock_seq_low = randomBytes[1];
  const node = randomBytes.slice(2);

  const bytes = Buffer.alloc(16);
  bytes.writeUInt32BE(Number((time_low >> 32n) & 0xFFFFFFFFn), 0);
  bytes.writeUInt16BE(Number((time_low >> 16n) & 0xFFFFn), 4);
  bytes.writeUInt16BE(Number(time_mid), 6);
  bytes.writeUInt16BE(Number(time_hi_and_version), 8);
  bytes.writeUInt8(clock_seq_hi_and_reserved, 10);
  bytes.writeUInt8(clock_seq_low, 11);
  node.copy(bytes, 12);

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
