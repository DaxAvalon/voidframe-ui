// Post-build step for the eslint-plugin-voidframe rule dist.
//
// Two fixes applied to the raw tsc output so ESLint's `--rulesdir`
// loader can consume the compiled rules:
//
// 1. Drop a scoped `package.json` with `"type": "commonjs"` into the
//    emit directory. The root package is `"type": "module"`, which
//    would otherwise cause Node to treat the emitted `.js` files as
//    ESM and reject the `exports.default = …` lines the TS CJS
//    compiler emits. A scoped package.json overrides that for this
//    subtree only.
//
// 2. Append `module.exports = module.exports.default || module.exports;`
//    to every compiled rule. TypeScript compiles `export default rule`
//    to `exports.default = rule`, but ESLint's `--rulesdir` loader
//    expects `module.exports` itself to BE the rule (with `meta` +
//    `create` at the top level). The shim collapses the default
//    export up to the module level, leaving non-default-export rules
//    alone.
import { readdirSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "tools/eslint-plugin-voidframe/dist";
const RULES = join(DIST, "rules");

writeFileSync(join(DIST, "package.json"), '{"type":"commonjs"}\n');

const SHIM = "\nmodule.exports = module.exports.default || module.exports;\n";
for (const file of readdirSync(RULES)) {
  if (!file.endsWith(".js")) continue;
  appendFileSync(join(RULES, file), SHIM);
}

console.log(`[postbuild] shimmed ${readdirSync(RULES).filter(f => f.endsWith(".js")).length} rule files + emitted CJS package.json`);
