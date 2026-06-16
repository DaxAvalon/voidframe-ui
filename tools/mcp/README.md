# voidframe-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes
[voidframe-ui](https://npmjs.com/package/voidframe-ui)'s component, hook, and
utility catalog to AI agents — so Claude, Cursor, and other MCP clients can look
up exact component names, props, types, and signatures instead of guessing.

It's a **zero-dependency** stdio server built over the same structured data that
powers the docs site and `llms.txt`.

## Tools

| Tool | Purpose |
| --- | --- |
| `list_components` | List components, filterable by `kind` (`element`, `layout`, `primitive`, `provider`, `subcomponent`, `compat`) or a search `query`. |
| `get_component` | Full docs for one component: kind, source file, description, and every prop (type, default, required, description). |
| `list_hooks` / `get_hook` | List hooks or fetch one hook's signature + description. |
| `list_utils` / `get_util` | List utilities or fetch one utility's signature + description. |
| `search` | Search components, hooks, and utilities at once. |

## Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voidframe": {
      "command": "npx",
      "args": ["-y", "voidframe-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "voidframe": { "command": "npx", "args": ["-y", "voidframe-mcp"] }
  }
}
```

### Claude Code

```bash
claude mcp add voidframe -- npx -y voidframe-mcp
```

## Data source

The catalog is resolved in this order:

1. `VOIDFRAME_MCP_DATA` — a directory containing `components.json`, `hooks.json`,
   and `utils.json` (point this at a specific version if you like).
2. A `data/` snapshot bundled in the published package.
3. The monorepo's `docs/public/api/` (used when running from a checkout).

To refresh the bundled snapshot before publishing the standalone package, run
`npm run docs:extract-props && npm run docs:generate-llms` at the repo root,
then `node tools/mcp/scripts/sync-data.mjs`.

## Running directly

```bash
npx voidframe-mcp        # speaks MCP over stdio
```

The server implements JSON-RPC 2.0 with `initialize`, `tools/list`,
`tools/call`, and `ping` — no SDK required.
