"use client";

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
import {
  matchesKeyboardEvent,
  toBinding,
  type Binding,
  type BindingInput,
} from "../utils/binding";

export interface RegisteredShortcut {
  id: string;
  /** The chord string, or the binding's value for non-string bindings. */
  keys: string;
  /** The full binding (kind, value, label). */
  binding?: Binding;
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

/**
 * Provider that registers the global shortcut registry. Wrap your app root;
 * `useShortcut` / `useShortcutRegistry` read from it.
 */
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

/**
 * Low-level read access to the global shortcut registry installed by
 * `ShortcutProvider`. Returns the full list of registered shortcuts for
 * custom guide UIs.
 */
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
  input: BindingInput,
  handler: (e: KeyboardEvent) => void,
  options: UseShortcutOptions = {}
): void {
  const registry = useShortcutRegistry();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const enabled = options.enabled ?? true;
  const allowInInputs = options.allowInInputs ?? false;
  const binding = toBinding(input);
  const keys = binding.value;
  const bindingKey = `${binding.kind}:${binding.value}:${binding.label ?? ""}`;

  // Register with the provider for discovery. Depend on the stable
  // register/unregister fns — not `registry`, which is a new object reference
  // every time the registry's `list` updates (which would cause an infinite
  // register → rerender → register loop).
  const register = registry?.register;
  const unregister = registry?.unregister;
  useEffect(() => {
    if (!register || !unregister) return;
    const id = `${bindingKey}::${options.description ?? ""}::${options.group ?? ""}`;
    register({
      id,
      keys,
      binding: { kind: binding.kind, value: binding.value, label: binding.label },
      description: options.description,
      group: options.group,
      enabled,
    });
    return () => unregister(id);
    // `bindingKey` stands for the binding's content.
  }, [register, unregister, bindingKey, options.description, options.group, enabled]);

  useEffect(() => {
    if (!enabled) return;
    // Pedal and MIDI bindings are dispatched by the consumer (call the
    // handler from your device code); only keyboard bindings listen here.
    if (binding.kind !== "key" && binding.kind !== "code") return;
    const b: Binding = { kind: binding.kind, value: binding.value };
    const listener = (e: KeyboardEvent) => {
      if (!allowInInputs && isEditableTarget(e.target)) return;
      if (!matchesKeyboardEvent(b, e)) return;
      e.preventDefault();
      handlerRef.current(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
    // `bindingKey` stands for the binding's content.
  }, [bindingKey, enabled, allowInInputs]);
}
