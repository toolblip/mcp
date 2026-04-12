import { z } from 'zod';
export declare const CronInputSchema: z.ZodObject<{
    expression: z.ZodString;
    count: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    expression: string;
    count?: number | undefined;
}, {
    expression: string;
    count?: number | undefined;
}>;
export type CronInput = z.infer<typeof CronInputSchema>;
export declare function describeCron(expr: string): string;
export declare function parseCron(expression: string, count?: number): {
    valid: boolean;
    error?: string;
    description?: string;
    nextRuns?: string[];
    expression?: string;
};
//# sourceMappingURL=cron.d.ts.map