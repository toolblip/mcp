import { z } from 'zod';
export declare const YamlInputSchema: z.ZodObject<{
    input: z.ZodString;
    action: z.ZodDefault<z.ZodEnum<["yaml_to_json", "json_to_yaml", "validate_yaml", "validate_json"]>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    action: "yaml_to_json" | "json_to_yaml" | "validate_yaml" | "validate_json";
}, {
    input: string;
    action?: "yaml_to_json" | "json_to_yaml" | "validate_yaml" | "validate_json" | undefined;
}>;
export type YamlInput = z.infer<typeof YamlInputSchema>;
export declare function convertYaml(input: string, action: string): {
    result?: string;
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=yaml.d.ts.map