"use client";

import { forwardRef, memo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { Toolbar } from "./Toolbar";
import { LiveIndicator } from "./LiveIndicator";
import { LiveRegion } from "../primitives/LiveRegion";
import { cx } from "../utils/cx";
import { useId } from "../hooks/useId";
import { bindingKeyshortcut, bindingLabel, type BindingInput } from "../utils/binding";
import { useMessages } from "../i18n/MessagesProvider";
import { MINUS } from "../utils/glyphs";

export type TransportTone = "neutral" | "danger" | "warning";
/** `wrap`: actions wrap as needed. `row`: one non-wrapping row of equal-width targets in `actions` order. */
export type TransportLayout = "wrap" | "row";
/** Minimum target height in CSS px. */
export type TransportTargetSize = 44 | 56 | 64;
/** `words`: label text always. `glyphs`: icon only where an action has one. `auto`: glyphs below 480 px of container width. */
export type TransportLabels = "auto" | "words" | "glyphs";
/** `large` enlarges the binding names, for learning them. */
export type TransportShowBindings = "normal" | "large";

export interface TransportAction {
  /** Stable id passed to `onAction`. */
  id: string;
  /** Visible label ("Punch", "Record", "Stop", "Marker"). */
  label: string;
  /**
   * What triggers the action: a display name ("Enter", "Numpad 0",
   * "Pedal 1", "↓") or a `Binding` (`{ kind: "code", value: "Numpad0" }`,
   * `{ kind: "pedal", value: "1" }`), whose label is derived. Shown and
   * read with the label. A plain string is display-only; see `keyshortcut`.
   */
  binding?: BindingInput;
  /**
   * The same trigger in ARIA `aria-keyshortcuts` grammar: key names joined
   * with `+`, several alternatives separated by spaces ("Enter",
   * "Shift+Enter", "ArrowDown", "Escape"). Derived from a keyboard
   * `Binding` when omitted; a pedal or MIDI binding has no keyshortcut.
   */
  keyshortcut?: string;
  /** Optional glyph, decorative. */
  icon?: ReactNode;
  /** Default `true`. */
  enabled?: boolean;
  /** Why the action is unavailable; shown as a tooltip and read with the button. */
  disabledReason?: string;
  /** Colour emphasis: `danger` for record, `warning` for a roll-landing punch. */
  tone?: TransportTone;
  /** Render as a toggled button (`aria-pressed`). */
  pressed?: boolean;
}

export interface TransportState {
  /** The dominant word: "Idle", "Armed", "Rolling", "Recording". */
  label: string;
  /** Colour of the word. */
  tone?: TransportTone;
  /** Show the pulsing recording indicator beside the word. */
  recording?: boolean;
}

export interface TransportStripProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The actions, in display order. Each becomes a toolbar button. */
  actions: TransportAction[];
  /** The session state shown as a word (and announced once per change). */
  state: TransportState;
  /** Seconds elapsed in the session or take; omitted when not applicable. */
  elapsed?: number;
  /** Seconds remaining in a roll (a countdown to the punch point); `null` or omitted hides the bar. */
  remaining?: number | null;
  /** Total seconds of the roll, for the bar's geometry. Default: `remaining` when it first appears is unknown, so pass it. */
  rollTotal?: number;
  /** `lg`: targets at least 44 × 44 CSS px, wider than tall, for booth and tablet use. Default `md`. */
  size?: "md" | "lg";
  /**
   * `wrap` (default) lets the actions wrap. `row` keeps them in one
   * non-wrapping row of equal-width targets in `actions` order (put record
   * first and stop last), on their own line under the state and clocks.
   */
  layout?: TransportLayout;
  /**
   * Minimum target height in CSS px (44, 56 or 64). In `row` layout width
   * is shared equally, so seven 56 px targets fit a 390 px viewport with
   * `labels="glyphs"` or `"auto"`.
   */
  targetSize?: TransportTargetSize;
  /** Label presentation; `auto` (default) switches to glyphs under 480 px of width where an action has an icon. */
  labels?: TransportLabels;
  /** `large` shows the binding names big, for learning them. Default `normal`. */
  showBindings?: TransportShowBindings;
  /** Accessible name of the toolbar. Default "Transport". */
  label?: string;
  /** Clock formatter for `elapsed` and `remaining`. Default `formatClock`. */
  formatTime?: (seconds: number) => string;
  /** Fires with the action id on click or keyboard activation. */
  onAction: (id: string) => void;
}

/** Fraction of a roll remaining, 0..1; 0 when the total is not positive. */
export function rollFraction(remaining: number, total: number): number {
  if (!Number.isFinite(remaining) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / total));
}

/**
 * `m:ss`, or `h:mm:ss` from an hour. Negative and non-finite values read as
 * 0:00 unless `{ signed: true }`, which renders overruns with a true minus
 * sign (U+2212): `−0:05`.
 */
export function formatClock(seconds: number, options: { signed?: boolean } = {}): string {
  const negative = Number.isFinite(seconds) && seconds < 0 && options.signed;
  const s = Number.isFinite(seconds) && (seconds > 0 || negative) ? Math.floor(Math.abs(seconds)) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${negative && s > 0 ? MINUS : ""}${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

const TransportStripImpl = forwardRef<HTMLDivElement, TransportStripProps>(function TransportStrip(
  {
    actions,
    state,
    elapsed,
    remaining,
    rollTotal,
    size = "md",
    layout = "wrap",
    targetSize,
    labels = "auto",
    showBindings = "normal",
    label = "Transport",
    formatTime = formatClock,
    onAction,
    className,
    style,
    ...rest
  },
  ref
) {
  const { t } = useMessages();
  const tone = state.tone ?? "neutral";
  const rolling = remaining !== null && remaining !== undefined;
  const fraction = rolling ? rollFraction(remaining, rollTotal ?? 0) : 0;
  const id = useId();
  const inline: CSSProperties = {
    ...(targetSize ? ({ "--vf-transport-target": `${targetSize}px` } as CSSProperties) : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx(
        "vf-transport",
        `vf-transport--${size}`,
        `vf-transport--${tone}`,
        `vf-transport--${layout}`,
        `vf-transport--labels-${labels}`,
        showBindings === "large" && "vf-transport--bindings-large",
        rolling && "vf-transport--rolling",
        className
      )}
      style={inline}
      data-state={state.label}
      data-tone={tone}
      data-layout={layout}
      {...rest}
    >
      {rolling && (
        <div className="vf-transport__roll" aria-hidden="true">
          <div className="vf-transport__roll-bar" style={{ width: `${fraction * 100}%` }} />
        </div>
      )}
      <div className="vf-transport__state">
        {state.recording ? (
          <LiveIndicator kind="recording" label={state.label} size={size === "lg" ? "md" : "sm"} className="vf-transport__indicator" />
        ) : (
          <span className="vf-transport__word">{state.label}</span>
        )}
        {elapsed !== undefined && (
          <span className="vf-transport__time">
            <span className="vf-sr-only">{t("media.elapsed")} </span>
            {formatTime(elapsed)}
          </span>
        )}
        {rolling && (
          <span className="vf-transport__remaining">
            <span className="vf-sr-only">{t("media.remaining")} </span>
            {formatTime(remaining)}
          </span>
        )}
      </div>
      <LiveRegion message={state.label} politeness="polite" className="vf-transport__announce" />
      <Toolbar aria-label={label} className="vf-transport__actions">
        {actions.map((a) => {
          const disabled = a.enabled === false;
          const reasonId = disabled && a.disabledReason ? `${id}-${a.id}-reason` : undefined;
          const bindingText =
            a.binding === undefined ? undefined : typeof a.binding === "string" ? a.binding : bindingLabel(a.binding);
          return (
            <Toolbar.Button
              key={a.id}
              type="button"
              className={cx(
                "vf-transport__action",
                a.tone && `vf-transport__action--${a.tone}`,
                a.icon && "vf-transport__action--has-icon"
              )}
              data-action={a.id}
              data-tone={a.tone}
              disabled={disabled}
              pressed={a.pressed}
              aria-label={bindingText ? `${a.label}, ${bindingText}` : a.label}
              aria-keyshortcuts={
                a.keyshortcut ?? (a.binding && typeof a.binding !== "string" ? bindingKeyshortcut(a.binding) : undefined)
              }
              aria-describedby={reasonId}
              title={disabled ? a.disabledReason : undefined}
              onClick={() => onAction(a.id)}
            >
              {a.icon && (
                <span className="vf-transport__icon" aria-hidden="true">
                  {a.icon}
                </span>
              )}
              <span className="vf-transport__label">{a.label}</span>
              {bindingText && (
                <kbd className="vf-transport__binding" aria-hidden="true">
                  {bindingText}
                </kbd>
              )}
              {reasonId && (
                <span id={reasonId} className="vf-sr-only">
                  {a.disabledReason}
                </span>
              )}
            </Toolbar.Button>
          );
        })}
      </Toolbar>
    </div>
  );
});

/**
 * A recorder's transport: the session state as a dominant word (with a
 * pulsing indicator while recording, announced once per change), elapsed and
 * roll-remaining clocks, a countdown bar along the top edge while a roll runs,
 * and the actions as toolbar buttons named with their key, pedal or MIDI
 * binding so they can be found without looking (`keyshortcut` carries the
 * ARIA grammar separately). `layout="row"` with `targetSize` gives a
 * phone or tablet one fixed-order row of touch targets; `labels` and
 * `showBindings` trade words for glyphs or enlarge the key names.
 * Audio-agnostic: labels, bindings, state and seconds in; action ids out.
 */
export const TransportStrip = memo(TransportStripImpl);
