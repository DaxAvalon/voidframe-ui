// Phase 8 — useShortcut + ShortcutRegistry
//
// Context-based shortcut registry. Components call `useShortcut(keys, handler,
// opts)` to register; the `ShortcutGuide` component reads the registry to
// render a help overlay. Outside of a provider the hook still binds the
// handler globally — it just isn't discoverable by the guide.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface RegisteredShortcut {
  id: string;
  keys: string;
  description?: string;
  group?: string;
  /** Whether the handler is currently active. */
  enabled: boolean;
}

export interface ShortcutRegistryValue {
  list: RegisteredShortcut[];
  register: (entry: RegisteredShortcut) => void;
  unregister: (id: string) => void;
}

const ShortcutRegistryContext = createContext<ShortcutRegistryValue | null>(null);

export interface ShortcutProviderProps {
  children?: ReactNode;
}

export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const [list, setList] = useState<RegisteredShortcut[]>([]);
  const register = useCallback((entry: RegisteredShortcut) => {
    setList((prev) => {
      const without = prev.filter((p) => p.id !== entry.id);
      return [...without, entry];
    });
  }, []);
  const unregister = useCallback((id: string) => {
    setList((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const value = useMemo<ShortcutRegistryValue>(
    () => ({ list, register, unregister }),
    [list, register, unregister]
  );
  return (
    <ShortcutRegistryContext.Provider value={value}>
      {children}
    </ShortcutRegistryContext.Provider>
  );
}

export function useShortcutRegistry(): ShortcutRegistryValue | null {
  return useContext(ShortcutRegistryContext);
}

export interface UseShortcutOptions {
  description?: string;
  group?: string;
  /** Disable the handler without unmounting. */
  enabled?: boolean;
  /** When true, fires even when the focus is inside an editable element. */
  allowInInputs?: boolean;
}

function parseKeys(keys: string): {
  key: string;
  mod: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
} {
  const parts = keys.split("+").map((k) => k.trim().toLowerCase());
  let mod = false;
  let ctrl = false;
  let alt = false;
  let shift = false;
  let key = "";
  for (const p of parts) {
    if (p === "mod" || p === "cmd") mod = true;
    else if (p === "ctrl") ctrl = true;
    else if (p === "alt" || p === "opt" || p === "option") alt = true;
    else if (p === "shift") shift = true;
    else key = p;
  }
  return { key, mod, ctrl, alt, shift };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

/**
 * Register a keyboard shortcut. The handler runs at document-level keydown.
 * If a `ShortcutProvider` is in scope, the shortcut also shows up in
 * `ShortcutGuide`.
 */
export function useShortcut(
  keys: string,
  handler: (e: KeyboardEvent) => void,
  options: UseShortcutOptions = {}
): void {
  const registry = useShortcutRegistry();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const enabled = options.enabled ?? true;
  const allowInInputs = options.allowInInputs ?? false;

  // Register with the provider for discovery. Depend on the stable
  // register/unregister fns — not `registry`, which is a new object reference
  // every time the registry's `list` updates (which would cause an infinite
  // register → rerender → register loop).
  const register = registry?.register;
  const unregister = registry?.unregister;
  useEffect(() => {
    if (!register || !unregister) return;
    const id = `${keys}::${options.description ?? ""}::${options.group ?? ""}`;
    register({
      id,
      keys,
      description: options.description,
      group: options.group,
      enabled,
    });
    return () => unregister(id);
  }, [register, unregister, keys, options.description, options.group, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const parsed = parseKeys(keys);
    const listener = (e: KeyboardEvent) => {
      if (!allowInInputs && isEditableTarget(e.target)) return;
      const pressedKey = e.key.toLowerCase();
      if (pressedKey !== parsed.key) return;
      const modPressed = e.metaKey || e.ctrlKey;
      if (parsed.mod && !modPressed) return;
      if (parsed.ctrl && !e.ctrlKey) return;
      if (parsed.alt && !e.altKey) return;
      if (parsed.shift && !e.shiftKey) return;
      // If the binding explicitly asks for no modifier, reject events that
      // have one (to avoid "?" matching Shift+/ on some layouts).
      if (!parsed.mod && !parsed.ctrl && !parsed.alt && !parsed.shift) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
      }
      e.preventDefault();
      handlerRef.current(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [keys, enabled, allowInInputs]);
}
