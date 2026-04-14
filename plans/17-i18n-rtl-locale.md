# 17 — i18n, RTL, and Locale

**Goal:** Voidframe is fully internationalizable — every built-in string is translatable, every layout mirrors cleanly in RTL, every date/number/currency formats per user locale.

**Depends on:** 04 CSS (logical properties), 15 Theming (direction).
**Effort:** 2-3 days.

## Translatable Strings

Voidframe's built-in UI has strings that must be translatable:

- Pagination: "Next", "Previous", "Page", "of", "Go to page"
- Table: "No data", "Loading", "Sort ascending", "Sort descending"
- FileUpload: "Drop files here or click to browse", "Remove"
- Form: "Required", "Optional"
- DatePicker: month names, day names, "Today", "Clear"
- ConfirmDialog defaults: "Cancel", "Confirm", "OK"
- Toast: "Dismiss"
- Modal: "Close"
- Combobox: "No results", "Clear"
- Empty states: "No items"
- Error states: "Something went wrong", "Retry"
- Accessibility labels: "Menu", "Close", "Open", "Expand", "Collapse"

## Message Catalog

```ts
export interface VoidframeMessages {
  pagination: {
    previous: string;
    next: string;
    page: (n: number) => string;
    pageOf: (current: number, total: number) => string;
    goToPage: (n: number) => string;
  };
  table: {
    noData: string;
    loading: string;
    sortAscending: string;
    sortDescending: string;
    clearSort: string;
  };
  fileUpload: {
    dropOrBrowse: string;
    remove: string;
    tooLarge: (maxBytes: number) => string;
    tooMany: (max: number) => string;
  };
  form: {
    required: string;
    optional: string;
    invalid: string;
  };
  datePicker: {
    today: string;
    clear: string;
    months: string[];        // 12
    monthsShort: string[];   // 12
    days: string[];          // 7
    daysShort: string[];     // 7
    daysMin: string[];       // 7
  };
  dialog: {
    cancel: string;
    confirm: string;
    ok: string;
  };
  overlay: {
    close: string;
    dismiss: string;
    open: string;
  };
  combobox: {
    noResults: string;
    clear: string;
    placeholder: string;
  };
  empty: {
    noItems: string;
  };
  error: {
    title: string;
    retry: string;
  };
  a11y: {
    menu: string;
    expand: string;
    collapse: string;
    selected: string;
    loading: string;
  };
}
```

### Shipped locales

Ship a minimum of:

- `en` (default)
- `es` (Spanish)
- `fr` (French)
- `de` (German)
- `pt` (Portuguese)
- `it` (Italian)
- `ja` (Japanese)
- `zh-CN` (Simplified Chinese)
- `zh-TW` (Traditional Chinese)
- `ko` (Korean)
- `ar` (Arabic — RTL)
- `he` (Hebrew — RTL)
- `ru` (Russian)
- `tr` (Turkish)
- `nl` (Dutch)
- `pl` (Polish)
- `sv` (Swedish)
- `hi` (Hindi)

Additional locales can be contributed. Each is ~2-4KB.

Consumers import only what they need:

```tsx
import { ja } from "voidframe/locales";
<VoidframeProvider messages={ja}>
```

## Provider Integration

```tsx
<VoidframeProvider
  messages={esMessages}           // partial override
  locale="es-ES"                  // BCP 47
  direction="ltr" | "rtl"         // or auto from locale
  firstDayOfWeek={1}              // derive from locale if unspecified
  timeZone="Europe/Madrid"        // default for date formatting
>
  <App />
</VoidframeProvider>
```

Messages deep-merge with English defaults — consumers only override what they need.

Hook: `useMessages()` returns the resolved messages.

Helper: `t(path, args?)`:

```tsx
const { t } = useMessages();
<span>{t("pagination.previous")}</span>
<span>{t("pagination.pageOf", { current: 2, total: 10 })}</span>
```

## Pluralization

Use `Intl.PluralRules`:

```ts
export function pluralize(n: number, locale: string, forms: { one: string; other: string; zero?: string; few?: string; many?: string; two?: string }): string {
  const rule = new Intl.PluralRules(locale).select(n);
  return forms[rule as keyof typeof forms] ?? forms.other;
}

// Usage:
t("files.count", { n: 3 })
// => { en: "3 files", ja: "3件" }
```

## Locale-Aware Formatting

Exposed utilities (extend existing `utils.ts`):

```ts
formatNumber(n, locale, options)            // Intl.NumberFormat
formatCurrency(n, currency, locale)         // Intl.NumberFormat { style: currency }
formatPercent(n, locale)                    // Intl.NumberFormat { style: percent }
formatDate(d, locale, options)              // Intl.DateTimeFormat
formatRelativeTime(d, locale)               // Intl.RelativeTimeFormat ("2 hours ago")
formatList(items, locale, options)          // Intl.ListFormat ("A, B, and C")
```

Components that display numbers/dates use these internally, reading locale from the provider.

## Direction (RTL)

`dir` attribute on root. CSS uses **logical properties**:

```css
/* never */
margin-left: 8px;
padding-right: 12px;
border-left: 2px;
left: 0;
text-align: left;

/* always */
margin-inline-start: 8px;
padding-inline-end: 12px;
border-inline-start: 2px;
inset-inline-start: 0;
text-align: start;
```

Logical properties: `margin-inline-*`, `padding-inline-*`, `margin-block-*`, `padding-block-*`, `inset-inline-*`, `inset-block-*`, `border-inline-start/end`, `text-align: start/end`.

Components audited for RTL:

- Drawer sides: `side="start"` / `side="end"` (not `left` / `right`) — or accept both and auto-mirror.
- Breadcrumb separator mirrors.
- Stepper arrows flip.
- NavItem indicator position mirrors.
- Slider direction flips.
- Progress fills from start, not left.
- Pagination "Previous"/"Next" arrows flip.
- Icons marked `data-directional="true"` flip via CSS.

### Drawer/Sheet API accommodation

```tsx
<Drawer side="end" />  // end = right in LTR, left in RTL
<Drawer side="right" /> // literal, never flips (escape hatch)
```

## Date Components

DatePicker/Calendar/DateRangePicker receive:

- `locale` — propagated from provider.
- `firstDayOfWeek` — derived from locale if unspecified.
- Localized month / day names via `Intl.DateTimeFormat`.
- Calendar grid: weekend highlighting per locale.
- Optional: non-Gregorian calendars (future, low-priority).

## Number Input

NumberInput / CurrencyInput respect locale-specific:

- Decimal separator (`.` vs `,`).
- Grouping separator.
- Currency symbol position (prefix vs suffix).
- Negative sign placement.

## Text Direction in Mixed Content

User-generated content may be RTL inside an LTR shell. Use `dir="auto"` or Unicode BiDi overrides on content-bearing elements:

```tsx
<Text as="p" bidi="auto">{userContent}</Text>
```

## Translatable Names for Custom Content

For strings consumers pass in (labels, tooltips), consumers are responsible for their own i18n. Voidframe doesn't try to own consumer strings — only its own built-ins.

## Validation Messages

`<Field>` accepts error as a string or translation key:

```tsx
<Field.Error>{t("form.required")}</Field.Error>
```

Form libraries (RHF, Formik) drive their own validation; Voidframe just renders the string.

---

## Text Truncation & Expansion

Non-English text can be 30–60% longer than English. Components must accommodate:

- Buttons don't shrink text to fit — they grow.
- Sidebars accommodate longer labels (or truncate with tooltip).
- Tables allow column resize.
- Toast widths flex.

Pseudolocalization hook for testing: `useMessages({ locale: "en-XA" })` returns messages wrapped in longer unicode variants for expansion testing.

---

## Keyboard Shortcuts (Locale-aware)

`useKeyboardShortcut("mod+k")` resolves `mod` to `Cmd` on macOS and `Ctrl` elsewhere. Display via `<Shortcut>` also adjusts.

---

## Accessibility Labels

All built-in a11y labels flow through the messages system:

```tsx
<Modal.Close aria-label={t("overlay.close")} />
```

Consumers can override specific labels without re-translating the whole catalog.

---

## Acceptance Criteria

- [ ] `VoidframeMessages` interface defined.
- [ ] English defaults shipped.
- [ ] 17 additional locales shipped (with community contribution path).
- [ ] `t(path, args)` helper works.
- [ ] `formatNumber/Currency/Date/RelativeTime/List` utilities use locale.
- [ ] All components use logical properties — no left/right literals in CSS.
- [ ] RTL visual regression passes on every component.
- [ ] DatePicker localizes month/day names.
- [ ] Plural rules handled via `Intl.PluralRules`.
- [ ] Pseudolocalization available for testing text expansion.
- [ ] Docs section for i18n integration.

## Notes

- **Use `Intl` APIs.** Every browser supports `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.PluralRules`, `Intl.ListFormat`. No need for `date-fns` or `moment`.
- **RTL-first audit** for new components — when drawing CSS, always use logical properties.
- **Don't rely on auto-detection** for direction — always require the consumer to set it (avoids subtle bugs).
