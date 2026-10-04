"use client";

import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";
import { Toolbar } from "./Toolbar";
import { LiveIndicator } from "./LiveIndicator";
import { LiveRegion } from "../primitives/LiveRegion";
import { cx } from "../utils/cx";

export type TransportTone = "neutral" | "danger" | "warning";

export interface TransportAction {
  /** Stable id passed to `onAction`. */
  id: string;
  /** Visible label ("Punch", "Record", "Stop", "Marker"). */
  label: string;
  /** The key, pedal button or MIDI note that triggers it ("Enter", "Numpad 0", "Pedal 1"); shown and read with the label. */
  binding?: string;
  /** Optional glyph, decorative. */
  icon?: ReactNode;
  /** Default `true`. */
  enabled?: boolean;
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

/** `m:ss`, or `h:mm:ss` from an hour; negative and non-finite values read as 0:00. */
export function formatClock(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

const TransportStripImpl = forwardRef<HTMLDivElement, TransportStripProps>(function TransportStrip(
  { actions, state, elapsed, remaining, rollTotal, size = "md", label = "Transport", formatTime = formatClock, onAction, className, ...rest },
  ref
) {
  const tone = state.tone ?? "neutral";
  const rolling = remaining !== null && remaining !== undefined;
  const fraction = rolling ? rollFraction(remaining, rollTotal ?? 0) : 0;
  return (
    <div
      ref={ref}
      className={cx("vf-transport", `vf-transport--${size}`, `vf-transport--${tone}`, rolling && "vf-transport--rolling", className)}
      data-state={state.label}
      data-tone={tone}
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
            <span className="vf-sr-only">elapsed </span>
            {formatTime(elapsed)}
          </span>
        )}
        {rolling && (
          <span className="vf-transport__remaining">
            <span className="vf-sr-only">remaining </span>
            {formatTime(remaining)}
          </span>
        )}
      </div>
      <LiveRegion message={state.label} politeness="polite" className="vf-transport__announce" />
      <Toolbar aria-label={label} className="vf-transport__actions">
        {actions.map((a) => (
          <Toolbar.Button
            key={a.id}
            type="button"
            className={cx("vf-transport__action", a.tone && `vf-transport__action--${a.tone}`)}
            data-action={a.id}
            data-tone={a.tone}
            disabled={a.enabled === false}
            pressed={a.pressed}
            aria-label={a.binding ? `${a.label}, ${a.binding}` : a.label}
            aria-keyshortcuts={a.binding}
            onClick={() => onAction(a.id)}
          >
            {a.icon && (
              <span className="vf-transport__icon" aria-hidden="true">
                {a.icon}
              </span>
            )}
            <span className="vf-transport__label">{a.label}</span>
            {a.binding && (
              <kbd className="vf-transport__binding" aria-hidden="true">
                {a.binding}
              </kbd>
            )}
          </Toolbar.Button>
        ))}
      </Toolbar>
    </div>
  );
});

/**
 * A recorder's transport: the session state as a dominant word (with a
 * pulsing indicator while recording, announced once per change), elapsed and
 * roll-remaining clocks, a countdown bar along the top edge while a roll runs,
 * and the actions as toolbar buttons named with their key, pedal or MIDI
 * binding so they can be found without looking. Audio-agnostic: labels,
 * bindings, state and seconds in; action ids out.
 */
export const TransportStrip = memo(TransportStripImpl);
