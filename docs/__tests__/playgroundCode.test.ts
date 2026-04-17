/**
 * Validates that every playground code string in the docs site
 * can be parsed as valid JSX. If a code block fails here, it WILL
 * fail in the browser's react-live playground.
 *
 * Uses TypeScript's parser (already available) to check JSX syntax.
 */
import { describe, expect, it } from "vitest";
import ts from "typescript";

// Import all code sources
import { curated } from "../curated";
import { patterns } from "../patterns";
import { generatePlaygroundCode } from "../autoPlayground";
import propsData from "../data/props.json";
import type { ComponentDoc } from "../../src/dev";

/**
 * Parse a code string as JSX/TSX and return any syntax errors.
 * react-live expects either:
 * - A single JSX expression (inline mode)
 * - A script with function declarations + render() call (noInline mode)
 */
function getParseErrors(code: string, label: string): string[] {
  const hasRender = /\brender\s*\(/.test(code);

  // Wrap inline JSX in a function so the TS parser accepts it as a statement
  const source = hasRender
    ? code
    : `function __playground__() { return (\n${code}\n); }`;

  const sourceFile = ts.createSourceFile(
    `${label}.tsx`,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );

  const errors: string[] = [];

  // Check for parse diagnostics (syntax errors)
  // TypeScript's parser stores these on the source file
  const diags = (sourceFile as unknown as { parseDiagnostics?: ts.Diagnostic[] })
    .parseDiagnostics;

  if (diags && diags.length > 0) {
    for (const d of diags) {
      const pos = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0);
      const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      errors.push(`Line ${pos.line + 1}:${pos.character}: ${msg}`);
    }
  }

  return errors;
}

describe("Curated playground code strings", () => {
  for (const [name, entry] of Object.entries(curated)) {
    for (const example of entry.examples) {
      it(`${name} — "${example.title}" parses as valid JSX`, () => {
        const errors = getParseErrors(
          example.code,
          `curated-${name}-${example.title}`,
        );
        expect(errors, `Parse errors in ${name} / ${example.title}:\n${errors.join("\n")}`).toHaveLength(0);
      });
    }
  }
});

describe("Pattern playground code strings", () => {
  for (const pattern of patterns) {
    it(`${pattern.title} parses as valid JSX`, () => {
      const errors = getParseErrors(pattern.code, `pattern-${pattern.id}`);
      expect(errors, `Parse errors in ${pattern.title}:\n${errors.join("\n")}`).toHaveLength(0);
    });

    it(`${pattern.title} has correct noInline detection`, () => {
      const hasRender = /\brender\s*\(/.test(pattern.code);
      const hasFunctionDecl = /^function\s+\w+/.test(pattern.code.trim());
      if (hasFunctionDecl) {
        expect(
          hasRender,
          `${pattern.title} starts with a function declaration but has no render() call — will fail in inline mode`,
        ).toBe(true);
      }
    });
  }
});

describe("Curated noInline detection", () => {
  for (const [name, entry] of Object.entries(curated)) {
    for (const example of entry.examples) {
      it(`${name} — "${example.title}" noInline detection is correct`, () => {
        const hasRender = /\brender\s*\(/.test(example.code);
        const hasFunctionDecl = /^function\s+\w+/.test(example.code.trim());
        if (hasFunctionDecl) {
          expect(
            hasRender,
            `${name}/${example.title} starts with function but no render() — needs noInline`,
          ).toBe(true);
        }
      });
    }
  }
});

describe("Auto-generated playground code strings", () => {
  const docs = propsData as ComponentDoc[];
  const withProps = docs.filter((d) => d.props.length > 0);

  for (const doc of withProps) {
    const code = generatePlaygroundCode(doc);
    if (code) {
      it(`${doc.name} auto-playground parses as valid JSX`, () => {
        const errors = getParseErrors(code, `auto-${doc.name}`);
        expect(errors, `Parse errors in auto:${doc.name}:\n${errors.join("\n")}\n\nGenerated code:\n${code}`).toHaveLength(0);
      });
    }
  }
});
