import { z } from 'zod';
export declare const Base64InputSchema: z.ZodObject<{
    input: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["encode", "decode"]>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    mode: "encode" | "decode";
}, {
    input: string;
    mode?: "encode" | "decode" | undefined;
}>;
export type Base64Input = z.infer<typeof Base64InputSchema>;
export declare function base64Encode(input: string): string;
export declare function base64Decode(input: string): string;
//# sourceMappingURL=base64.d.ts.map