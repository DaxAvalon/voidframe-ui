#!/usr/bin/env node
// create-voidframe-app — npm-canonical scaffold entrypoint.
//
// Wraps `voidframe init` so consumers can use the standard
// `npm create voidframe-app@latest my-app` invocation. The actual
// scaffolding logic lives in tools/cli/commands/_init-shared.mjs;
// both `voidframe init` and this binary import the same module, so
// behavior stays identical regardless of how consumers invoke it.

import { scaffold } from "../../cli/commands/_init-shared.mjs";

function parseArgs(argv) {
  const args = { dir: null, force: false, template: "app" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--force" || arg === "-f") args.force = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--template" || arg === "-t") args.template = argv[++i];
    else if (arg.startsWith("--template=")) args.template = arg.slice(11);
    else if (!args.dir && !arg.startsWith("-")) args.dir = arg;
  }
  return args;
}

function printHelp() {
  console.log(`Usage: npm create voidframe-app <directory> [--template <name>] [--force]

Scaffolds a new React + TypeScript project pre-wired with voidframe-ui's
provider, stylesheet, and a starter page.

Options:
  --template, -t <name>  Template to use: app (Vite SPA, default) or
                         next (Next.js App Router).
  --force, -f            Overwrite an existing non-empty directory.
  --help, -h             Show this message.

Examples:
  npm create voidframe-app@latest my-app
  npm create voidframe-app@latest my-app --template next
  npx create-voidframe-app my-app
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dir) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }
  const code = await scaffold({
    dir: args.dir,
    force: args.force,
    template: args.template,
    log: console,
  });
  process.exit(code ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
