// `voidframe init` command. Thin proxy to the shared scaffold logic;
// `tools/create-voidframe-app/bin/cli.mjs` uses the same shared module
// so both entrypoints stay in sync.

import { scaffold } from "./_init-shared.mjs";

export async function initCommand(opts) {
  return scaffold(opts);
}
