// Binding — one model for "what triggers this action".
//
// Shortcut strings ("mod+shift+k") match `KeyboardEvent.key`, which cannot
// tell a numpad 5 from the 5 above the letters, and cannot describe a foot
// pedal or a MIDI control at all. A `Binding` names the physical trigger:
//
//   { kind: "key",   value: "mod+k" }           matched by e.key (the chord grammar)
//   { kind: "code",  value: "mod+Numpad5" }     matched by e.code (physical key)
//   { kind: "pedal", value: "1" }               a foot-pedal button; consumer-dispatched
//   { kind: "midi",  value: "note:60" }         a MIDI note or "cc:64" control; consumer-dispatched
//
// `useShortcut`, `Shortcut`, `ShortcutGuide`, `ShortcutEditor` and
// `TransportStrip` accept either a string (a `key` binding) or a `Binding`.

export type BindingKind = "key" | "code" | "pedal" | "midi";

export interface Binding {
  kind: BindingKind;
  /** The trigger: a chord for `key`/`code`, a button id for `pedal`, `note:N` / `cc:N` for `midi`. */
  value: string;
  /** Display name override ("Punch pedal", "Numpad 0"). */
  label?: string;
}

export type BindingInput = string | Binding;

const MODIFIERS = new Set(["mod", "cmd", "meta", "ctrl", "control", "alt", "opt", "option", "shift"]);

export interface ParsedChord {
  mod: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  /** The non-modifier part, lower-cased for `key` chords, as written for `code` chords. */
  key: string;
}

/** Split "mod+shift+k" into modifier flags and the key (or code). */
export function parseChord(value: string, kind: "key" | "code" = "key"): ParsedChord {
  const out: ParsedChord = { mod: false, ctrl: false, alt: false, shift: false, key: "" };
  for (const raw of value.split("+")) {
    const p = raw.trim();
    const lower = p.toLowerCase();
    if (lower === "mod" || lower === "cmd" || lower === "meta") out.mod = true;
    else if (lower === "ctrl" || lower === "control") out.ctrl = true;
    else if (lower === "alt" || lower === "opt" || lower === "option") out.alt = true;
    else if (lower === "shift") out.shift = true;
    else out.key = kind === "key" ? normalizeKeyName(p) : p;
  }
  return out;
}

/** Canonical lower-case name for a `KeyboardEvent.key`. */
export function normalizeKeyName(key: string): string {
  if (!key) return "";
  if (key.length === 1) return key.toLowerCase();
  const map: Record<string, string> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    " ": "space",
    Spacebar: "space",
    Escape: "esc",
    Esc: "esc",
    Return: "enter",
    Del: "delete",
  };
  return map[key] ?? key.toLowerCase();
}

/** Coerce a string or binding to a `Binding`; strings are `key` chords. */
export function toBinding(input: BindingInput): Binding {
  return typeof input === "string" ? { kind: "key", value: input } : input;
}

/** True when both bindings name the same trigger (labels ignored). */
export function bindingEquals(a: BindingInput | null | undefined, b: BindingInput | null | undefined): boolean {
  if (!a || !b) return false;
  const x = toBinding(a);
  const y = toBinding(b);
  if (x.kind !== y.kind) return false;
  if (x.kind === "key" || x.kind === "code") {
    const px = parseChord(x.value, x.kind);
    const py = parseChord(y.value, y.kind as "key" | "code");
    const kx = x.kind === "code" ? px.key.toLowerCase() : px.key;
    const ky = y.kind === "code" ? py.key.toLowerCase() : py.key;
    return px.mod === py.mod && px.ctrl === py.ctrl && px.alt === py.alt && px.shift === py.shift && kx === ky;
  }
  return x.value.trim().toLowerCase() === y.value.trim().toLowerCase();
}

export interface MatchOptions {
  /**
   * `"loose"` (default, `useShortcut` semantics): a chord without modifiers
   * still matches with Shift held, so `?` works on layouts where it is
   * Shift+/. `"strict"`: every modifier must match exactly.
   */
  modifiers?: "loose" | "strict";
}

/** Whether a keyboard event triggers the binding. Pedal and MIDI bindings never match a keyboard event. */
export function matchesKeyboardEvent(
  input: BindingInput,
  e: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  options: MatchOptions = {}
): boolean {
  const b = toBinding(input);
  if (b.kind !== "key" && b.kind !== "code") return false;
  const chord = parseChord(b.value, b.kind);
  if (!chord.key) return false;
  if (b.kind === "key") {
    if (normalizeKeyName(e.key) !== chord.key) return false;
  } else if ((e.code ?? "").toLowerCase() !== chord.key.toLowerCase()) return false;
  const modPressed = e.metaKey || e.ctrlKey;
  if (chord.mod && !modPressed) return false;
  if (chord.ctrl && !e.ctrlKey) return false;
  if (chord.alt && !e.altKey) return false;
  if (chord.shift && !e.shiftKey) return false;
  const strict = options.modifiers === "strict";
  if (!chord.mod && !chord.ctrl) {
    if (e.metaKey || e.ctrlKey) return false;
  }
  if (!chord.alt && e.altKey) return false;
  if (strict && !chord.shift && e.shiftKey) return false;
  return true;
}

/**
 * Build a binding from a keyboard event, by `key` (layout-dependent, the
 * default) or by `code` (physical key: numpad, pedal keyboards). Returns
 * `null` for a bare modifier press.
 */
export function bindingFromKeyboardEvent(
  e: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  options: { by?: "key" | "code" } = {}
): Binding | null {
  if (["Meta", "Control", "Alt", "Shift", "AltGraph", "OS"].includes(e.key)) return null;
  const by = options.by ?? "key";
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push("mod");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  if (by === "code") {
    if (!e.code) return null;
    parts.push(e.code);
    return { kind: "code", value: parts.join("+") };
  }
  const key = normalizeKeyName(e.key);
  if (!key) return null;
  parts.push(key);
  return { kind: "key", value: parts.join("+") };
}

export type BindingPlatform = "mac" | "pc";

export function detectPlatform(): BindingPlatform {
  if (typeof navigator === "undefined") return "pc";
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "mac" : "pc";
}

export const KEY_ALIASES_MAC: Record<string, string> = {
  mod: "⌘",
  cmd: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  enter: "⏎",
  tab: "⇥",
  escape: "⎋",
  esc: "⎋",
  space: "Space",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};
export const KEY_ALIASES_PC: Record<string, string> = {
  mod: "Ctrl",
  cmd: "Ctrl",
  meta: "Ctrl",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  enter: "Enter",
  tab: "Tab",
  escape: "Esc",
  esc: "Esc",
  space: "Space",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

/** Human name for a `KeyboardEvent.code` ("Numpad5" → "Numpad 5", "KeyA" → "A"). */
export function codeLabel(code: string): string {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^Numpad/.test(code)) {
    const rest = code.slice(6);
    const named: Record<string, string> = {
      Add: "+",
      Subtract: "−",
      Multiply: "×",
      Divide: "÷",
      Decimal: ".",
      Enter: "Enter",
      Comma: ",",
      Equal: "=",
    };
    return `Numpad ${named[rest] ?? rest}`;
  }
  const map: Record<string, string> = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Space: "Space",
    Escape: "Esc",
    Enter: "Enter",
    Backspace: "Backspace",
    Tab: "Tab",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Backquote: "`",
    Backslash: "\\",
    Comma: ",",
    Period: ".",
    Slash: "/",
  };
  return map[code] ?? code.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/** The pieces of a binding for `<kbd>` rendering, platform-aware for modifiers. */
export function bindingParts(input: BindingInput, platform: BindingPlatform = detectPlatform()): string[] {
  const b = toBinding(input);
  if (b.label) return [b.label];
  const aliases = platform === "mac" ? KEY_ALIASES_MAC : KEY_ALIASES_PC;
  if (b.kind === "key") {
    return b.value
      .split("+")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean)
      .map((p) => aliases[p] ?? p.toUpperCase());
  }
  if (b.kind === "code") {
    return b.value
      .split("+")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (MODIFIERS.has(p.toLowerCase()) ? (aliases[p.toLowerCase()] ?? p) : codeLabel(p)));
  }
  if (b.kind === "pedal") return [`Pedal ${b.value}`];
  const m = /^(note|cc):(.+)$/i.exec(b.value.trim());
  if (m) return [`MIDI ${m[1]!.toLowerCase() === "cc" ? "CC" : "note"} ${m[2]}`];
  return [`MIDI ${b.value}`];
}

/** Display name of a binding ("⌘⇧K", "Ctrl+Shift+K", "Numpad 5", "Pedal 1", "MIDI note 60"). */
export function bindingLabel(input: BindingInput, platform: BindingPlatform = detectPlatform()): string {
  const parts = bindingParts(input, platform);
  const b = toBinding(input);
  if (b.label || b.kind === "pedal" || b.kind === "midi") return parts.join(" ");
  return platform === "mac" ? parts.join("") : parts.join("+");
}

/** ARIA `aria-keyshortcuts` grammar for keyboard bindings; `undefined` for pedal and MIDI. */
export function bindingKeyshortcut(input: BindingInput): string | undefined {
  const b = toBinding(input);
  if (b.kind !== "key" && b.kind !== "code") return undefined;
  const chord = parseChord(b.value, b.kind);
  const parts: string[] = [];
  if (chord.mod) parts.push("Control");
  if (chord.ctrl && !chord.mod) parts.push("Control");
  if (chord.alt) parts.push("Alt");
  if (chord.shift) parts.push("Shift");
  const aria: Record<string, string> = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    esc: "Escape",
    space: "Space",
    enter: "Enter",
    tab: "Tab",
  };
  const key = b.kind === "code" ? codeLabel(chord.key).replace(/^Numpad /, "") : (aria[chord.key] ?? chord.key);
  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join("+");
}

export type BindingAssignments = Record<string, BindingInput | null | undefined>;

export interface AssignBindingResult {
  /** The new assignments map (a copy). */
  assignments: BindingAssignments;
  /** The action that previously held this binding and lost it, if any. */
  displaced?: string;
}

/**
 * Give `actionId` a binding, enforcing one binding per action and one
 * action per binding. Any other action holding an equal binding loses it,
 * and is returned as `displaced` so the UI can say so. Pass `null` to clear.
 */
export function assignBinding(
  assignments: BindingAssignments,
  actionId: string,
  binding: BindingInput | null
): AssignBindingResult {
  const next: BindingAssignments = { ...assignments };
  let displaced: string | undefined;
  if (binding) {
    for (const [id, current] of Object.entries(assignments)) {
      if (id !== actionId && current && bindingEquals(current, binding)) {
        displaced = id;
        next[id] = null;
      }
    }
  }
  next[actionId] = binding;
  return displaced ? { assignments: next, displaced } : { assignments: next };
}

/** The action currently holding a binding, if any. */
export function findBindingOwner(
  assignments: BindingAssignments,
  binding: BindingInput,
  exceptActionId?: string
): string | undefined {
  for (const [id, current] of Object.entries(assignments)) {
    if (id === exceptActionId || !current) continue;
    if (bindingEquals(current, binding)) return id;
  }
  return undefined;
}
