"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export type AudioLevelMeterTone = "amber" | "red";

export interface AudioLevelMeterLimit {
  /** Position on the dB scale, e.g. -3 for the ACX sample-peak limit. */
  at: number;
  /** Shown as a tooltip on the marker and read by assistive tech. */
  label?: string;
  /** Marker colour and the fill colour once the level passes it. */
  tone?: AudioLevelMeterTone;
}

export interface AudioLevelMeterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Current level in dB (dBFS, dBTP or LUFS — the meter is unit-agnostic).
   * `-Infinity` is valid and renders as empty. Ignored when `channels` is set.
   */
  value?: number;
  /** One level per channel; renders one bar per entry sharing the scale. */
  channels?: number[];
  /** Bottom of the scale in dB. */
  min?: number;
  /** Top of the scale in dB. */
  max?: number;
  /**
   * Peak-hold marker in dB. `null`/`undefined` hides it. The meter does not
   * track peaks itself: the consumer owns the hold (and its reset).
   */
  hold?: number | null;
  /**
   * Fall-off applied when `value` drops. Rises are instantaneous. `0`
   * disables ballistics; reduced-motion users always get `0`.
   */
  decayDbPerSecond?: number;
  /** Threshold markers, e.g. `[{ at: -3, label: "ACX peak", tone: "red" }]`. */
  limits?: AudioLevelMeterLimit[];
  orientation?: "horizontal" | "vertical";
  /** Tick labels every 10 dB plus the limits. */
  showScale?: boolean;
  /** Unit for `aria-valuetext` and the scale, default `dBFS`. */
  unit?: string;
  size?: "sm" | "md" | "lg";
  /** Accessible name; default "Level". */
  label?: string;
  /** Formats the numeric readout and `aria-valuetext`. */
  formatValue?: (db: number, unit: string) => string;
  /** Show the numeric readout next to the bar. */
  showValue?: boolean;
}

/**
 * Pure ballistics: rises snap, falls are limited to `rateDbPerSecond` over
 * `dtSeconds`. Returns the value to display.
 */
export function applyDecay(
  previous: number,
  next: number,
  dtSeconds: number,
  rateDbPerSecond: number
): number {
  if (!Number.isFinite(previous) || next >= previous) return next;
  if (rateDbPerSecond <= 0 || dtSeconds <= 0) return next;
  return Math.max(next, previous - rateDbPerSecond * dtSeconds);
}

/** dB → 0..1 position on the scale; `-Infinity` and NaN map to 0. */
export function dbToFraction(db: number, min: number, max: number): number {
  if (!Number.isFinite(db) || max <= min) return 0;
  return Math.min(1, Math.max(0, (db - min) / (max - min)));
}

function defaultFormat(db: number, unit: string): string {
  if (!Number.isFinite(db)) return `-∞ ${unit}`;
  return `${db.toFixed(1)} ${unit}`;
}

/** Highest-severity limit the level has crossed, if any. */
function crossedTone(db: number, limits: AudioLevelMeterLimit[]): AudioLevelMeterTone | undefined {
  let tone: AudioLevelMeterTone | undefined;
  for (const l of limits) {
    if (db >= l.at) {
      const t = l.tone ?? "red";
      if (t === "red") return "red";
      tone = t;
    }
  }
  return tone;
}

/**
 * Drives the displayed levels: rises are instant, falls are limited to
 * `rate` dB/s and keep falling between prop updates until they reach the
 * target. With `rate` 0 (or reduced motion) the display follows the input.
 */
function useBallistics(targets: number[], rate: number): number[] {
  const reduced = usePrefersReducedMotion();
  const effectiveRate = reduced ? 0 : rate;
  const [shown, setShown] = useState<number[]>(targets);
  const shownRef = useRef<number[]>(targets);
  const lastTs = useRef<number | null>(null);
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  useEffect(() => {
    if (effectiveRate <= 0) {
      shownRef.current = targets;
      lastTs.current = null;
      setShown(targets);
      return;
    }
    // Snap rises immediately; falls start decaying from the current display.
    const now = performance.now();
    const dt = lastTs.current === null ? 0 : (now - lastTs.current) / 1000;
    lastTs.current = now;
    const next = targets.map((t, i) => applyDecay(shownRef.current[i] ?? t, t, dt, effectiveRate));
    shownRef.current = next;
    setShown(next);

    const stillFalling = next.some((v, i) => v > (targets[i] ?? -Infinity));
    if (!stillFalling) return;
    let frame = 0;
    const tick = (ts: number) => {
      const dtTick = lastTs.current === null ? 0 : (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      const cur = targetsRef.current;
      const updated = shownRef.current.map((v, i) => applyDecay(v, cur[i] ?? -Infinity, dtTick, effectiveRate));
      shownRef.current = updated;
      setShown(updated);
      if (updated.some((v, i) => v > (cur[i] ?? -Infinity))) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // targets is a fresh array each render; compare by content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets.join(","), effectiveRate]);

  return effectiveRate <= 0 ? targets : shown;
}

const AudioLevelMeterImpl = forwardRef<HTMLDivElement, AudioLevelMeterProps>(
  function AudioLevelMeter(
    {
      value = -Infinity,
      channels,
      min = -60,
      max = 0,
      hold,
      decayDbPerSecond = 60,
      limits = [],
      orientation = "horizontal",
      showScale = false,
      unit = "dBFS",
      size = "md",
      label = "Level",
      formatValue = defaultFormat,
      showValue = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    const targets = useMemo(() => (channels && channels.length > 0 ? channels : [value]), [channels, value]);
    const shown = useBallistics(targets, decayDbPerSecond);
    const loudest = shown.reduce((a, b) => (b > a ? b : a), -Infinity);
    const tone = crossedTone(loudest, limits);
    const clampedNow = Number.isFinite(loudest) ? Math.min(max, Math.max(min, loudest)) : min;
    const ticks = useMemo(() => {
      if (!showScale) return [];
      const out: number[] = [];
      const start = Math.ceil(min / 10) * 10;
      for (let t = start; t <= max; t += 10) out.push(t);
      return out;
    }, [showScale, min, max]);
    const pos = (db: number) => `${(dbToFraction(db, min, max) * 100).toFixed(2)}%`;
    const axis = orientation === "vertical" ? "bottom" : "left";
    const extent = orientation === "vertical" ? "height" : "width";

    return (
      <div
        ref={ref}
        className={cx(
          "vf-audio-level-meter",
          `vf-audio-level-meter--${orientation}`,
          `vf-audio-level-meter--${size}`,
          tone && `vf-audio-level-meter--over-${tone}`,
          className
        )}
        style={style}
        role="meter"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedNow}
        aria-valuetext={formatValue(loudest, unit)}
        {...props}
      >
        <div className="vf-audio-level-meter__tracks">
          {shown.map((db, i) => (
            <div
              key={i}
              className="vf-audio-level-meter__track"
              data-channel={i}
              aria-hidden={shown.length > 1 ? undefined : true}
            >
              <div
                className="vf-audio-level-meter__fill"
                style={{ [extent]: pos(db) } as CSSProperties}
              />
              {hold !== null && hold !== undefined && Number.isFinite(hold) && (
                <div
                  className="vf-audio-level-meter__hold"
                  style={{ [axis]: pos(hold) } as CSSProperties}
                  title={`Peak hold ${formatValue(hold, unit)}`}
                />
              )}
              {limits.map((l) => (
                <div
                  key={`${l.at}-${l.label ?? ""}`}
                  className={cx(
                    "vf-audio-level-meter__limit",
                    `vf-audio-level-meter__limit--${l.tone ?? "red"}`
                  )}
                  style={{ [axis]: pos(l.at) } as CSSProperties}
                  title={l.label ? `${l.label} (${formatValue(l.at, unit)})` : formatValue(l.at, unit)}
                />
              ))}
            </div>
          ))}
        </div>
        {showScale && (
          <div className="vf-audio-level-meter__scale" aria-hidden>
            {ticks.map((t) => (
              <span
                key={t}
                className="vf-audio-level-meter__tick"
                style={{ [axis]: pos(t) } as CSSProperties}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {showValue && (
          <span className="vf-audio-level-meter__value">{formatValue(loudest, unit)}</span>
        )}
      </div>
    );
  }
);
AudioLevelMeterImpl.displayName = "AudioLevelMeter";

/**
 * Bar meter for audio levels in dB (dBFS, dBTP, LUFS) with fall-off
 * ballistics, a consumer-owned peak-hold marker, threshold markers (e.g. the
 * ACX −3 dBFS peak limit) and an optional scale. One bar per channel when
 * `channels` is given. The meter renders levels; it does not read audio.
 */
export const AudioLevelMeter = memo(AudioLevelMeterImpl);
(AudioLevelMeter as unknown as { displayName: string }).displayName = "AudioLevelMeter";
