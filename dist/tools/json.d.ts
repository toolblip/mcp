export interface JsonResult {
    result?: string;
    valid: boolean;
    error?: string;
    parsed?: unknown;
}
export declare function formatJson(input: string, action: 'format' | 'minify' | 'validate'): JsonResult;
//# sourceMappingURL=json.d.ts.map