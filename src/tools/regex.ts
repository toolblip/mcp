// Regex tester — validate and test regular expressions

export interface RegexResult {
  valid: boolean;
  error?: string;
  matches?: string[];
  matchCount?: number;
  groups?: Record<string, string>;
}

export function testRegex(pattern: string, testString: string, flags: string = 'g'): RegexResult {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    let count = 0;
    const globalRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');

    while ((match = globalRegex.exec(testString)) !== null && count < 1000) {
      matches.push(match[0]);
      count++;
      if (!flags.includes('g')) break;
    }

    if (matches.length === 0) {
      return { valid: true, matches: [], matchCount: 0 };
    }

    return {
      valid: true,
      matches,
      matchCount: matches.length,
    };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}

export function validateRegex(pattern: string): RegexResult {
  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}
