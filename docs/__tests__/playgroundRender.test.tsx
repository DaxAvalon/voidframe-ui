/**
 * Render-audit gate for every docs playground snippet.
 *
 * Each snippet is evaluated through react-live's real pipeline and
 * mounted; the classification must match docs/audit/baseline.json:
 *
 *   - An entry NOT in the baseline must classify "ok" — a new broken
 *     or empty playground fails CI.
 *   - An entry IN the baseline must still be broken — once fixed, it
 *     must be removed from the baseline (the ratchet only shrinks).
 *
 * Run `npm run docs:audit` to write a full triage report to
 * docs/audit/report.json + report.md (gitignored).
 */
import { afterAll, describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  auditEntry,
  enumeratePlaygroundEntries,
  type AuditResult,
} from "../audit/playgroundAudit";
import baseline from "../audit/baseline.json";

// Several override snippets call alert() on interaction handlers; a few
// invoke it during render-adjacent code paths. happy-dom has no alert.
globalThis.alert ??= () => {};

const baselineIds = new Set(Object.keys(baseline as Record<string, unknown>));
const entries = enumeratePlaygroundEntries();
const results: AuditResult[] = [];

describe("Playground snippets render", () => {
  for (const entry of entries) {
    it(`${entry.source}: ${entry.name} — ${entry.title}`, () => {
      const result = auditEntry(entry);
      results.push(result);

      if (baselineIds.has(entry.id)) {
        expect(
          result.classification,
          `${entry.id} is in docs/audit/baseline.json but now renders OK — ` +
            `remove its baseline entry so the ratchet keeps shrinking.`,
        ).not.toBe("ok");
      } else {
        expect(
          result.classification,
          `${entry.id} classified "${result.classification}"` +
            (result.error ? ` — ${result.error}` : "") +
            `\nFix the snippet (docs/curated.tsx or docs/autoPlayground.ts) ` +
            `or, if knowingly broken, add it to docs/audit/baseline.json.`,
        ).toBe("ok");
      }
    });
  }
});

afterAll(() => {
  if (!process.env.PLAYGROUND_AUDIT_REPORT) return;

  const broken = results.filter((r) => r.classification !== "ok");
  const dir = join(__dirname, "..", "audit");

  writeFileSync(
    join(dir, "report.json"),
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        total: results.length,
        ok: results.length - broken.length,
        broken: broken.length,
        results,
      },
      null,
      2,
    ),
  );

  const bySource = (src: string) =>
    broken.filter((r) => r.source === src);
  const lines: string[] = [
    `# Playground render audit`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    `Total: ${results.length} · OK: ${results.length - broken.length} · Broken: ${broken.length}`,
    ``,
  ];
  for (const source of ["autogen", "override", "curated", "pattern"]) {
    const group = bySource(source);
    if (group.length === 0) continue;
    lines.push(`## ${source} (${group.length})`, ``);
    lines.push(`| Component | Example | Classification | Error |`);
    lines.push(`|---|---|---|---|`);
    for (const r of group) {
      const err = (r.error ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(`| ${r.name} | ${r.title} | ${r.classification} | ${err} |`);
    }
    lines.push(``);
  }
  writeFileSync(join(dir, "report.md"), lines.join("\n"));
});
