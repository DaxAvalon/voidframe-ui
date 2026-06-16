// Minimal, dependency-free MCP server over stdio. MCP is JSON-RPC 2.0; the
// stdio transport frames each message as one UTF-8 line of JSON. We implement
// just the methods a tools-only server needs: initialize, tools/list,
// tools/call, ping (plus the initialized notification).
//
// `createHandler` is pure (message in → message out or null), so it can be
// unit-tested without touching real stdin/stdout. `runStdio` wires it up.

import { TOOL_DEFINITIONS, runTool } from "./tools.mjs";
import { loadCatalog } from "./catalog.mjs";

const SERVER_INFO = { name: "voidframe-mcp", version: "0.1.0" };
const DEFAULT_PROTOCOL = "2024-11-05";
const SUPPORTED_PROTOCOLS = new Set([DEFAULT_PROTOCOL, "2025-03-26", "2025-06-18"]);

function ok(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function err(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/**
 * Build a message handler bound to a catalog.
 * @param {ReturnType<typeof loadCatalog>} catalog
 * @returns {(msg: any) => object | null} response, or null for notifications
 */
export function createHandler(catalog) {
  return function handle(msg) {
    if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
      return err(msg?.id ?? null, -32600, "Invalid Request");
    }
    const { id, method, params } = msg;
    const isNotification = id === undefined || id === null;

    switch (method) {
      case "initialize": {
        const requested = params?.protocolVersion;
        const protocolVersion = SUPPORTED_PROTOCOLS.has(requested)
          ? requested
          : DEFAULT_PROTOCOL;
        return ok(id, {
          protocolVersion,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });
      }
      case "notifications/initialized":
      case "initialized":
        return null; // notification, no reply
      case "ping":
        return ok(id, {});
      case "tools/list":
        return ok(id, { tools: TOOL_DEFINITIONS });
      case "tools/call": {
        const name = params?.name;
        const args = params?.arguments ?? {};
        try {
          const data = runTool(name, args, catalog);
          return ok(id, {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            isError: Boolean(data && data.error),
          });
        } catch (e) {
          return ok(id, {
            content: [{ type: "text", text: `Error: ${e.message}` }],
            isError: true,
          });
        }
      }
      default:
        if (isNotification) return null;
        return err(id, -32601, `Method not found: ${method}`);
    }
  };
}

/** Run the server over process stdin/stdout (newline-delimited JSON). */
export function runStdio({ input = process.stdin, output = process.stdout, catalog } = {}) {
  const handler = createHandler(catalog ?? loadCatalog());
  let buffer = "";
  input.setEncoding("utf8");
  input.on("data", (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let response;
      try {
        response = handler(JSON.parse(line));
      } catch {
        response = err(null, -32700, "Parse error");
      }
      if (response) output.write(JSON.stringify(response) + "\n");
    }
  });
}
