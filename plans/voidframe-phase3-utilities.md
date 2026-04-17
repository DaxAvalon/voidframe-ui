# Phase 3: Missing Utilities

## Context

Voidframe has 34 utility functions across formatters, class composition (`cx`), context creation, deprecation warnings, polymorphic types, safe href/HTML, and date math. This phase adds 13 new utilities that fill gaps in form validation integration, color manipulation, style composition, environment detection, event handler merging, and runtime assertions. All utilities live in `src/utils/` with tests in `src/utils/__tests__/`.

**Test requirement:** Every utility gets a dedicated test file with 100% code coverage. Utility tests are pure function tests — no DOM rendering needed, just `import` → `expect(fn(input)).toBe(output)` patterns with edge cases.

---

## Tier 1 — High Priority Utilities

### 3.1 Form Validation Adapters

**Files to create:**
- `src/utils/formValidation.ts`
- `src/utils/__tests__/formValidation.test.ts`

**Description:** Adapter layer that bridges popular schema validation libraries (Zod, Yup, Valibot) to voidframe's `useForm` hook validation interface. The `useForm` hook accepts a `validate` function — these adapters convert schema libraries into that function shape.

**API:**
```typescript
// The useForm hook expects this shape:
type FormValidator<T> = (values: T) => Record<string, string> | null;

/**
 * Creates a useForm-compatible validator from a Zod schema.
 * Zod is NOT a dependency — consumer must have it installed.
 * Uses duck-typing to detect Zod schemas (has .safeParse method).
 */
export function zodAdapter<T>(schema: {
  safeParse: (data: T) => {
    success: boolean;
    error?: { issues: Array<{ path: (string | number)[]; message: string }> };
  };
}): FormValidator<T>;

/**
 * Creates a useForm-compatible validator from a Yup schema.
 * Yup is NOT a dependency — consumer must have it installed.
 * Uses duck-typing to detect Yup schemas (has .validateSync method).
 */
export function yupAdapter<T>(schema: {
  validateSync: (data: T, options?: { abortEarly?: boolean }) => T;
}): FormValidator<T>;

/**
 * Creates a useForm-compatible validator from a Valibot schema.
 * Valibot is NOT a dependency — consumer must have it installed.
 * Requires the consumer to pass `safeParse` function.
 */
export function valibotAdapter<T>(
  schema: unknown,
  safeParse: (schema: unknown, data: T) => {
    success: boolean;
    issues?: Array<{ path?: Array<{ key: string }>; message: string }>;
  }
): FormValidator<T>;

/**
 * Creates a useForm-compatible validator from a plain function
 * that returns individual field errors.
 */
export function customAdapter<T>(
  validate: (values: T) => Record<string, string | undefined>
): FormValidator<T>;
```

**Implementation notes:**
- Each adapter catches validation errors and maps them to `{ fieldName: errorMessage }` format
- Zod: iterate `error.issues`, join path segments with `.` for nested fields
- Yup: catch `ValidationError`, iterate `inner` array
- Valibot: iterate `issues`, join path keys
- All return `null` when validation passes (no errors)
- Zero runtime dependency on any schema library — pure duck-typing
- Each adapter is tree-shakeable (separate named exports)

**Test plan (formValidation.test.ts):**

**zodAdapter tests:**
1. Valid data returns null (no errors)
2. Single field error returns `{ field: "message" }`
3. Multiple field errors return all errors
4. Nested field paths joined with dots: `{ "address.city": "Required" }`
5. Array field paths: `{ "items.0.name": "Required" }`
6. Custom error messages preserved from schema
7. Empty object validates correctly (if schema allows)

**yupAdapter tests:**
8. Valid data returns null
9. Single field error returns correctly
10. Multiple field errors (abortEarly: false) returns all errors
11. Nested field errors mapped correctly
12. Catches ValidationError and extracts inner errors

**valibotAdapter tests:**
13. Valid data returns null
14. Single field error with path returns correctly
15. Issue without path uses "unknown" key
16. Multiple issues returned

**customAdapter tests:**
17. Function returning empty object → null (no errors)
18. Function returning field errors maps correctly
19. Undefined values in error record are filtered out
20. Function throwing error is caught and returned as form-level error

---

### 3.2 Color Utilities Expansion

**Files to create:**
- `src/utils/color.ts`
- `src/utils/__tests__/color.test.ts`

**Description:** Expand the existing color utilities (`stringToColor`, `adjustColor` in formatters.ts) into a comprehensive color manipulation library. Extracted from internal ColorPicker implementations for general use.

**API:**
```typescript
// ---- Conversions ----
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null;
export function rgbToHex(r: number, g: number, b: number): string;
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null;
export function hslToHex(h: number, s: number, l: number): string;
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number };
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number };

// ---- Manipulation ----
export function lighten(hex: string, amount: number): string;      // amount: 0-1
export function darken(hex: string, amount: number): string;       // amount: 0-1
export function saturate(hex: string, amount: number): string;     // amount: 0-1
export function desaturate(hex: string, amount: number): string;   // amount: 0-1
export function setAlpha(hex: string, alpha: number): string;      // returns rgba() string
export function mix(color1: string, color2: string, weight?: number): string;  // weight: 0-1, default 0.5

// ---- Analysis ----
export function luminance(hex: string): number;                     // relative luminance (0-1)
export function contrastRatio(color1: string, color2: string): number;  // WCAG contrast ratio
export function isAccessible(
  foreground: string,
  background: string,
  level?: "AA" | "AAA",               // default: "AA"
  size?: "normal" | "large"           // default: "normal"
): boolean;
export function mostReadable(
  background: string,
  candidates: string[]
): string;                             // returns candidate with highest contrast

// ---- Parsing ----
export function parseColor(input: string): { r: number; g: number; b: number; a: number } | null;
// Accepts: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), named colors
export function isValidColor(input: string): boolean;
```

**Implementation notes:**
- All hex inputs accept with/without `#` prefix, 3-digit and 6-digit
- Luminance calculation per WCAG 2.1 spec
- Contrast ratio per WCAG 2.1: (L1 + 0.05) / (L2 + 0.05)
- AA normal: 4.5:1, AA large: 3:1, AAA normal: 7:1, AAA large: 4.5:1
- `parseColor` handles all common CSS color formats
- Named colors: support the 148 CSS named colors

**Test plan (color.test.ts):**

**Conversion tests:**
1. `hexToRgb("#ff0000")` → `{ r: 255, g: 0, b: 0 }`
2. `hexToRgb("#f00")` → `{ r: 255, g: 0, b: 0 }` (3-digit)
3. `hexToRgb("invalid")` → `null`
4. `rgbToHex(255, 0, 0)` → `"#ff0000"`
5. `hexToHsl("#ff0000")` → `{ h: 0, s: 100, l: 50 }`
6. `hslToHex(0, 100, 50)` → `"#ff0000"`
7. `rgbToHsl` ↔ `hslToRgb` roundtrip for multiple colors
8. Grayscale conversion: `hexToHsl("#808080")` → `{ h: 0, s: 0, l: 50 }`

**Manipulation tests:**
9. `lighten("#000000", 0.5)` → mid-gray
10. `darken("#ffffff", 0.5)` → mid-gray
11. `lighten` with amount 0 returns same color
12. `lighten` with amount 1 returns white
13. `saturate` increases saturation
14. `desaturate` decreases saturation
15. `setAlpha("#ff0000", 0.5)` → `"rgba(255, 0, 0, 0.5)"`
16. `mix("#ff0000", "#0000ff", 0.5)` → purple-ish
17. `mix` with weight 0 returns first color
18. `mix` with weight 1 returns second color

**Analysis tests:**
19. `luminance("#ffffff")` → 1
20. `luminance("#000000")` → 0
21. `contrastRatio("#ffffff", "#000000")` → 21
22. `contrastRatio("#ffffff", "#ffffff")` → 1
23. `isAccessible("#000000", "#ffffff")` → true (21:1 >> 4.5:1)
24. `isAccessible("#777777", "#888888")` → false (low contrast)
25. `isAccessible` with AA large uses 3:1 threshold
26. `isAccessible` with AAA uses 7:1 threshold
27. `mostReadable("#ffffff", ["#000000", "#333333", "#666666"])` → `"#000000"`

**Parsing tests:**
28. `parseColor("#ff0000")` → `{ r: 255, g: 0, b: 0, a: 1 }`
29. `parseColor("rgb(255, 0, 0)")` → `{ r: 255, g: 0, b: 0, a: 1 }`
30. `parseColor("rgba(255, 0, 0, 0.5)")` → `{ r: 255, g: 0, b: 0, a: 0.5 }`
31. `parseColor("hsl(0, 100%, 50%)")` → `{ r: 255, g: 0, b: 0, a: 1 }`
32. `parseColor("red")` → `{ r: 255, g: 0, b: 0, a: 1 }` (named)
33. `parseColor("invalid")` → `null`
34. `isValidColor("#ff0000")` → `true`
35. `isValidColor("not-a-color")` → `false`

---

### 3.3 focusableElements

**Files to create:**
- `src/utils/focus.ts`
- `src/utils/__tests__/focus.test.ts`

**Description:** Query all focusable elements within a container. Extracted from `FocusScope` internals for general use in custom focus management, keyboard navigation, and a11y tooling.

**API:**
```typescript
/**
 * Selectors for elements that are focusable by default.
 */
export const FOCUSABLE_SELECTOR: string;

/**
 * Returns all focusable elements within a container, ordered by tabindex then DOM order.
 */
export function getFocusableElements(
  container: Element,
  options?: {
    includeHidden?: boolean;           // include visually hidden elements (default: false)
    includeDisabled?: boolean;         // include disabled elements (default: false)
    tabbableOnly?: boolean;            // only tabindex >= 0 (default: true)
  }
): HTMLElement[];

/**
 * Returns the first focusable element within a container.
 */
export function getFirstFocusable(container: Element): HTMLElement | null;

/**
 * Returns the last focusable element within a container.
 */
export function getLastFocusable(container: Element): HTMLElement | null;

/**
 * Checks if an element is focusable.
 */
export function isFocusable(element: Element): boolean;

/**
 * Checks if an element is tabbable (focusable via Tab key).
 */
export function isTabbable(element: Element): boolean;
```

**Implementation notes:**
- Focusable: `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]`, `[contenteditable]`, `details > summary`
- Exclude: `[disabled]`, `[hidden]`, `[tabindex="-1"]` (from tabbable), `aria-hidden="true"` subtrees
- Sort by tabindex: elements with `tabindex > 0` first (in tabindex order), then `tabindex=0` / natural (in DOM order)
- `inert` attribute support: skip inert subtrees

**Test plan (focus.test.ts):**
1. `getFocusableElements` finds buttons, links, inputs in container
2. Excludes disabled elements by default
3. `includeDisabled: true` includes disabled elements
4. Excludes `[hidden]` elements
5. Excludes `aria-hidden="true"` subtrees
6. Excludes `tabindex="-1"` from tabbable-only results
7. `tabbableOnly: false` includes `tabindex="-1"` elements
8. Elements sorted by tabindex then DOM order
9. `getFirstFocusable` returns first in order
10. `getLastFocusable` returns last in order
11. Empty container returns empty array / null
12. `isFocusable` returns true for focusable elements
13. `isFocusable` returns false for non-focusable div
14. `isTabbable` returns false for `tabindex="-1"`
15. `isTabbable` returns true for `tabindex="0"`
16. Handles `contenteditable` elements
17. Handles `details > summary` elements
18. Handles `inert` attribute (skips inert subtrees)

---

### 3.4 announceImperative

**Files to create:**
- `src/utils/announce.ts`
- `src/utils/__tests__/announce.test.ts`

**Description:** Imperative screen reader announcement utility for use outside React components. The existing `useAnnouncer` hook requires a component context — this utility can be called from event handlers, utility functions, or service layers.

**API:**
```typescript
/**
 * Announce a message to screen readers via a live region.
 * Creates a visually hidden live region on first call, reuses it thereafter.
 */
export function announce(
  message: string,
  options?: {
    politeness?: "polite" | "assertive";  // default: "polite"
    clearAfter?: number;                   // ms to clear region (default: 5000)
  }
): void;

/**
 * Remove the announcement live region from the DOM.
 * Call on app teardown if needed.
 */
export function clearAnnouncer(): void;
```

**Implementation notes:**
- Lazily create a visually-hidden `div` with `aria-live` on first `announce()` call
- Set `textContent` to trigger screen reader announcement
- Clear after `clearAfter` ms to prevent stale announcements
- Use separate regions for "polite" and "assertive" (different aria-live values)
- SSR-safe: no-op when `document` is undefined

**Test plan (announce.test.ts):**
1. Creates live region div on first call
2. Sets message as textContent
3. Polite mode: region has `aria-live="polite"`
4. Assertive mode: region has `aria-live="assertive"`
5. Clears message after `clearAfter` ms
6. Custom `clearAfter` value works
7. Multiple calls reuse same region
8. `clearAnnouncer()` removes region from DOM
9. Call after `clearAnnouncer()` creates new region
10. SSR: no error, no-op

---

## Tier 2 — Medium Priority Utilities

### 3.5 mergeStyles

**Files to create:**
- `src/utils/mergeStyles.ts`
- `src/utils/__tests__/mergeStyles.test.ts`

**Description:** Deep merge of CSS `style` objects with conflict resolution. Unlike `Object.assign` or spread, this handles nested values and provides explicit conflict resolution.

**API:**
```typescript
/**
 * Merge multiple React CSSProperties objects. Later values override earlier ones.
 * Undefined values are skipped (not treated as overrides).
 */
export function mergeStyles(
  ...styles: (React.CSSProperties | undefined | null | false)[]
): React.CSSProperties;
```

**Implementation notes:**
- Filter out falsy values
- Spread in order (later overrides earlier)
- Skip keys with `undefined` values (don't override existing with undefined)
- Return plain object (no proxy or class)

**Test plan (mergeStyles.test.ts):**
1. Single style object returned as-is
2. Two objects merged (later overrides)
3. Undefined values skipped (don't override existing)
4. Null / false / undefined arguments skipped
5. Empty arguments returns empty object
6. CSS custom properties (--vf-*) merge correctly
7. Numeric values preserved (not stringified)
8. Three+ objects merge in order

---

### 3.6 invariant / assert

**Files to create:**
- `src/utils/invariant.ts`
- `src/utils/__tests__/invariant.test.ts`

**Description:** Runtime assertions with dev-only error messages. For internal library safety checks that should never fail in production. Messages are stripped in production builds via dead-code elimination.

**API:**
```typescript
/**
 * Throws if condition is falsy. Message only included in development.
 * @example invariant(ref.current, "Ref must be attached before calling focus")
 */
export function invariant(
  condition: unknown,
  message: string
): asserts condition;

/**
 * Always throws with the given message. For unreachable code paths.
 * @example default: invariantViolation(`Unknown variant: ${variant}`)
 */
export function invariantViolation(message: string): never;
```

**Implementation notes:**
- `invariant`: if condition is falsy, throw `Error(message)` in dev, generic error in prod
- Use `process.env.NODE_ENV` check for tree-shaking
- TypeScript `asserts condition` narrows types after call

**Test plan (invariant.test.ts):**
1. `invariant(true, "msg")` does not throw
2. `invariant(false, "msg")` throws Error with message
3. `invariant(null, "msg")` throws (null is falsy)
4. `invariant(undefined, "msg")` throws
5. `invariant(0, "msg")` throws (0 is falsy)
6. `invariant("", "msg")` throws (empty string is falsy)
7. `invariant(1, "msg")` does not throw (truthy)
8. `invariant({}, "msg")` does not throw (truthy)
9. `invariantViolation("msg")` always throws
10. Type narrowing: after `invariant(x)`, `x` is non-null in TypeScript

---

### 3.7 pick / omit

**Files to create:**
- `src/utils/object.ts`
- `src/utils/__tests__/object.test.ts`

**Description:** Type-safe object property selection and exclusion. Common pattern for prop forwarding in polymorphic components.

**API:**
```typescript
/**
 * Returns new object with only the specified keys.
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K>;

/**
 * Returns new object without the specified keys.
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K>;

/**
 * Returns [picked, rest] tuple — splits an object by keys.
 */
export function splitProps<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): [Pick<T, K>, Omit<T, K>];
```

**Test plan (object.test.ts):**
1. `pick({ a: 1, b: 2, c: 3 }, ["a", "b"])` → `{ a: 1, b: 2 }`
2. `pick` with empty keys array returns empty object
3. `pick` with non-existent key skips it
4. `omit({ a: 1, b: 2, c: 3 }, ["b"])` → `{ a: 1, c: 3 }`
5. `omit` with empty keys array returns copy of object
6. `omit` with non-existent key returns full copy
7. `splitProps({ a: 1, b: 2, c: 3 }, ["a"])` → `[{ a: 1 }, { b: 2, c: 3 }]`
8. Original object not mutated by any operation
9. Handles undefined values in source object
10. Handles symbols as values (preserved)

---

### 3.8 composeEventHandlers

**Files to create:**
- `src/utils/composeEventHandlers.ts`
- `src/utils/__tests__/composeEventHandlers.test.ts`

**Description:** Merge multiple event handlers for the same event into a single handler. Used when the `Slot`/`asChild` pattern needs to compose a library handler with a consumer handler.

**API:**
```typescript
/**
 * Compose multiple event handlers into one.
 * If any handler calls event.preventDefault(), subsequent handlers are skipped.
 */
export function composeEventHandlers<E extends React.SyntheticEvent>(
  ...handlers: (((event: E) => void) | undefined | null)[]
): (event: E) => void;

/**
 * Same as composeEventHandlers but does NOT short-circuit on preventDefault.
 */
export function composeEventHandlersAlways<E extends React.SyntheticEvent>(
  ...handlers: (((event: E) => void) | undefined | null)[]
): (event: E) => void;
```

**Implementation notes:**
- Filter out null/undefined handlers
- Call each handler in order
- Default: check `event.defaultPrevented` between handlers, stop if true
- `Always` variant: call all handlers regardless of preventDefault

**Test plan (composeEventHandlers.test.ts):**
1. Single handler called with event
2. Multiple handlers called in order
3. Null/undefined handlers skipped
4. Handler calling `preventDefault()` stops subsequent handlers
5. `composeEventHandlersAlways` calls all handlers even after `preventDefault()`
6. Empty handlers list returns no-op function
7. Event object passed to all handlers is the same reference
8. Works with synthetic React events

---

### 3.9 isServer / isClient

**Files to create:**
- `src/utils/environment.ts`
- `src/utils/__tests__/environment.test.ts`

**Description:** Environment detection constants. Centralizes scattered `typeof window !== "undefined"` checks into a single source of truth.

**API:**
```typescript
/**
 * True when running in a server environment (no window/document).
 */
export const isServer: boolean;

/**
 * True when running in a browser environment.
 */
export const isClient: boolean;

/**
 * True when running in a test environment (vitest/jest).
 */
export const isTest: boolean;

/**
 * True when running in development mode.
 */
export const isDev: boolean;
```

**Implementation notes:**
- `isClient = typeof window !== "undefined" && typeof document !== "undefined"`
- `isServer = !isClient`
- `isTest = typeof process !== "undefined" && (process.env.VITEST === "true" || process.env.NODE_ENV === "test")`
- `isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development"`

**Test plan (environment.test.ts):**
1. `isClient` is true in happy-dom test environment
2. `isServer` is false in happy-dom test environment
3. `isTest` is true in vitest environment
4. Values are boolean (not truthy/falsy)
5. All exports are read-only constants

---

### 3.10 createPortalContainer

**Files to create:**
- `src/utils/portalContainer.ts`
- `src/utils/__tests__/portalContainer.test.ts`

**Description:** Managed portal container creation with reference counting and cleanup. Multiple portal users (modals, drawers, popovers) can share managed containers instead of each creating their own.

**API:**
```typescript
/**
 * Get or create a named portal container. Ref-counted: removed when
 * all users release it.
 */
export function getPortalContainer(name?: string): HTMLElement;

/**
 * Release a reference to a portal container. Removed from DOM when
 * ref count reaches 0.
 */
export function releasePortalContainer(name?: string): void;

/**
 * Default portal container ID.
 */
export const DEFAULT_PORTAL_ID = "vf-portal-root";
```

**Implementation notes:**
- Maintain `Map<string, { element: HTMLElement; refCount: number }>`
- `getPortalContainer` increments refCount, creates element if not exists
- `releasePortalContainer` decrements refCount, removes from DOM at 0
- Default container appended to `document.body`
- Container has `data-vf-portal` attribute for CSS targeting
- SSR-safe: return a dummy element or null

**Test plan (portalContainer.test.ts):**
1. Creates container div in document.body on first call
2. Returns same container on subsequent calls with same name
3. Container has `data-vf-portal` attribute
4. Default name is `DEFAULT_PORTAL_ID`
5. Custom name creates separate container
6. `releasePortalContainer` decrements ref count
7. Container removed from DOM when ref count reaches 0
8. Multiple names create multiple containers
9. Re-acquiring after full release creates new container
10. SSR: no error

---

### 3.11 cookieUtils

**Files to create:**
- `src/utils/cookie.ts`
- `src/utils/__tests__/cookie.test.ts`

**Description:** Cookie read/write/delete utilities with type-safe options. No cookie management exists in voidframe currently — only localStorage via `useLocalStorage` hook.

**API:**
```typescript
export interface CookieOptions {
  path?: string;                       // default: "/"
  domain?: string;
  maxAge?: number;                     // seconds
  expires?: Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean;                  // only meaningful server-side
}

/**
 * Get a cookie value by name. Returns null if not found.
 */
export function getCookie(name: string): string | null;

/**
 * Set a cookie with options.
 */
export function setCookie(
  name: string,
  value: string,
  options?: CookieOptions
): void;

/**
 * Delete a cookie by setting its expiry to the past.
 */
export function deleteCookie(name: string, options?: Pick<CookieOptions, "path" | "domain">): void;

/**
 * Get all cookies as a key-value object.
 */
export function getAllCookies(): Record<string, string>;

/**
 * Check if a cookie exists.
 */
export function hasCookie(name: string): boolean;
```

**Implementation notes:**
- Parse `document.cookie` string (semicolon-separated, key=value pairs)
- URL-encode/decode names and values
- `setCookie` builds cookie string from options
- `deleteCookie` sets `expires` to `new Date(0)` (past date)
- SSR-safe: return null / empty for reads, no-op for writes

**Test plan (cookie.test.ts):**
1. `setCookie` sets a cookie (verify via document.cookie)
2. `getCookie` retrieves set cookie value
3. `getCookie` returns null for non-existent cookie
4. `deleteCookie` removes cookie
5. `hasCookie` returns true for existing cookie
6. `hasCookie` returns false for non-existent cookie
7. `getAllCookies` returns all cookies as object
8. Cookie options: `path` sets correct attribute
9. Cookie options: `maxAge` sets correct attribute
10. Cookie options: `expires` sets correct Date string
11. Cookie options: `secure` adds Secure flag
12. Cookie options: `sameSite` sets correct attribute
13. Special characters in name/value are URL-encoded
14. Empty value is valid
15. Multiple cookies with same name but different paths coexist

---

## Tier 3 — Lower Priority Utilities

### 3.12 createAnimationSequence

**Files to create:**
- `src/utils/animationSequence.ts`
- `src/utils/__tests__/animationSequence.test.ts`

**Description:** Orchestrate staggered animations across multiple elements. Currently voidframe animations are per-element — this enables coordinated entrance/exit sequences.

**API:**
```typescript
export interface AnimationSequenceOptions {
  staggerMs?: number;                  // delay between each element (default: 50)
  direction?: "forward" | "reverse" | "center";  // stagger direction
  easing?: string;                     // CSS easing function
  duration?: number;                   // ms per element
}

/**
 * Apply staggered CSS animation classes to a list of elements.
 * Returns a cleanup function.
 */
export function staggerAnimation(
  elements: Element[],
  animationClass: string,
  options?: AnimationSequenceOptions
): () => void;

/**
 * Generate CSS custom property values for staggered delays.
 * Use with `style={{ animationDelay: getStaggerDelay(index, total) }}`.
 */
export function getStaggerDelay(
  index: number,
  total: number,
  options?: Pick<AnimationSequenceOptions, "staggerMs" | "direction">
): string;

/**
 * Returns a CSS `animation-delay` value for a specific index in a stagger sequence.
 */
export function staggerDelay(index: number, staggerMs?: number): string;
```

**Implementation notes:**
- `staggerAnimation`: add animation class with incremental `animation-delay` via CSS custom property
- `direction: "center"`: items closer to center animate first
- `direction: "reverse"`: last item animates first
- Cleanup: remove animation class and delay property
- `getStaggerDelay` is the pure-function version (no DOM mutation)

**Test plan (animationSequence.test.ts):**
1. `staggerDelay(0, 50)` → `"0ms"`
2. `staggerDelay(1, 50)` → `"50ms"`
3. `staggerDelay(3, 100)` → `"300ms"`
4. `getStaggerDelay(0, 5)` → `"0ms"` (forward)
5. `getStaggerDelay(4, 5)` → `"200ms"` (forward, default 50ms stagger)
6. `getStaggerDelay(0, 5, { direction: "reverse" })` → `"200ms"`
7. `getStaggerDelay(2, 5, { direction: "center" })` → `"0ms"` (center)
8. `staggerAnimation` adds class and delay to each element
9. `staggerAnimation` cleanup removes class and delay
10. Custom stagger duration works

---

### 3.13 generateResponsiveClasses

**Files to create:**
- `src/utils/responsiveClasses.ts`
- `src/utils/__tests__/responsiveClasses.test.ts`

**Description:** Generate CSS class names for responsive breakpoint values. Currently responsive behavior is JS-only (hooks); this utility enables CSS-class-based responsive patterns for simpler cases.

**API:**
```typescript
import type { Responsive } from "../responsive/breakpoints";

/**
 * Generate CSS class names from a Responsive<T> value.
 * @example responsiveClasses("gap", { base: "sm", md: "md", lg: "lg" })
 *          → "vf-gap-sm md:vf-gap-md lg:vf-gap-lg"
 */
export function responsiveClasses<T extends string>(
  prefix: string,
  value: Responsive<T>
): string;

/**
 * Generate a single class name for a breakpoint-value pair.
 */
export function breakpointClass(
  prefix: string,
  value: string,
  breakpoint?: string           // omit for base
): string;
```

**Implementation notes:**
- If value is a plain string (not responsive object), return `vf-{prefix}-{value}`
- If value is responsive object, generate `{bp}:vf-{prefix}-{value}` for each breakpoint
- `base` breakpoint has no prefix: `vf-{prefix}-{value}`
- Matches the breakpoint order from `BREAKPOINT_ORDER`

**Test plan (responsiveClasses.test.ts):**
1. Plain string value: `responsiveClasses("gap", "md")` → `"vf-gap-md"`
2. Responsive object: base + md → two classes
3. All breakpoints generate correct prefixes
4. `breakpointClass("gap", "md")` → `"vf-gap-md"` (no breakpoint = base)
5. `breakpointClass("gap", "md", "lg")` → `"lg:vf-gap-md"`
6. Empty object returns empty string
7. Undefined value returns empty string

---

## Integration with Existing Codebase

**Files to update after each utility:**
1. `src/utils/index.ts` — if barrel exists, add export
2. `src/index.ts` — export from main barrel for public utilities

**Conventions to follow:**
- Pure functions where possible (no side effects)
- Tree-shakeable: named exports, no default exports
- TypeScript generics where applicable
- JSDoc comments on public APIs
- SSR-safe: no DOM access without guard

---

## Verification

After implementing all utilities:
1. Run `vitest run src/utils/__tests__/` — all tests pass
2. Run `vitest run --coverage` — 100% coverage on new utility files
3. Run `tsc --noEmit` — no type errors
4. Verify tree-shaking: unused utilities should not appear in built output
5. Run `vite build` — bundle size impact should be minimal (utilities are small)
