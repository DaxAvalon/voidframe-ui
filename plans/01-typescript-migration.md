# 01 — TypeScript Migration

**Goal:** Full type safety, autocomplete, compile-time prop validation, and shipped `.d.ts` files. Every component, hook, utility, and token has an exported type.

**Depends on:** nothing.
**Unblocks:** all other phases.
**Effort:** 2-3 days.

## Deliverables

- All `.js` → `.ts`, all `.jsx` → `.tsx`.
- `tsconfig.json` with `strict: true`.
- `src/types.ts` with shared types.
- `VoidframeTokens` interface drives the token system.
- Every component exports a `ComponentNameProps` interface.
- Every hook has explicit return types.
- Every utility has generic signatures where relevant.
- `vite-plugin-dts` generates `.d.ts` into `dist/types/`.
- `package.json` `exports` field includes types.
- `npm run typecheck` passes with zero errors.

## Shared Types (`src/types.ts`)

```ts
import type { CSSProperties, ReactNode } from "react";

export type Size = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl";
export type Density = "comfortable" | "compact" | "spacious";
export type Accent =
  | "green" | "red" | "amber" | "blue" | "purple" | "cyan" | "rose";
export type SemanticColor = "success" | "danger" | "warning" | "info" | "neutral";
export type Side = "left" | "right" | "top" | "bottom";
export type Alignment = "start" | "center" | "end" | "stretch" | "baseline";
export type Variant = "default" | "ghost" | "accent" | "solid" | "outline";
export type Tone = "neutral" | Accent | SemanticColor;
export type Orientation = "horizontal" | "vertical";
export type Placement =
  | "top" | "top-start" | "top-end"
  | "right" | "right-start" | "right-end"
  | "bottom" | "bottom-start" | "bottom-end"
  | "left" | "left-start" | "left-end";

export interface BaseProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  "data-testid"?: string;
}

export type Responsive<T> =
  | T
  | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; xxl?: T };

export type PolymorphicRef<E extends React.ElementType> =
  React.ComponentPropsWithRef<E>["ref"];

export type PolymorphicProps<E extends React.ElementType, P = {}> =
  P & Omit<React.ComponentPropsWithoutRef<E>, keyof P | "as"> & {
    as?: E;
  };
```

## Token Types (`src/tokens.ts`)

```ts
export interface VoidframeTokens {
  // Surfaces
  bg0: string; bg1: string; bg2: string; bg3: string; bg4: string; bg5: string;
  // Borders
  border0: string; border1: string; border2: string; border3: string; border4: string;
  // Text
  text0: string; text1: string; text2: string; text3: string; text4: string; text5: string;
  // Accents
  green: string; red: string; amber: string; blue: string; purple: string; cyan: string; rose: string;
  // Semantic aliases
  success: string; danger: string; warning: string; info: string;
  // Typography
  fontFamily: string;
  fontXxs: number; fontXs: number; fontSm: number; fontMd: number;
  fontLg: number; fontXl: number; fontXxl: number; font3xl: number;
  // Spacing
  sp1: number; sp2: number; sp3: number; sp4: number; sp5: number; sp6: number;
  sp7: number; sp8: number; sp9: number; sp10: number; sp11: number; sp12: number;
  // Motion
  transition: string;
  durationFast: number; durationBase: number; durationSlow: number;
  easingStandard: string; easingEmphasized: string;
  // Geometry
  radius: 0;
  // Z-index scale
  zBase: number; zDropdown: number; zSticky: number; zModal: number;
  zPopover: number; zTooltip: number; zToast: number;
  // Breakpoints (added by Phase 16)
  bpSm: number; bpMd: number; bpLg: number; bpXl: number; bpXxl: number;
}

export type ThemeOverrides = Partial<VoidframeTokens>;

export declare const defaultTokens: VoidframeTokens;
export declare const lightTheme: VoidframeTokens;
export declare function createTheme(overrides: ThemeOverrides): VoidframeTokens;
export declare function tint(hex: string, opacity: number): string;
```

## Component Prop Interfaces (pattern)

Every component follows this shape:

```ts
import type { BaseProps, Size, Variant, Tone } from "../types";

export interface ButtonProps extends BaseProps {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### Rules

1. Props interfaces are **exported** (`ButtonProps`, not `Props`).
2. Extend `BaseProps` or a native HTML attribute interface (`React.ButtonHTMLAttributes<HTMLButtonElement>`) — not both directly; compose.
3. Controlled event handlers use **value-based** signatures: `onChange: (value: T) => void` — not raw events. Expose `onChangeRaw` where the event object is genuinely needed.
4. Generic components declare generics on the props interface: `export interface TableProps<T> { data: T[]; columns: ColumnDef<T>[] }`.
5. Children are typed `ReactNode`; render props are typed as functions with explicit arg types.
6. No `any`. Use `unknown` + type guards if the type truly is dynamic.

## Hook Return Types

Explicit, not inferred:

```ts
export function useToggle(initial = false): [boolean, () => void, Dispatch<SetStateAction<boolean>>];
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void];
export function useDebounce<T>(value: T, delay: number): T;
export function useMediaQuery(query: string): boolean;
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, handler: () => void): void;
export function useKeyboardShortcut(keys: string | string[], handler: (e: KeyboardEvent) => void): void;
```

## Utility Generics

```ts
export function groupBy<T, K extends string | number>(items: T[], key: (t: T) => K): Record<K, T[]>;
export function sortBy<T>(items: T[], key: keyof T | ((t: T) => unknown), dir?: "asc" | "desc"): T[];
export function clamp(n: number, min: number, max: number): number;
export function mapRange(n: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string;
export function uid(prefix?: string): string;
```

## Build Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "demo", "**/*.test.ts", "**/*.test.tsx"]
}
```

### `tsconfig.build.json` (excludes tests)

Separate config for `npm run build` that excludes test files.

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), dts({ outDir: "dist/types", rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Voidframe",
      formats: ["es", "cjs"],
      fileName: (fmt) => `voidframe.${fmt === "es" ? "es.js" : "cjs.js"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
  },
});
```

### `package.json` exports

```json
{
  "main": "dist/voidframe.cjs.js",
  "module": "dist/voidframe.es.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/voidframe.es.js",
      "require": "./dist/voidframe.cjs.js"
    },
    "./tokens": {
      "types": "./dist/types/tokens.d.ts",
      "import": "./dist/tokens.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist", "src", "README.md", "LICENSE"],
  "sideEffects": ["*.css"]
}
```

## Migration Order

1. Add dev deps: `typescript`, `vite-plugin-dts`, `@types/react`, `@types/react-dom`.
2. Create `tsconfig.json`.
3. Rename `src/tokens.js` → `src/tokens.ts`. Add `VoidframeTokens` interface. Fix errors.
4. Rename `src/utils.js` → `src/utils.ts`. Add generic signatures.
5. Rename `src/types.ts` — create shared types.
6. Rename `src/hooks/index.js` → `src/hooks/index.ts`. Add return types.
7. Rename `src/provider/VoidframeProvider.jsx` → `.tsx`. Type context.
8. Rename components one at a time: `Text.jsx` first (smallest), then upward. Each component gets its `Props` interface exported.
9. Rename `src/index.js` → `src/index.ts`. Update all re-exports.
10. Rename `demo/App.jsx` → `demo/App.tsx`. Should compile with zero changes to logic.
11. Add `typecheck` script: `"typecheck": "tsc --noEmit"`.
12. Run `npm run typecheck`. Fix until zero errors.
13. Run `npm run build`. Verify `dist/types/` emits `.d.ts` files and `index.d.ts` is a single rollup.

## Acceptance Criteria

- [ ] `npm run typecheck` passes with **0 errors**.
- [ ] `npm run build` produces `dist/voidframe.es.js`, `dist/voidframe.cjs.js`, `dist/types/index.d.ts`.
- [ ] Importing `<Button>` in a consumer TS project shows IntelliSense for all props.
- [ ] Importing `VoidframeTokens` from `"voidframe/tokens"` resolves types.
- [ ] `demo/App.tsx` runs identically to before (no behavioral changes).
- [ ] Every exported component has an exported `Props` interface.
- [ ] No `any` in production source (lint-enforced in Phase 22).
- [ ] `skipLibCheck: true` but our own types are strict.

## Notes

- Do not change any component behavior during this phase. Pure type overlay only.
- If a component has genuinely unknowable types (e.g. `style?: any`), narrow to `CSSProperties`.
- For event handlers that pass through native events, preserve the native signature. For controlled handlers that emit a value, use the value-based signature.
- `react-jsx` transform means no `import React` needed per file, but still import `React` when using `React.` namespace types.
- `noUncheckedIndexedAccess: true` is aggressive but catches real bugs. Expect to add `!` or explicit checks in a few spots.

## Follow-ups

- [02-architecture-patterns.md](02-architecture-patterns.md) introduces polymorphic `as`, `forwardRef`, and Slot — which will change every component's signature. Do that *after* this phase lands, not during.
