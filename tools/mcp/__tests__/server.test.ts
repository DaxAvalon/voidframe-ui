import { describe, expect, it } from "vitest";
import { PassThrough } from "node:stream";
import { loadCatalog } from "../lib/catalog.mjs";
import { createHandler, runStdio } from "../lib/server.mjs";

const catalog = loadCatalog();
const handle = createHandler(catalog);

describe("MCP protocol handler", () => {
  it("initialize echoes a supported protocol and advertises tools", () => {
    const res: any = handle({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18" },
    });
    expect(res.result.protocolVersion).toBe("2025-06-18");
    expect(res.result.capabilities.tools).toBeTruthy();
    expect(res.result.serverInfo.name).toBe("voidframe-mcp");
  });

  it("initialize falls back to a default for an unknown protocol", () => {
    const res: any = handle({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "1999-01-01" },
    });
    expect(res.result.protocolVersion).toBe("2024-11-05");
  });

  it("returns null (no reply) for the initialized notification", () => {
    expect(handle({ jsonrpc: "2.0", method: "notifications/initialized" })).toBeNull();
  });

  it("tools/list returns the tool definitions", () => {
    const res: any = handle({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    expect(res.result.tools.map((t: any) => t.name)).toContain("get_component");
  });

  it("tools/call returns text content with the tool result", () => {
    const res: any = handle({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "get_component", arguments: { name: "AccessibleIcon" } },
    });
    expect(res.result.isError).toBe(false);
    const payload = JSON.parse(res.result.content[0].text);
    expect(payload.name).toBe("AccessibleIcon");
  });

  it("tools/call flags isError for an unknown component", () => {
    const res: any = handle({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "get_component", arguments: { name: "Nope" } },
    });
    expect(res.result.isError).toBe(true);
  });

  it("unknown method yields a -32601 error", () => {
    const res: any = handle({ jsonrpc: "2.0", id: 5, method: "no/such" });
    expect(res.error.code).toBe(-32601);
  });

  it("round-trips newline-delimited JSON over stdio streams", async () => {
    const input = new PassThrough();
    const output = new PassThrough();
    runStdio({ input, output, catalog });

    const lines: string[] = [];
    output.setEncoding("utf8");
    output.on("data", (chunk: string) => {
      for (const l of chunk.split("\n")) if (l.trim()) lines.push(l);
    });

    input.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) + "\n");
    // Notifications produce no output line.
    input.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    input.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "list_hooks", arguments: { limit: 1 } },
      }) + "\n"
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(lines.length).toBe(2); // only the two requests with ids reply
    const second = JSON.parse(lines[1]);
    expect(second.id).toBe(2);
    expect(JSON.parse(second.result.content[0].text).count).toBe(1);
  });
});
