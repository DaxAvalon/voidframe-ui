"use client";

// Phase 10 — CommandPalette
//
// `cmdk`-style command launcher with fuzzy filter, keyboard nav (Arrow up/
// down + Enter + Escape), groups, separators, an empty state, and a global
// command registry via `useCommand()` for run-time-registered actions.

import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { Presence } from "../primitives/Presence";
import { ScrollLock } from "../primitives/ScrollLock";

// ── Fuzzy filter ────────────────────────────────────────────

function fuzzyScore(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  let ti = 0;
  let lastMatch = -1;
  let score = 0;
  while (qi < q.length && ti < t.length) {
    if (q[qi] === t[ti]) {
      // Reward consecutive matches.
      score += lastMatch === ti - 1 ? 2 : 1;
      lastMatch = ti;
      qi++;
    }
    ti++;
  }
  return qi === q.length ? score : 0;
}

// ── Registry ────────────────────────────────────────────────

export interface RegisteredCommand {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  icon?: ReactNode;
  description?: string;
  onSelect: () => void;
}

interface CommandRegistry {
  list: RegisteredCommand[];
  register: (cmd: RegisteredCommand) => void;
  unregister: (id: string) => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CommandRegistryContext = createContext<CommandRegistry | null>(null);

export function useCommandRegistry(): CommandRegistry | null {
  return useContext(CommandRegistryContext);
}

export interface UseCommandOptions {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  icon?: ReactNode;
  description?: string;
  onSelect: () => void;
  enabled?: boolean;
}

/**
 * Register a command with the global palette. Stable across renders if `id`
 * is stable; updates the entry if other fields change.
 */
export function useCommand(opts: UseCommandOptions): void {
  const registry = useCommandRegistry();
  const enabled = opts.enabled ?? true;
  const onSelectRef = useRef(opts.onSelect);
  onSelectRef.current = opts.onSelect;
  // Depend on the stable register/unregister fns rather than `registry` —
  // the registry object's identity changes every time `list` updates, which
  // would otherwise cause register → state-update → register → infinite loop.
  const register = registry?.register;
  const unregister = registry?.unregister;
  useEffect(() => {
    if (!register || !unregister || !enabled) return;
    register({
      id: opts.id,
      label: opts.label,
      group: opts.group,
      shortcut: opts.shortcut,
      icon: opts.icon,
      description: opts.description,
      onSelect: () => onSelectRef.current(),
    });
    return () => unregister(opts.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, unregister, enabled, opts.id, opts.label, opts.group, opts.shortcut, opts.description]);
}

// ── Provider ────────────────────────────────────────────────

interface PaletteContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
  highlighted: string | null;
  setHighlighted: (id: string | null) => void;
  registerItem: (id: string, score: number) => void;
  unregisterItem: (id: string) => void;
  scoredOrder: string[];
  selectByItem: (id: string) => void;
  contentId: string;
  inputId: string;
  listboxId: string;
  /** Custom scorer; falls back to voidframe's `fuzzyScore` when undefined. */
  filter?: CommandPaletteFilter;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);
function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("CommandPalette.* must be inside <CommandPalette>");
  return ctx;
}

/**
 * Custom item-scoring function. Receives the current query plus the item's
 * own text (passed via `<CommandPalette.Item value="…">`) and returns a
 * numeric score: `0` excludes the item, higher = better match. When set,
 * this replaces the default fuzzy scorer for every Item in the palette.
 *
 * Use to plug in a preferred matcher (`fzf`, `match-sorter`, etc.) without
 * giving up the palette's keyboard-nav / highlight wiring. For server-side
 * search, drive `<CommandPalette.Input value=… onValueChange=…>` controlled
 * and emit pre-filtered Items instead — `filter` is for client-side
 * algorithmic swaps.
 */
export type CommandPaletteFilter = (query: string, text: string) => number;

export interface CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  /** Global keyboard shortcut to open the palette. Default "mod+k". */
  shortcut?: string | null;
  /**
   * Dim the surrounding page while the palette is open. Default `true`.
   * Set to `false` for a frosted-glass-less variant where the palette
   * floats above the existing UI without darkening it.
   */
  dim?: boolean;
  /**
   * Optional custom item-scoring function. When omitted, voidframe's
   * default fuzzy scorer is used.
   */
  filter?: CommandPaletteFilter;
  children?: ReactNode;
  /** When set, also exposes a registry via `useCommand`. */
  registry?: boolean;
}

function paletteShortcutMatches(keys: string, e: KeyboardEvent | globalThis.KeyboardEvent): boolean {
  const parts = keys.split("+").map((p) => p.trim().toLowerCase());
  const wantsMod = parts.includes("mod") || parts.includes("cmd");
  const wantsCtrl = parts.includes("ctrl");
  const wantsShift = parts.includes("shift");
  const wantsAlt = parts.includes("alt") || parts.includes("opt");
  const key = parts.find(
    (p) => !["mod", "cmd", "ctrl", "shift", "alt", "opt"].includes(p)
  );
  if (!key) return false;
  if (e.key.toLowerCase() !== key) return false;
  if (wantsMod && !(e.metaKey || e.ctrlKey)) return false;
  if (wantsCtrl && !e.ctrlKey) return false;
  if (wantsShift !== e.shiftKey) return false;
  if (wantsAlt !== e.altKey) return false;
  return true;
}

function CommandPaletteRoot({
  open,
  defaultOpen,
  onOpenChange,
  shortcut = "mod+k",
  dim = true,
  filter,
  registry = true,
  children,
}: CommandPaletteProps) {
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const isOpen = open ?? internal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );

  // Global shortcut binding.
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (paletteShortcutMatches(shortcut, e)) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, setOpen, isOpen]);

  // Per-instance registry (commands).
  const [list, setList] = useState<RegisteredCommand[]>([]);
  const register = useCallback((cmd: RegisteredCommand) => {
    setList((prev) => {
      const without = prev.filter((p) => p.id !== cmd.id);
      return [...without, cmd];
    });
  }, []);
  const unregister = useCallback((id: string) => {
    setList((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const registryValue = useMemo<CommandRegistry>(
    () => ({ list, register, unregister, open: () => setOpen(true), close: () => setOpen(false), isOpen }),
    [list, register, unregister, setOpen, isOpen]
  );

  const tree = registry ? (
    <CommandRegistryContext.Provider value={registryValue}>
      <CommandPaletteShell open={isOpen} setOpen={setOpen} registryList={list} dim={dim} filter={filter}>
        {children}
      </CommandPaletteShell>
    </CommandRegistryContext.Provider>
  ) : (
    <CommandPaletteShell open={isOpen} setOpen={setOpen} registryList={[]} dim={dim} filter={filter}>
      {children}
    </CommandPaletteShell>
  );
  return tree;
}

function CommandPaletteShell({
  open,
  setOpen,
  registryList,
  dim,
  filter,
  children,
}: {
  open: boolean;
  setOpen: (next: boolean) => void;
  registryList: RegisteredCommand[];
  dim: boolean;
  filter?: CommandPaletteFilter;
  children?: ReactNode;
}) {
  // React's useId() produces `:r0:`-style ids. Some axe rules reject colons
  // in IDREF-target positions; normalize to a consistent alnum prefix so the
  // various aria-controls/owns/activedescendant links are valid across all
  // AT sniffers.
  const rawBaseId = useId();
  const baseId = `vfcmd-${rawBaseId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const inputId = `${baseId}-input`;
  const contentId = `${baseId}-content`;
  const listboxId = `${baseId}-list`;
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const itemScores = useRef(new Map<string, number>());
  const [, force] = useState(0);

  const registerItem = useCallback((id: string, score: number) => {
    const prev = itemScores.current.get(id);
    if (prev === score) return;
    itemScores.current.set(id, score);
    force((n) => n + 1);
  }, []);
  const unregisterItem = useCallback((id: string) => {
    if (!itemScores.current.has(id)) return;
    itemScores.current.delete(id);
    force((n) => n + 1);
  }, []);

  // Re-computed on every render (cheap; O(n log n)) so that score updates
  // pushed via `force()` are reflected without depending on query alone.
  const scoredOrder = (() => {
    const entries = [...itemScores.current.entries()];
    return entries
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
  })();

  // Reset the highlight whenever the visible set changes.
  useEffect(() => {
    if (scoredOrder.length === 0) {
      setHighlighted(null);
    } else if (!highlighted || !scoredOrder.includes(highlighted)) {
      setHighlighted(scoredOrder[0]!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoredOrder.join("|")]);

  // Reset query when reopened.
  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const itemHandlersRef = useRef(new Map<string, () => void>());
  const selectByItem = useCallback((id: string) => {
    const handler = itemHandlersRef.current.get(id);
    if (handler) handler();
  }, []);

  const ctxValue = useMemo<PaletteContextValue>(
    () => ({
      open,
      setOpen,
      query,
      setQuery,
      highlighted,
      setHighlighted,
      registerItem,
      unregisterItem,
      scoredOrder,
      selectByItem,
      contentId,
      inputId,
      listboxId,
      filter,
    }),
    [
      open,
      setOpen,
      query,
      highlighted,
      registerItem,
      unregisterItem,
      scoredOrder,
      selectByItem,
      contentId,
      inputId,
      listboxId,
      filter,
    ]
  );

  // Expose the global registry's commands as fallback `<CommandPalette.Item>`
  // entries when no children are provided.
  const fallbackRendered =
    children ??
    (registryList.length > 0 ? (
      <>
        <CommandPaletteList>
          <CommandPaletteEmpty>No commands</CommandPaletteEmpty>
          {registryList.map((cmd) => (
            <CommandPaletteItem
              key={cmd.id}
              value={cmd.label}
              onSelect={cmd.onSelect}
              shortcut={cmd.shortcut}
              icon={cmd.icon}
              description={cmd.description}
              group={cmd.group}
            >
              {cmd.label}
            </CommandPaletteItem>
          ))}
        </CommandPaletteList>
      </>
    ) : null);

  // Provide a way for items to register their click handler.
  const setItemHandler = useCallback((id: string, fn: (() => void) | null) => {
    if (fn) itemHandlersRef.current.set(id, fn);
    else itemHandlersRef.current.delete(id);
  }, []);

  return (
    <PaletteContext.Provider value={ctxValue}>
      <PaletteHandlersContext.Provider value={setItemHandler}>
        {open && (
          <Portal>
            <Presence present={open}>
              <ScrollLock enabled={open} />
              <div
                className={cx(
                  "vf-cmd-overlay",
                  !dim && "vf-cmd-overlay--no-dim"
                )}
              >
                {dim && (
                  <div
                    className="vf-cmd-overlay__backdrop"
                    aria-hidden="true"
                    onClick={() => setOpen(false)}
                  />
                )}
                <DismissableLayer onDismiss={() => setOpen(false)}>
                  <FocusScope
                    trapped
                    autoFocus
                    restoreFocus
                    loop
                    id={contentId}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Command palette"
                    className="vf-cmd"
                  >
                    {fallbackRendered}
                  </FocusScope>
                </DismissableLayer>
              </div>
            </Presence>
          </Portal>
        )}
      </PaletteHandlersContext.Provider>
    </PaletteContext.Provider>
  );
}

const PaletteHandlersContext = createContext<((id: string, fn: (() => void) | null) => void) | null>(
  null
);

// ── Subcomponents ────────────────────────────────────────────

export interface CommandPaletteInputProps
  extends Omit<HTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  placeholder?: string;
  /**
   * Controlled value. When supplied, the consumer drives the input — useful
   * for server-side debounced search (`/api/search` against a postgres FTS
   * index, etc.). When omitted, the palette manages its query internally
   * (the original behavior).
   */
  value?: string;
  /**
   * Fires on every keystroke when controlled. Lets consumers debounce, hit
   * a server, and feed `<CommandPalette.Item>` children that reflect the
   * server-side filter result. Required when `value` is set.
   */
  onValueChange?: (value: string) => void;
}

const CommandPaletteInput = forwardRef<HTMLInputElement, CommandPaletteInputProps>(
  function CommandPaletteInput(
    { className, placeholder = "Type a command…", value, onValueChange, ...props },
    ref
  ) {
    const ctx = usePalette();
    const isControlled = value !== undefined;
    // When controlled, mirror consumer-supplied value into the palette's
    // internal query (so existing items + scoring still work, but the
    // consumer is free to provide pre-filtered children that ignore the
    // internal score).
    useEffect(() => {
      if (isControlled && value !== ctx.query) {
        ctx.setQuery(value ?? "");
      }
    }, [isControlled, value, ctx]);

    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = ctx.highlighted ? ctx.scoredOrder.indexOf(ctx.highlighted) : -1;
        ctx.setHighlighted(ctx.scoredOrder[Math.min(ctx.scoredOrder.length - 1, idx + 1)] ?? null);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = ctx.highlighted ? ctx.scoredOrder.indexOf(ctx.highlighted) : 0;
        ctx.setHighlighted(ctx.scoredOrder[Math.max(0, idx - 1)] ?? null);
      } else if (e.key === "Enter") {
        if (ctx.highlighted) {
          e.preventDefault();
          ctx.selectByItem(ctx.highlighted);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        ctx.setOpen(false);
      }
    };
    return (
      <input
        ref={ref}
        id={ctx.inputId}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        className={cx("vf-cmd__input", className)}
        value={isControlled ? (value ?? "") : ctx.query}
        onChange={(e) => {
          const next = e.target.value;
          if (isControlled) {
            onValueChange?.(next);
          } else {
            ctx.setQuery(next);
          }
        }}
        onKeyDown={onKey}
        placeholder={placeholder}
        aria-controls={ctx.listboxId}
        aria-owns={ctx.listboxId}
        aria-activedescendant={ctx.highlighted ?? undefined}
        {...props}
      />
    );
  }
);
CommandPaletteInput.displayName = "CommandPaletteInput";

function CommandPaletteList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = usePalette();
  return (
    <div
      id={ctx.listboxId}
      role="listbox"
      aria-label="Commands"
      className={cx("vf-cmd__list", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandPaletteEmpty({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = usePalette();
  if (ctx.scoredOrder.length > 0) return null;
  return (
    <div role="status" className={cx("vf-cmd__empty", className)} {...props}>
      {children ?? (
        <div className="vf-empty-state vf-empty-state--plain" data-variant="plain">
          <div className="vf-empty-state__title">No results</div>
        </div>
      )}
    </div>
  );
}

export interface CommandPaletteGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading?: ReactNode;
  children?: ReactNode;
}

function CommandPaletteGroup({
  heading,
  className,
  children,
  ...props
}: CommandPaletteGroupProps) {
  return (
    <div role="presentation" className={cx("vf-cmd__group", className)} {...props}>
      {heading && (
        <div role="presentation" className="vf-cmd__group-heading">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

function CommandPaletteSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className="vf-cmd__separator" {...props} />;
}

export interface CommandPaletteItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value?: string;
  onSelect: () => void;
  shortcut?: string;
  icon?: ReactNode;
  description?: string;
  group?: string;
  disabled?: boolean;
  /** Semantic tone — destructive commands, warnings, etc. Mirrors Menu.Item tone. */
  tone?: "neutral" | "danger" | "warning" | "success";
  children?: ReactNode;
}

function CommandPaletteItem({
  value,
  onSelect,
  shortcut,
  icon,
  description,
  disabled,
  tone,
  className,
  children,
  ...props
}: CommandPaletteItemProps) {
  const ctx = usePalette();
  const handlers = useContext(PaletteHandlersContext);
  // React's useId() returns `:r1:` style ids which axe's IDREF validator
  // rejects (colons disallowed as a leading char). Sanitize so the id is
  // a valid HTML4+ IDREF for aria-activedescendant.
  const rawId = useId();
  const id = `vfcmd-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const text = value ?? (typeof children === "string" ? children : id);
  const score = useMemo(
    () => (ctx.filter ?? fuzzyScore)(ctx.query, text),
    [ctx.query, text, ctx.filter]
  );

  useEffect(() => {
    ctx.registerItem(id, disabled ? 0 : score);
    return () => ctx.unregisterItem(id);
  }, [ctx, id, score, disabled]);

  useEffect(() => {
    if (!handlers) return;
    handlers(id, () => {
      if (disabled) return;
      onSelect();
      ctx.setOpen(false);
    });
    return () => handlers(id, null);
  }, [handlers, id, onSelect, disabled, ctx]);

  if (score === 0 || disabled === true) {
    if (score === 0) return null;
  }

  const isHighlighted = ctx.highlighted === id;
  const { id: _userProvidedId, ...safeProps } = props;
  const ta = toneAttrs("vf-cmd__item", { tone });
  return (
    <div
      {...safeProps}
      role="option"
      id={id}
      aria-selected={isHighlighted}
      aria-disabled={disabled || undefined}
      className={cx(
        ta.className,
        isHighlighted && "vf-cmd__item--highlighted",
        disabled && "vf-cmd__item--disabled",
        className
      )}
      {...ta.attrs}
      onMouseEnter={() => !disabled && ctx.setHighlighted(id)}
      onClick={() => {
        if (disabled) return;
        onSelect();
        ctx.setOpen(false);
      }}
    >
      {icon && <span className="vf-cmd__item-icon">{icon}</span>}
      <span className="vf-cmd__item-label">
        {children}
        {description && <span className="vf-cmd__item-desc">{description}</span>}
      </span>
      {shortcut && <span className="vf-cmd__item-shortcut">{shortcut}</span>}
    </div>
  );
}

function CommandPaletteFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-cmd__footer", className)} {...props} />;
}

/**
 * A cmd+K search overlay for fuzzy-finding actions, pages, and commands.
 * Register commands with `useCommand` and compose results via the Input, List, Group, and Item subcomponents.
 */
/**
 * Memoize the heavier compound subcomponents at the export site so
 * parent re-renders with referentially-stable `value` / `onValueChange`
 * skip the re-render. `Item` and `Group` benefit most — they're rendered
 * inside large lists.
 */
const MemoCommandPaletteItem = memo(CommandPaletteItem);
(MemoCommandPaletteItem as unknown as { displayName: string }).displayName =
  "CommandPalette.Item";

const MemoCommandPaletteGroup = memo(CommandPaletteGroup);
(MemoCommandPaletteGroup as unknown as { displayName: string }).displayName =
  "CommandPalette.Group";

export const CommandPalette = Object.assign(CommandPaletteRoot, {
  Input: CommandPaletteInput,
  List: CommandPaletteList,
  Empty: CommandPaletteEmpty,
  Group: MemoCommandPaletteGroup,
  Separator: CommandPaletteSeparator,
  Item: MemoCommandPaletteItem,
  Footer: CommandPaletteFooter,
});

export type { ReactNode as _CmdReactNode };
export type { CSSProperties as _CmdCSSProperties };
