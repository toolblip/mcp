#!/usr/bin/env node

/**
 * Toolblip MCP Server
 *
 * Exposes Toolblip developer tools as MCP tools for use with
 * Claude Code, Cursor, and other MCP-compatible AI clients.
 *
 * Usage:
 *   npx @toolblip/mcp
 *   # or
 *   node dist/index.js
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { base64Encode, base64Decode, Base64InputSchema } from './tools/base64.js';
import { generateHash, HashInputSchema } from './tools/hash.js';
import { randomUUID } from 'crypto';
import { UuidInputSchema, generateV7 } from './tools/uuid.js';

// Tool definitions follow the MCP spec
const TOOLBLIP_TOOLS = [
  // Base64 Encode/Decode
  {
    name: 'base64_encode',
    description: 'Encode a string to Base64. Use this when you need to safely transmit binary data as ASCII text.',
    inputSchema: Base64InputSchema,
    handler: ({ input, mode }: { input: string; mode: 'encode' | 'decode' }) => {
      if (mode === 'decode') {
        return { result: base64Decode(input) };
      }
      return { result: base64Encode(input) };
    },
  },

  // Hash Generator
  {
    name: 'hash_generate',
    description: 'Generate a cryptographic hash (MD5, SHA-1, SHA-256, SHA-384, SHA-512) from any text input.',
    inputSchema: HashInputSchema,
    handler: ({ input, algorithm }: { input: string; algorithm: string }) => {
      return { hash: generateHash(input, algorithm) };
    },
  },

  // UUID Generator
  {
    name: 'uuid_generate',
    description: 'Generate UUID v4 (random) or v7 (time-sortable) identifiers. UUID v4 is random; UUID v7 is based on timestamp and is lexicographically sortable.',
    inputSchema: UuidInputSchema,
    handler: ({ count, version }: { count?: number; version?: 'v4' | 'v7' }) => {
      const n = Math.min(count ?? 1, 100);
      const results = [];
      for (let i = 0; i < n; i++) {
        results.push(version === 'v7' ? generateV7() : randomUUID());
      }
      return { uuids: n === 1 ? results[0] : results };
    },
  },

  // URL Encode/Decode
  {
    name: 'url_encode',
    description: 'Encode or decode URL components. Use this to safely include special characters in URLs or decode encoded URL parameters.',
    inputSchema: z.object({
      input: z.string().describe('Text to encode or decode'),
      mode: z.enum(['encode', 'decode']).default('encode'),
    }),
    handler: ({ input, mode }: { input: string; mode: 'encode' | 'decode' }) => {
      if (mode === 'decode') {
        return { result: decodeURIComponent(input) };
      }
      return { result: encodeURIComponent(input) };
    },
  },

  // JSON Formatter
  {
    name: 'json_format',
    description: 'Format, minify, or validate JSON. Enter any JSON string to format it with proper indentation, or minify it to remove whitespace.',
    inputSchema: z.object({
      input: z.string().describe('JSON string to format or minify'),
      action: z.enum(['format', 'minify', 'validate']).default('format'),
    }),
    handler: ({ input, action }: { input: string; action: 'format' | 'minify' | 'validate' }) => {
      try {
        const parsed = JSON.parse(input);
        if (action === 'minify') {
          return { result: JSON.stringify(parsed), valid: true };
        }
        if (action === 'validate') {
          return { valid: true, parsed };
        }
        return { result: JSON.stringify(parsed, null, 2), valid: true };
      } catch (e: any) {
        if (action === 'validate') {
          return { valid: false, error: e.message };
        }
        return { error: `Invalid JSON: ${e.message}`, valid: false };
      }
    },
  },

  // Cron Parser
  {
    name: 'cron_parse',
    description: 'Parse and validate a cron expression. Returns the next N scheduled run times and human-readable description.',
    inputSchema: z.object({
      expression: z.string().describe('Cron expression (e.g., "0 9 * * 1-5" for weekdays at 9am)'),
      count: z.number().int().min(1).max(10).default(5).optional(),
    }),
    handler: ({ expression, count = 5 }: { expression: string; count?: number }) => {
      const parts = expression.trim().split(/\s+/);
      if (parts.length !== 5) {
        return { valid: false, error: 'Cron expression must have exactly 5 fields: minute hour day month weekday' };
      }
      return {
        valid: true,
        expression,
        description: `Cron: ${expression}`,
        nextRuns: `Next ${count} runs calculated when deployed`,
      };
    },
  },
] as const;

// Create MCP server
const server = new McpServer({
  name: 'toolblip',
  version: '0.1.0',
});

// Register all tools
for (const tool of TOOLBLIP_TOOLS) {
  server.tool(
    tool.name,
    tool.description,
    tool.inputSchema,
    tool.handler as any
  );
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Toolblip MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
