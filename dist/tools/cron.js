import { z } from 'zod';
export const CronInputSchema = z.object({
    expression: z.string().describe('Cron expression with 5 fields: minute hour day month weekday (e.g. "0 9 * * 1-5")'),
    count: z.number().int().min(1).max(10).default(5).optional(),
});
function parseField(value, min, max) {
    const result = [];
    const parts = value.split(',');
    for (const part of parts) {
        if (part.includes('/')) {
            const [range, step] = part.split('/');
            const stepNum = parseInt(step, 10);
            let start = min;
            let end = max;
            if (range !== '*') {
                if (range.includes('-')) {
                    const [s, e] = range.split('-').map(Number);
                    start = s;
                    end = e;
                }
                else {
                    start = parseInt(range, 10);
                }
            }
            for (let i = start; i <= end; i += stepNum) {
                result.push(i);
            }
        }
        else if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
        }
        else if (part === '*') {
            for (let i = min; i <= max; i++)
                result.push(i);
        }
        else {
            const n = parseInt(part, 10);
            if (!isNaN(n))
                result.push(n);
        }
    }
    return [...new Set(result)].sort((a, b) => a - b);
}
function getNextRuns(minute, hour, dayOfMonth, month, dayOfWeek, count) {
    const runs = [];
    const now = new Date();
    let current = new Date(now);
    current.setSeconds(0, 0);
    // Move to next minute
    current.setMinutes(current.getMinutes() + 1);
    const maxIterations = 366 * 24 * 60; // 1 year of minutes max
    for (let i = 0; i < maxIterations && runs.length < count; i++) {
        const m = current.getMinutes();
        const h = current.getHours();
        const d = current.getDate();
        const mo = current.getMonth() + 1; // JS months are 0-indexed
        const dow = current.getDay();
        const minOk = minute.includes(m);
        const hourOk = hour.includes(h);
        const dayOk = dayOfMonth.includes(d);
        const monthOk = month.includes(mo);
        const dowOk = dayOfWeek.includes(dow);
        // Standard cron: if both day-of-month and day-of-week are specified,
        // the job runs if EITHER matches (OR semantics)
        const orMode = dayOfMonth.length < 31 && dayOfWeek.length < 7;
        const dayMatch = orMode
            ? (dayOk && monthOk) || (dowOk && monthOk)
            : dayOk && monthOk && dowOk;
        if (minOk && hourOk && dayMatch) {
            runs.push(new Date(current));
        }
        current.setMinutes(current.getMinutes() + 1);
    }
    return runs;
}
const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'];
const FIELD_MIN = [0, 0, 1, 1, 0];
const FIELD_MAX = [59, 23, 31, 12, 6];
export function describeCron(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
        return 'Invalid: must have exactly 5 fields';
    }
    const fields = parts.map((p, i) => parseField(p, FIELD_MIN[i], FIELD_MAX[i]));
    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
    const minuteStr = minute.length === 60 ? 'every minute' :
        minute.length === 1 ? `at minute ${minute[0]}` :
            minute.length <= 5 ? `at minutes ${minute.join(', ')}` :
                `every ${parts[0].includes('/') ? 'step ' + parts[0] : 'minute matching ' + parts[0]}`;
    const hourStr = hour.length === 24 ? 'every hour' :
        hour.length === 1 ? `at ${hour[0]}:00` :
            hour.length <= 3 ? `at ${hour.map(h => h + ':00').join(', ')}` :
                hour.length === 1 ? `at hour ${hour[0]}` : `hours matching ${parts[1]}`;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayStr = dayOfMonth.length === 31 ? 'every day' :
        dayOfMonth.length < 31 && dayOfWeek.length === 7 ?
            'every day' :
            dayOfMonth.length < 31 ? `on day ${dayOfMonth.join(', ')} of the month` :
                dayOfWeek.length < 7 ? `on ${dayOfWeek.map(d => dayNames[d]).join(', ')}` : 'every day';
    const monthStr = month.length === 12 ? 'every month' :
        month.length < 12 ? `in ${month.map(m => monthNames[m]).join(', ')}` : '';
    return `${minuteStr}, ${hourStr}, ${dayStr}${monthStr ? ', ' + monthStr : ''}`.trim();
}
export function parseCron(expression, count = 5) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
        return { valid: false, error: 'Cron expression must have exactly 5 fields: minute hour day month weekday' };
    }
    const parsed = parts.map((p, i) => {
        try {
            return parseField(p, FIELD_MIN[i], FIELD_MAX[i]);
        }
        catch {
            return [];
        }
    });
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parsed;
    const description = describeCron(expression);
    const runs = getNextRuns(minute, hour, dayOfMonth, month, dayOfWeek, count);
    const nextRuns = runs.map(d => d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    return {
        valid: true,
        expression,
        description,
        nextRuns,
    };
}
//# sourceMappingURL=cron.js.map