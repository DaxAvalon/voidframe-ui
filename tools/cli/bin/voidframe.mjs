#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "../commands/init.mjs";
import { themeCommand } from "../commands/theme.mjs";
import { codemodCommand } from "../commands/codemod.mjs";
import { doctorCommand } from "../commands/doctor.mjs";

const program = new Command();

program
  .name("voidframe")
  .description("Voidframe CLI — scaffolding, theme, codemods, health checks.")
  .version("1.0.0");

program
  .command("init <directory>")
  .description("Scaffold a new Vite + React project pre-wired with voidframe.")
  .option("--force", "Overwrite the target directory if it already exists.")
  .action(async (dir, opts) => {
    const code = await initCommand({ dir, force: Boolean(opts.force) });
    process.exit(code);
  });

program
  .command("theme <name>")
  .description(
    "Drop a voidframe theme override file into your project (name = dark|light|midnight|grey)."
  )
  .option("-o, --out <file>", "Where to write the theme file.", "voidframe.theme.ts")
  .action(async (name, opts) => {
    const code = await themeCommand({ name, out: opts.out });
    process.exit(code);
  });

program
  .command("codemod <name> [paths...]")
  .description("Run a voidframe codemod over the given paths.")
  .action(async (name, paths) => {
    const code = await codemodCommand({ name, paths });
    process.exit(code);
  });

program
  .command("doctor")
  .description("Sanity checks: voidframe version, React version, CSS import, peer deps.")
  .option("--cwd <dir>", "Project directory.", process.cwd())
  .action(async (opts) => {
    const code = await doctorCommand({ cwd: opts.cwd });
    process.exit(code);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
