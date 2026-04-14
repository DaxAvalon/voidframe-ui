# 13 — Components: Specialty

**Goal:** Ship ~20 specialty components — domain-specific surfaces and dev-tool primitives that together complete the tier-1 offering.

**Effort:** 3-5 days.

## Developer tools

### S01. Terminal (expanded from Phase 09)

Full-featured terminal emulator display.

```tsx
<Terminal
  lines                                  // array of strings or structured log entries
  prompt
  onCommand
  history previousCommands
  autoFocus
  ansiColor                              // parse ANSI escape codes
  cursor="block" | "underline" | "bar" blink
  copyOnSelect
  onResize                               // reports cols/rows based on container
/>
```

### S02. CodeEditor (see Phase 07 F31)

### S03. CommitGraph (new)

Git-like commit graph visualization.

```tsx
<CommitGraph
  commits={Commit[]}
  branches
  onCommitClick
/>
```

### S04. DiffViewer (see Phase 09 D25 — expand here)

Side-by-side or unified diff viewer with hunk folding.

### S05. LogViewer (see Phase 09 D26)

### S06. JSONViewer (see Phase 09 D24)

### S07. NetworkInspector (new)

Displays HTTP request list with filtering, request/response viewer.

```tsx
<NetworkInspector
  requests={NetworkRequest[]}
  onRequestSelect
  filter
/>
```

### S08. ConsoleOutput (new)

Browser-console-like output. Levels: log, warn, error, info, debug.

```tsx
<ConsoleOutput entries filter="warn+" />
```

### S09. DebugTree (new)

Tree viewer optimized for debugging objects (similar to React DevTools props/state panel).

### S10. KeyValueEditor (new)

```tsx
<KeyValueEditor
  entries={{ key, value, disabled? }[]}
  onChange
  keyPlaceholder="Header name"
  valuePlaceholder="Value"
  onAdd onRemove
/>
```

- For HTTP headers, env vars, query params.

### S11. QueryBuilder (new)

Visual filter builder.

```tsx
<QueryBuilder
  fields={FieldDef[]}
  operators
  value: Query
  onChange
/>
```

- AND/OR groups, field/operator/value rows.

### S12. ShortcutEditor (new)

UI for binding keyboard shortcuts.

```tsx
<ShortcutEditor
  value: string                           // e.g. "mod+shift+k"
  onChange
  conflicts={string[]}                    // existing shortcuts to warn on conflict
/>
```

- Records keypresses into canonical string format.

---

## Identity & Status

### S13. UserCard (new)

Rich user info card.

```tsx
<UserCard
  user={{ name, email, avatar, role, title, team }}
  actions={<UserCardActions />}
  compact
/>
```

### S14. TeamCard (new)

### S15. OrganizationCard (new)

### S16. Identicon (new)

Deterministic avatar from a string (hash-based geometric pattern).

```tsx
<Identicon value="user@example.com" size={32} />
```

### S17. PresenceList (new)

List of online/away/offline users.

```tsx
<PresenceList users={{ id, name, avatar, status }[]} maxVisible />
```

---

## Finance / Numeric

### S18. CurrencyDisplay (new)

Semantic display of a monetary value.

```tsx
<CurrencyDisplay value={1234.56} currency="USD" locale signed compact />
```

### S19. PercentDisplay (new)

### S20. NumberDisplay (new — formatted number rendering with semantics)

### S21. BigNumber (new — hero metric display)

```tsx
<BigNumber value unit delta sparkline label />
```

---

## Booking / Time

### S22. TimeZoneSelect (new)

Searchable time-zone picker.

### S23. RelativeTime (new)

Auto-updating relative time ("2 minutes ago").

```tsx
<RelativeTime date={Date | string} updateInterval />
```

### S24. DurationDisplay (new)

```tsx
<DurationDisplay seconds={3724} format="hms" | "compact" | "long" />
```

### S25. Countdown (new)

```tsx
<Countdown target={Date} onComplete format />
```

---

## Rich content

### S26. MarkdownRenderer (see Phase 09 D28 — expand here)

Full-featured markdown rendering with plugins.

```tsx
<MarkdownRenderer
  content
  remarkPlugins={[gfm, math]}
  rehypePlugins={[raw, slug, autolinkHeadings]}
  components={{ h1: MyH1 }}
  sanitize
  allowHtml
  linkify
/>
```

### S27. Mermaid (new — diagram rendering)

```tsx
<Mermaid chart={`graph LR; A-->B`} />
```

- Peer dep on `mermaid`; lazy-loaded.

### S28. Excalidraw / Whiteboard (advanced, optional)

Embed for whiteboard editor. Optional — document integration pattern, don't bundle.

---

## Shortcuts & Help

### S29. ShortcutGuide (new)

Overlay listing all registered shortcuts, grouped by scope.

```tsx
<ShortcutGuide
  groups={{ heading, shortcuts: [{ keys, description }] }[]}
  open onOpenChange
/>
```

- Auto-registered from `useKeyboardShortcut` hook (optional opt-in).

### S30. HelpTooltip (new)

Question-mark icon with tooltip.

```tsx
<HelpTooltip>Explanation of this field.</HelpTooltip>
```

### S31. ContextHelp (new)

Contextual help panel that overlays with explanation for the focused element.

### S32. Changelog (new)

Displays release notes / changelog.

```tsx
<Changelog
  entries={{ version, date, changes: Change[] }[]}
  collapsed
/>
```

### S33. WhatsNewPopover (new)

Triggered once per version to highlight new features.

```tsx
<WhatsNewPopover version features onDismiss />
```

---

## Utility / One-offs

### S34. QRCode (new)

```tsx
<QRCode value size={200} ecc="L" | "M" | "Q" | "H" logo />
```

- Generated via peer dep (`qrcode-generator`) or our own (small).

### S35. Barcode (new)

```tsx
<Barcode value format="code128" | "ean13" | ... />
```

### S36. ColorSwatch (new)

```tsx
<ColorSwatch color="#ff0000" size showLabel />
```

### S37. Palette (new)

Grid of color swatches, clickable.

### S38. LegalText (new — small-print wrapper with typography)

```tsx
<LegalText>By continuing, you agree...</LegalText>
```

### S39. Kbd (see Phase 08 N25)

---

## Dashboards / Widgets

### S40. WidgetShell (new)

Standard card shell for dashboard widgets — header with title + menu, optional footer, loading state, error state.

```tsx
<WidgetShell
  title actions loading error
  footer
  height resizable draggable
>
  {content}
</WidgetShell>
```

### S41. DashboardGrid (new)

Grid of draggable, resizable widgets. Integrates with WidgetShell.

```tsx
<DashboardGrid
  items={{ id, x, y, w, h }[]}
  onLayoutChange
  cols breakpoints
/>
```

- Wraps `react-grid-layout` (peer dep) or thin custom impl.

---

## Print

### S42. PrintLayout (new)

Styles children for print output.

```tsx
<PrintLayout title="Report" includeHeader includeFooter>
  ...
</PrintLayout>
```

- Print stylesheet via `@media print`.

### S43. PrintButton (new)

```tsx
<PrintButton target={ref}>Print</PrintButton>
```

---

## Acceptance Criteria

- [ ] All ~35 specialty components implemented.
- [ ] Terminal handles ANSI color + keyboard input cleanly.
- [ ] MarkdownRenderer supports GFM + math + syntax highlighting.
- [ ] QueryBuilder generates valid queries against a schema.
- [ ] ShortcutGuide auto-registers shortcuts.
- [ ] DashboardGrid supports drag + resize + persist layout.
- [ ] All pass axe audit.
- [ ] Peer deps (mermaid, pdf.js, qrcode-generator, react-grid-layout) are documented — not bundled.
