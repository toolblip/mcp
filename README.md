# @toolblip/mcp

Use [Toolblip](https://toolblip.com) developer tools directly from Claude Code, Cursor, and other MCP-compatible AI clients.

Instead of copy-pasting JSON to a formatter, or opening a browser tab to encode Base64 — just ask your AI assistant to use the Toolblip tool directly. The tool runs locally, nothing is sent to a server.

## Available Tools

| Tool | What it does |
|------|-------------|
| `base64_encode` | Encode text to Base64 |
| `base64_decode` | Decode Base64 to text |
| `hash_generate` | Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes |
| `uuid_generate` | Generate UUID v4 (random) or v7 (time-sortable) |
| `url_encode` | URL-encode text |
| `url_decode` | URL-decode text |
| `json_format` | Format, minify, or validate JSON |
| `cron_parse` | Validate a cron expression |

More tools coming soon.

## Requirements

- Node.js 18+
- An MCP-compatible AI client (Claude Code, Cursor, etc.)

## Installation

```bash
npm install -g @toolblip/mcp
```

Or run without installing:

```bash
npx @toolblip/mcp
```

## Configuration

### Claude Code

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "toolblip": {
      "command": "npx",
      "args": ["@toolblip/mcp"]
    }
  }
}
```

Or for local development:

```json
{
  "mcpServers": {
    "toolblip": {
      "command": "node",
      "args": ["/path/to/toolblip-mcp/dist/index.js"]
    }
  }
}
```

### Cursor

1. Open Cursor Settings → MCP
2. Click "Add new MCP server"
3. Name: `toolblip`
4. Type: `stdio`
5. Command: `npx @toolblip/mcp`

### Other MCP Clients

Any MCP-compatible client that supports `stdio` transport can use this package. Consult your client's documentation for adding custom MCP servers.

## Usage Examples

```
You: Format this JSON for me:
{"name":"Toolblip","version":"1.0","active":true}

Claude: [uses json_format tool]
Result:
{
  "name": "Toolblip",
  "version": "1.0",
  "active": true
}
```

```
You: Generate 5 UUIDs for new user records

Claude: [uses uuid_generate tool with count: 5]
Result: [uuid1, uuid2, uuid3, uuid4, uuid5]
```

```
You: Hash the password 'secret123' using SHA-256

Claude: [uses hash_generate tool with algorithm: sha256]
Hash: 2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b
```

## How It Works

The MCP server runs as a local process and communicates via stdio. When you ask the AI to use a tool:

1. The AI client sends a JSON-RPC request to the MCP server
2. The server executes the tool logic in Node.js
3. The result is returned to the AI client

All tool logic runs locally. No data is sent to Toolblip's servers.

## Privacy

Tools like `hash_generate`, `uuid_generate`, and `base64_encode` are purely local operations — they use Node.js built-in APIs (`crypto`, `Buffer`) to process data. Nothing is transmitted over the network.

Tools like `json_format` process the JSON string locally. No data leaves your machine.

## Developing

```bash
# Clone and install
git clone https://github.com/toolblip/toolblip-mcp.git
cd toolblip-mcp
npm install

# Build TypeScript
npm run build

# Run locally
node dist/index.js
```

## License

MIT
