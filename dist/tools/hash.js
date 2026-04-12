import { createHash } from 'crypto';
import { z } from 'zod';
export const HashInputSchema = z.object({
    input: z.string().describe('Text to hash'),
    algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha384', 'sha512']).default('sha256'),
});
export function generateHash(input, algorithm) {
    return createHash(algorithm).update(input, 'utf8').digest('hex');
}
//# sourceMappingURL=hash.js.map