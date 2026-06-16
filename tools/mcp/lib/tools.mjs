// MCP tool definitions and dispatch for the voidframe catalog. Each tool is a
// pure function of (args, catalog); the transport layer adapts the return
// value into an MCP tools/call result.

import {
  searchList,
  componentSummary,
  apiSummary,
} from "./catalog.mjs";

const KINDS = ["element", "layout", "primitive", "provider", "subcomponent", "compat"];

/** JSON Schema tool definitions, returned verbatim from tools/list. */
export const TOOL_DEFINITIONS = [
  {
    name: "list_components",
    description:
      "List voidframe-ui components, optionally filtered by kind or a search query. Returns name, kind, and a one-line description.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Case-insensitive search over name and description." },
        kind: { type: "string", enum: KINDS, description: "Filter to a single component kind." },
        limit: { type: "number", description: "Max results (default 50)." },
      },
    },
  },
  {
    name: "get_component",
    description:
      "Get the full documentation for one component: kind, source file, description, and every prop with its type, default, requiredness, and description.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Exact component name, e.g. \"Dialog\"." } },
      required: ["name"],
    },
  },
  {
    name: "list_hooks",
    description: "List voidframe-ui hooks, optionally filtered by a search query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number", description: "Max results (default 50)." },
      },
    },
  },
  {
    name: "get_hook",
    description: "Get the signature and description for one hook.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Exact hook name, e.g. \"useDisclosure\"." } },
      required: ["name"],
    },
  },
  {
    name: "list_utils",
    description: "List voidframe-ui utility functions, optionally filtered by a search query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number", description: "Max results (default 50)." },
      },
    },
  },
  {
    name: "get_util",
    description: "Get the signature and description for one utility function.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Exact utility name, e.g. \"addDays\"." } },
      required: ["name"],
    },
  },
  {
    name: "search",
    description:
      "Search across components, hooks, and utilities at once. Use when you don't know which category an API belongs to.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number", description: "Max results per category (default 10)." },
      },
      required: ["query"],
    },
  },
];

function notFound(kind, name) {
  return { error: `No ${kind} named "${name}". Try the matching list_/search tool to find the exact name.` };
}

/**
 * Run a tool by name. Returns a plain JSON-serializable object; throws on an
 * unknown tool name.
 */
export function runTool(name, args = {}, catalog) {
  switch (name) {
    case "list_components": {
      let list = catalog.components;
      if (args.kind) list = list.filter((c) => c.kind === args.kind);
      const results = searchList(list, args.query, args.limit ?? 50);
      return { count: results.length, components: results.map(componentSummary) };
    }
    case "get_component": {
      const c = catalog.byName.component.get(args.name);
      return c ?? notFound("component", args.name);
    }
    case "list_hooks": {
      const results = searchList(catalog.hooks, args.query, args.limit ?? 50);
      return { count: results.length, hooks: results.map(apiSummary) };
    }
    case "get_hook": {
      const h = catalog.byName.hook.get(args.name);
      return h ?? notFound("hook", args.name);
    }
    case "list_utils": {
      const results = searchList(catalog.utils, args.query, args.limit ?? 50);
      return { count: results.length, utils: results.map(apiSummary) };
    }
    case "get_util": {
      const u = catalog.byName.util.get(args.name);
      return u ?? notFound("utility", args.name);
    }
    case "search": {
      const limit = args.limit ?? 10;
      return {
        components: searchList(catalog.components, args.query, limit).map(componentSummary),
        hooks: searchList(catalog.hooks, args.query, limit).map(apiSummary),
        utils: searchList(catalog.utils, args.query, limit).map(apiSummary),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
