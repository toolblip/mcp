# @toolblip/mcp

Exposes [Toolblip](https://toolblip.com) developer tools as MCP (Model Context Protocol) tools for use with Claude Code, Cursor, and any MCP-compatible AI client.

## Tools (18 total)

| Tool | Description |
|------|-------------|
| `base64_encode` | Encode text to Base64 |
| `base64_decode` | Decode Base64 to plain text |
| `hash_generate` | Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes |
| `uuid_generate` | Generate UUID v4 (random) or v7 (time-sortable) |
| `url_encode` | URL encode or decode components |
| `json_format` | Format, minify, or validate JSON |
| `cron_parse` | Parse cron expression → description + next N runs |
| `yaml_convert` | Convert YAML ↔ JSON, validate syntax |
| `case_convert` | Convert between camelCase, snake_case, kebab-case, etc. |
| `text_stats` | Count words, characters, sentences, paragraphs + reading time |
| `percentage_calculate` | Percentage math: X% of Y, what % is X of Y |
| `directory_search` | Search Toolblip directory for tools or MCP servers |
| `color_convert` | Convert between HEX, RGB, and HSL color formats |
| `regex_test` | Test regex patterns against strings, show all matches |
| `sql_format` | Prettify and format SQL queries |
| `html_encode` | Encode/decode HTML entities |
| `jwt_decode` | Decode JWT header, payload, expiration (no verification) |
| `css_gradient` | Generate CSS linear/radial/conic gradient code |

## Installation

### Claude Code

```bash
claude mcp add toolblip -- npx -y @toolblip/mcp
```

### Cursor

Settings → MCP Server → Add new server:

```json
{
  "mcpServers": {
    "toolblip": {
      "command": "npx",
      "args": ["-y", "@toolblip/mcp"]
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TOOLBLIP_API_URL` | `https://api.toolblip.com` | Toolblip API base URL |

## Requirements

- Node.js 18+
- npm or yarn

## Development

```bash
npm install
npm run build    # TypeScript → dist/
npm run test:run
```

## License

MIT
