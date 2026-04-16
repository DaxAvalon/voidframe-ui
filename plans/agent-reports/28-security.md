# Audit 28 — Security

## Summary
Phase 30 hardening fully intact. No critical or high vulnerabilities. One medium finding.

## Medium

1. **deepMerge prototype pollution** — `src/utils/formatters.ts:113-131` — `Object.keys(source)` does not filter `__proto__`, `constructor`, or `prototype` keys. If theme config accepts untrusted JSON, prototype pollution is possible. Fix: add key filtering for dangerous prototype keys.

## Verified Secure

### innerHTML usage
- 8 files use innerHTML — all protected:
  - RichEmbed.tsx: sanitizeHtml(svg, "svg") + mermaid securityLevel:"strict"
  - RichTextEditor.tsx: sanitizeHtml("rich-text") + safeHref on links
  - CodeBlock.tsx: documented caller responsibility via highlight prop
  - MarkdownEditor.tsx: React elements only, no innerHTML
  - 4 test files (expected)
- Zero unsafe HTML injection usage in production code

### safeHref
- 26 instances across all href-accepting components
- All navigation, content, data, media, and chat components covered
- Blocks: javascript:, data:, vbscript:, file: schemes
- Handles: whitespace, control chars, case variations

### sanitizeHtml
- 3 profiles: rich-text, svg, strict
- Forces rel="noreferrer noopener" on target="_blank"
- SSR-safe (returns empty string server-side)

### Markdown
- No innerHTML in pipeline — tokenize then React elements
- safeHref on all link tokens
- Custom renderPreview is consumer responsibility (documented)

### Other
- Zero eval/Function constructor/setTimeout(string)
- No CSS injection vectors
- No unsafe URL assignment (window.open, location.href)
- iframe src is consumer responsibility (sandbox attribute available)

## Phase 40-47 Components
- ChatComposer: slash commands are data-only, no execution
- DataGrid editing: safe input element, consumer validates
- FormProvider: errors rendered as text nodes
- AsyncData: error messages rendered safely
