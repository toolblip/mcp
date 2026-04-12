// JSON formatter/minifier/validator
export function formatJson(input, action) {
    try {
        const parsed = JSON.parse(input);
        if (action === 'validate') {
            return { valid: true, parsed };
        }
        if (action === 'minify') {
            return { result: JSON.stringify(parsed), valid: true };
        }
        return { result: JSON.stringify(parsed, null, 2), valid: true };
    }
    catch (e) {
        if (action === 'validate') {
            return { valid: false, error: e.message };
        }
        return { valid: false, error: `Invalid JSON: ${e.message}` };
    }
}
//# sourceMappingURL=json.js.map