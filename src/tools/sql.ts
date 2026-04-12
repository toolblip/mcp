// SQL formatter

export interface SqlResult {
  formatted?: string;
  valid: boolean;
  error?: string;
}

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
  'ALTER', 'DROP', 'INDEX', 'VIEW', 'AS', 'DISTINCT', 'COUNT', 'SUM',
  'AVG', 'MIN', 'MAX', 'COALESCE', 'NULL', 'IS', 'CASE', 'WHEN', 'THEN',
  'ELSE', 'END', 'UNION', 'ALL', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE', 'VARCHAR',
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'FLOAT', 'DOUBLE', 'DECIMAL',
  'BOOLEAN', 'DATE', 'DATETIME', 'TIMESTAMP', 'TEXT', 'BLOB', 'ENUM',
];

const INDENT = '  ';

function tokenize(sql: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];

    if (inString) {
      current += char;
      if (char === stringChar && sql[i-1] !== '\\') {
        inString = false;
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      if (current.trim()) tokens.push(current.trim());
      current = char;
      inString = true;
      stringChar = char;
      i++;
      continue;
    }

    if (char === '-' && sql[i+1] === '-' && sql[i+2] === ' ') {
      if (current.trim()) tokens.push(current.trim());
      const end = sql.indexOf('\n', i);
      current = end === -1 ? '' : sql.slice(i, end);
      i = end === -1 ? sql.length : end;
      continue;
    }

    if (char === ' ' || char === '\n' || char === '\t') {
      if (current.trim()) tokens.push(current.trim());
      current = '';
      i++;
      continue;
    }

    if (char === '(' || char === ')' || char === ',' || char === ';') {
      if (current.trim()) tokens.push(current.trim());
      tokens.push(char);
      current = '';
      i++;
      continue;
    }

    current += char;
    i++;
  }

  if (current.trim()) tokens.push(current.trim());
  return tokens.filter(t => t.trim());
}

function formatSql(sql: string): string {
  const tokens = tokenize(sql);
  if (tokens.length === 0) return '';

  const result: string[] = [];
  let indent = 0;
  let i = 0;

  const upper = (t: string) => t.toUpperCase();
  const isKeyword = (t: string) => KEYWORDS.includes(upper(t));
  const isClause = (t: string) => ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'UNION'].includes(upper(t));
  const isOpen = (t: string) => t === '(';
  const isClose = (t: string) => t === ')';
  const isComma = (t: string) => t === ',';

  while (i < tokens.length) {
    let token = tokens[i];

    // Check for multi-word keywords
    const twoWord = i + 1 < tokens.length ? `${upper(tokens[i])} ${upper(tokens[i+1])}` : '';
    const threeWord = i + 2 < tokens.length ? `${upper(tokens[i])} ${upper(tokens[i+1])} ${upper(tokens[i+2])}` : '';

    result.push(token + ' ');

    // Handle indent/dedent after keywords
    if (isKeyword(token) && upper(token) !== 'NOT') {
      if (['SELECT'].includes(upper(token))) {
        // indent handled per-comma
      }
    }

    if (isOpen(token)) indent++;
    if (isClose(token)) {
      indent = Math.max(0, indent - 1);
      result.push('\n' + INDENT.repeat(indent));
    }
    if (isComma(token)) {
      result.push('\n' + INDENT.repeat(indent + 1));
    }

    i++;
  }

  return result.join('').replace(/\s+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}

export function formatSqlQuery(input: string): SqlResult {
  try {
    return { formatted: formatSql(input), valid: true };
  } catch (e: any) {
    return { valid: false, error: `SQL format error: ${e.message}` };
  }
}
