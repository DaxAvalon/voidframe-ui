#!/usr/bin/env node
// voidframe-mcp — Model Context Protocol server exposing voidframe-ui's
// component, hook, and utility catalog to AI agents (Claude Desktop, Cursor,
// etc.) over stdio.

import { runStdio } from "../lib/server.mjs";

runStdio();
