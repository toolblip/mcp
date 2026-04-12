// Directory search — queries the Toolblip API for tools and MCP servers

export interface DirectoryResult {
  tools?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
  }>;
  servers?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
  }>;
  total?: number;
}

export async function searchDirectory(query: string, type: 'tools' | 'servers' = 'tools'): Promise<{
  result?: string;
  valid: boolean;
  error?: string;
}> {
  const baseUrl = process.env.TOOLBLIP_API_URL ?? 'https://api.toolblip.com';

  try {
    const endpoint = type === 'tools' ? '/api/tools' : '/api/mcp/servers';
    const url = `${baseUrl}${endpoint}?search=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': '@toolblip/mcp',
      },
    });

    if (!response.ok) {
      return { valid: false, error: `API returned ${response.status}` };
    }

    const data = await response.json() as DirectoryResult;

    if (type === 'tools' && data.tools) {
      const lines = data.tools.map(t =>
        `• **${t.name}** — ${t.description} (${t.slug})\n  Category: ${t.category} | Tags: ${t.tags.join(', ')}`
      );
      return {
        result: `Found ${data.total ?? data.tools.length} tool(s):\n\n${lines.join('\n\n')}`,
        valid: true,
      };
    }

    if (type === 'servers' && data.servers) {
      const lines = data.servers.map(s =>
        `• **${s.name}** — ${s.description} (${s.slug})\n  Category: ${s.category}`
      );
      return {
        result: `Found ${data.total ?? data.servers.length} MCP server(s):\n\n${lines.join('\n\n')}`,
        valid: true,
      };
    }

    return { result: 'No results found', valid: true };
  } catch (e: any) {
    return { valid: false, error: `Network error: ${e.message}` };
  }
}
