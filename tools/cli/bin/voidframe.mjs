#!/usr/bin/env node
import { Command } from "commander";
import { fileURLToPath } from "node:url";
import { initCommand } from "../commands/init.mjs";
import { themeCommand } from "../commands/theme.mjs";
import { codemodCommand } from "../commands/codemod.mjs";
import { doctorCommand } from "../commands/doctor.mjs";
import { testCommand } from "../commands/test.mjs";

/**
 * Build the commander program. Exported so tests can import + inspect
 * the command tree without triggering `parseAsync`.
 */
export function buildProgram({ exit = true } = {}) {
  const program = new Command();

  // In test mode, disable commander's process.exit + thrown errors so
  // we can exercise command handlers in-process.
  if (!exit) {
    program.exitOverride();
    program.configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    });
  }

  program
    .name("voidframe")
    .description("Voidframe CLI — scaffolding, theme, codemods, health checks.")
    .version("1.0.0");

  const done = (code) => {
    if (exit) process.exit(code);
  };

  program
    .command("init <directory>")
    .description("Scaffold a new Vite + React project pre-wired with voidframe.")
    .option("--force", "Overwrite the target directory if it already exists.")
    .action(async (dir, opts) => {
      const code = await initCommand({ dir, force: Boolean(opts.force) });
      done(code);
    });

  program
    .command("theme <name>")
    .description(
      "Drop a voidframe theme override file into your project (name = dark|light|midnight|grey)."
    )
    .option("-o, --out <file>", "Where to write the theme file.", "voidframe.theme.ts")
    .action(async (name, opts) => {
      const code = await themeCommand({ name, out: opts.out });
      done(code);
    });

  program
    .command("codemod <name> [paths...]")
    .description("Run a voidframe codemod over the given paths.")
    .action(async (name, paths) => {
      const code = await codemodCommand({ name, paths });
      done(code);
    });

  program
    .command("doctor")
    .description("Sanity checks: voidframe version, React version, CSS import, peer deps.")
    .option("--cwd <dir>", "Project directory.", process.cwd())
    .action(async (opts) => {
      const code = await doctorCommand({ cwd: opts.cwd });
      done(code);
    });

  program
    .command("test <name>")
    .description(
      "Scaffold a vitest file for a voidframe component, hook, or utility under src/."
    )
    .option(
      "-t, --type <kind>",
      "Target kind: component, hook, or util.",
      "component"
    )
    .option("--force", "Overwrite the target test file if it already exists.")
    .option("--cwd <dir>", "Project directory.", process.cwd())
    .action(async (name, opts) => {
      const code = await testCommand({
        name,
        type: opts.type,
        force: Boolean(opts.force),
        cwd: opts.cwd,
      });
      done(code);
    });

  return program;
}

export async function runCli(argv = process.argv) {
  const program = buildProgram({ exit: true });
  await program.parseAsync(argv).catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}

// Only run the CLI when invoked directly, not when imported by tests.
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  runCli();
}
