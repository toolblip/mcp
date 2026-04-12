import { z } from 'zod';
export declare const HashInputSchema: z.ZodObject<{
    input: z.ZodString;
    algorithm: z.ZodDefault<z.ZodEnum<["md5", "sha1", "sha256", "sha384", "sha512"]>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    algorithm: "md5" | "sha1" | "sha256" | "sha384" | "sha512";
}, {
    input: string;
    algorithm?: "md5" | "sha1" | "sha256" | "sha384" | "sha512" | undefined;
}>;
export type HashInput = z.infer<typeof HashInputSchema>;
export declare function generateHash(input: string, algorithm: string): string;
//# sourceMappingURL=hash.d.ts.map