#!/usr/bin/env node

/**
 * Toolblip MCP Server
 *
 * Exposes Toolblip developer tools as MCP tools for use with
 * Claude Code, Cursor, and other MCP-compatible AI clients.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';

import { base64Encode, base64Decode } from './tools/base64.js';
import { generateHash } from './tools/hash.js';
import { formatJson } from './tools/json.js';
import { parseCron, CronInputSchema } from './tools/cron.js';
import { convertYaml } from './tools/yaml.js';
import { searchDirectory } from './tools/directory.js';
import { convertColor } from './tools/color.js';
import { testRegex, validateRegex } from './tools/regex.js';
import { formatSqlQuery } from './tools/sql.js';
import { htmlEncode, htmlDecode, htmlEntitiesEncode } from './tools/html.js';
import { decodeJwt } from './tools/jwt.js';
import { generateGradient } from './tools/gradient.js';

// Create MCP server
const server = new McpServer({
  name: 'toolblip',
  version: '0.1.0',
});

// Base64 Encode / Decode
server.registerTool(
  'base64_encode',
  {
    description: 'Encode a string to Base64. Use when you need to safely transmit binary data as ASCII text.',
    inputSchema: {
      input: z.string().describe('Text to encode'),
    },
  },
  async ({ input }) => ({
    content: [{ type: 'text', text: base64Encode(input) }],
  })
);

server.registerTool(
  'base64_decode',
  {
    description: 'Decode a Base64-encoded string back to plain text.',
    inputSchema: {
      input: z.string().describe('Base64 string to decode'),
    },
  },
  async ({ input }) => {
    try {
      return { content: [{ type: 'text', text: base64Decode(input) }] };
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Hash Generator
server.registerTool(
  'hash_generate',
  {
    description: 'Generate a cryptographic hash (MD5, SHA-1, SHA-256, SHA-384, SHA-512) from any text input.',
    inputSchema: {
      input: z.string().describe('Text to hash'),
      algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha384', 'sha512']).describe('Hash algorithm'),
    },
  },
  async ({ input, algorithm }) => ({
    content: [{ type: 'text', text: generateHash(input, algorithm) }],
  })
);

// UUID Generator
server.registerTool(
  'uuid_generate',
  {
    description: 'Generate UUID v4 (random) or v7 (time-sortable) identifiers.',
    inputSchema: {
      count: z.number().int().min(1).max(100).default(1).optional(),
      version: z.enum(['v4', 'v7']).default('v4').optional(),
    },
  },
  async ({ count = 1, version = 'v4' }) => {
    const { randomUUID } = await import('node:crypto');
    const { generateV7 } = await import('./tools/uuid.js');
    const n = Math.min(count, 100);
    const results: string[] = [];
    for (let i = 0; i < n; i++) {
      results.push(version === 'v7' ? generateV7() : randomUUID());
    }
    const text = n === 1 ? results[0] : results.join('\n');
    return { content: [{ type: 'text', text }] };
  }
);

// URL Encode / Decode
server.registerTool(
  'url_encode',
  {
    description: 'Encode or decode URL components. Use to safely include special characters in URLs.',
    inputSchema: {
      input: z.string().describe('Text to encode or decode'),
      mode: z.enum(['encode', 'decode']).default('encode'),
    },
  },
  async ({ input, mode }) => {
    try {
      const result = mode === 'decode' ? decodeURIComponent(input) : encodeURIComponent(input);
      return { content: [{ type: 'text', text: result }] };
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// JSON Formatter / Minifier / Validator
server.registerTool(
  'json_format',
  {
    description: 'Format, minify, or validate JSON. Enter any JSON string to format with proper indentation, or minify it to remove whitespace.',
    inputSchema: {
      input: z.string().describe('JSON string to process'),
      action: z.enum(['format', 'minify', 'validate']).default('format'),
    },
  },
  async ({ input, action }) => {
    const result = formatJson(input, action);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    if (action === 'validate') {
      return { content: [{ type: 'text', text: 'Valid JSON ✓' }] };
    }
    return { content: [{ type: 'text', text: result.result ?? '' }] };
  }
);

// Cron Parser
server.registerTool(
  'cron_parse',
  {
    description: 'Parse and validate a cron expression. Returns a human-readable description and the next N scheduled run times. Example: "0 9 * * 1-5" (weekdays at 9am).',
    inputSchema: {
      expression: z.string().describe('Cron expression with 5 fields: minute hour day month weekday'),
      count: z.number().int().min(1).max(10).default(5).optional(),
    },
  },
  async ({ expression, count = 5 }) => {
    const result = parseCron(expression, count);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    const output = [
      `Expression: ${expression}`,
      `Description: ${result.description}`,
      `Next ${count} runs:`,
      ...(result.nextRuns ?? []).map((r, i) => `  ${i + 1}. ${r}`),
    ].join('\n');
    return { content: [{ type: 'text', text: output }] };
  }
);

// YAML Converter
server.registerTool(
  'yaml_convert',
  {
    description: 'Convert YAML to JSON or JSON to YAML. Also validates YAML or JSON syntax.',
    inputSchema: {
      input: z.string().describe('YAML or JSON string to convert'),
      action: z.enum(['yaml_to_json', 'json_to_yaml', 'validate_yaml', 'validate_json']).default('yaml_to_json'),
    },
  },
  async ({ input, action }) => {
    const result = convertYaml(input, action);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    if (action === 'validate_yaml' || action === 'validate_json') {
      return { content: [{ type: 'text', text: 'Valid ✓' }] };
    }
    return { content: [{ type: 'text', text: result.result ?? '' }] };
  }
);

// Case Converter
server.registerTool(
  'case_convert',
  {
    description: 'Convert text between case styles: camelCase, snake_case, kebab-case, UPPERCASE, lowercase, Title Case, Sentence case.',
    inputSchema: {
      input: z.string().describe('Text to convert'),
      case_type: z.enum(['camel', 'snake', 'kebab', 'upper', 'lower', 'title', 'sentence']).describe('Target case style'),
    },
  },
  async ({ input, case_type }) => {
    const words = input.trim().split(/[\s_\-]+/).filter(Boolean);
    let result = '';

    switch (case_type) {
      case 'camel':
        result = words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'snake':
        result = words.map(w => w.toLowerCase()).join('_');
        break;
      case 'kebab':
        result = words.map(w => w.toLowerCase()).join('-');
        break;
      case 'upper':
        result = input.toUpperCase();
        break;
      case 'lower':
        result = input.toLowerCase();
        break;
      case 'title':
        result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      case 'sentence':
        result = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
        break;
    }

    return { content: [{ type: 'text', text: result }] };
  }
);

// Text Stats (word, character, sentence counter)
server.registerTool(
  'text_stats',
  {
    description: 'Count words, characters, sentences, and paragraphs in text. Also estimates reading time.',
    inputSchema: {
      input: z.string().describe('Text to analyze'),
    },
  },
  async ({ input }) => {
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = input.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const readingTimeMin = Math.ceil(words / 200);
    const output = [
      `Characters (total): ${chars}`,
      `Characters (no spaces): ${charsNoSpaces}`,
      `Words: ${words}`,
      `Sentences: ${sentences}`,
      `Paragraphs: ${paragraphs}`,
      `Reading time: ~${readingTimeMin} min`,
    ].join('\n');
    return { content: [{ type: 'text', text: output }] };
  }
);

// Percentage Calculator
server.registerTool(
  'percentage_calculate',
  {
    description: 'Calculate percentage values: find what percent X is of Y, calculate X% of Y, or add/subtract a percentage from a value.',
    inputSchema: {
      action: z.enum(['what_is_x_pct_of_y', 'x_is_what_pct_of_y', 'add_pct', 'subtract_pct']).describe('Type of calculation'),
      x: z.number().describe('First number'),
      y: z.number().describe('Second number (or percentage for what_is_x_pct_of_y)'),
    },
  },
  async ({ action, x, y }) => {
    let result: number;
    switch (action) {
      case 'what_is_x_pct_of_y':
        result = (x / 100) * y;
        break;
      case 'x_is_what_pct_of_y':
        result = y === 0 ? 0 : (x / y) * 100;
        break;
      case 'add_pct':
        result = x + (x * y / 100);
        break;
      case 'subtract_pct':
        result = x - (x * y / 100);
        break;
    }
    return { content: [{ type: 'text', text: String(result) }] };
  }
);

// Directory Search
server.registerTool(
  'directory_search',
  {
    description: 'Search the Toolblip tool directory or MCP server directory. Use to find available developer tools or MCP servers by keyword.',
    inputSchema: {
      query: z.string().describe('Search keyword or phrase'),
      type: z.enum(['tools', 'servers']).default('tools').optional(),
    },
  },
  async ({ query, type = 'tools' }) => {
    const result = await searchDirectory(query, type);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    return { content: [{ type: 'text', text: result.result ?? 'No results found' }] };
  }
);


// Color Converter (HEX ↔ RGB ↔ HSL)
server.registerTool(
  'color_convert',
  {
    description: 'Convert colors between HEX, RGB, and HSL formats.',
    inputSchema: {
      input: z.string().describe('Color: #fff, #ffffff, rgb(r,g,b), hsl(h,s%,l%)'),
    },
  },
  async ({ input }) => {
    const result = convertColor(input, 'hex');
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    const out = [
      `HEX:   ${result.hex}`,
      `RGB:   rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`,
      `HSL:   hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`,
    ].join('\n');
    return { content: [{ type: 'text', text: out }] };
  }
);

// Regex Tester
server.registerTool(
  'regex_test',
  {
    description: 'Test a regular expression against a string. Returns all matches.',
    inputSchema: {
      pattern: z.string().describe('Regex pattern'),
      test_string: z.string().describe('String to test against'),
      flags: z.string().default('g').optional(),
    },
  },
  async ({ pattern, test_string, flags = 'g' }) => {
    const result = testRegex(pattern, test_string, flags);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Invalid regex: ${result.error}` }], isError: true };
    }
    if (result.matchCount === 0) {
      return { content: [{ type: 'text', text: 'No matches found.' }] };
    }
    const lines = result.matches!.map((m, i) => `  ${i + 1}. "${m}"`).join('\n');
    return { content: [{ type: 'text', text: `Found ${result.matchCount} match(es):\n${lines}` }] };
  }
);

// SQL Formatter
server.registerTool(
  'sql_format',
  {
    description: 'Format and prettify a SQL query.',
    inputSchema: {
      query: z.string().describe('SQL query to format'),
    },
  },
  async ({ query }) => {
    const result = formatSqlQuery(query);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    return { content: [{ type: 'text', text: result.formatted ?? query }] };
  }
);

// HTML Encoder
server.registerTool(
  'html_encode',
  {
    description: 'Encode or decode HTML entities.',
    inputSchema: {
      input: z.string().describe('Text to encode or decode'),
      mode: z.enum(['encode', 'decode']).default('encode'),
    },
  },
  async ({ input, mode }) => {
    const result = mode === 'decode' ? htmlDecode(input) : htmlEncode(input);
    return { content: [{ type: 'text', text: result }] };
  }
);

// JWT Decoder
server.registerTool(
  'jwt_decode',
  {
    description: 'Decode and inspect a JWT (without verification). Shows header, payload, expiration.',
    inputSchema: {
      token: z.string().describe('JWT token string'),
    },
  },
  async ({ token }) => {
    const result = decodeJwt(token);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    const out = [
      `Header: ${JSON.stringify(result.header)}`,
      `Payload: ${JSON.stringify(result.payload)}`,
      `Expires: ${result.expiresAt ?? 'no exp claim'} ${result.expired ? '(EXPIRED)' : ''}`,
      `Issued at: ${result.issuedAt ?? 'no iat claim'}`,
    ].join('\n');
    return { content: [{ type: 'text', text: out }] };
  }
);

// CSS Gradient Generator
server.registerTool(
  'css_gradient',
  {
    description: 'Generate CSS gradient code (linear, radial, conic) with color stops.',
    inputSchema: {
      type: z.enum(['linear', 'radial', 'conic']).default('linear'),
      stops: z.array(z.string()).describe('Color stops: "color" or "color pos%"'),
      angle: z.number().default(90).optional(),
    },
  },
  async ({ type, stops, angle = 90 }) => {
    const result = generateGradient(type, stops, angle);
    if (!result.valid) {
      return { content: [{ type: 'text', text: `Error: ${result.error}` }], isError: true };
    }
    return { content: [{ type: 'text', text: result.css }] };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Toolblip MCP Server running');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
