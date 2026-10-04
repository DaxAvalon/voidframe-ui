"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useElementSize } from "../hooks/useElementSize";
import { cx } from "../utils/cx";

/** Min/max per bucket for a time range; values in -1..1. Supplied by the consumer, never decoded here. */
export interface WaveformTile {
  start: number;
  end: number;
  min: ArrayLike<number>;
  max: ArrayLike<number>;
}

export interface WaveformSegment {
  id: string;
  start: number;
  end: number;
  /** Superseded audio (a punch replaced it): drawn dimmed and hatched, never selectable as a cut. */
  hidden?: boolean;
  label?: string;
}

export interface WaveformBoundary {
  at: number;
  crossfadeMs?: number;
}

export type WaveformMarkerKind = "marker" | "flag" | "gap" | "peak";

export interface WaveformMarker {
  id: string;
  at: number;
  kind: WaveformMarkerKind;
  label?: string;
}

export interface WaveformRange {
  start: number;
  end: number;
}

export interface WaveformStripProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  /** Total length in seconds. */
  duration: number;
  /** Min/max tiles for the visible range (see `onTilesNeeded`). */
  tiles?: WaveformTile[];
  segments?: WaveformSegment[];
  boundaries?: WaveformBoundary[];
  markers?: WaveformMarker[];
  /** Playhead position in seconds. */
  playhead?: number;
  selection?: WaveformRange | null;
  /** Pixels per second. Default: fit `duration` to the width. */
  zoom?: number;
  /** Width in CSS px; measured from the element when omitted. */
  width?: number;
  /** Seconds moved per arrow key when the strip is focused (Shift multiplies by 10). Default 1. */
  seekStep?: number;
  showRuler?: boolean;
  size?: "md" | "lg";
  /** Accessible name. Default "Waveform". */
  label?: string;
  onSeek?: (time: number) => void;
  onSelect?: (range: WaveformRange | null) => void;
  onMarkerClick?: (id: string) => void;
  onSegmentClick?: (id: string) => void;
  /** Called with the visible range and the pixel density whenever either changes; supply tiles for it. */
  onTilesNeeded?: (range: WaveformRange, pixelsPerSecond: number) => void;
}

const LANE_ORDER: WaveformMarkerKind[] = ["marker", "flag", "gap", "peak"];
const KIND_WORD: Record<WaveformMarkerKind, string> = { marker: "Marker", flag: "Pickup flag", gap: "Gap", peak: "Peak" };

/** Time → x in px for a strip of `width` px showing `duration` s (or `pps` px per second when given). */
export function timeToX(time: number, duration: number, width: number, pps?: number): number {
  const scale = pps ?? (duration > 0 ? width / duration : 0);
  return Math.min(Math.max(time, 0), Math.max(duration, 0)) * scale;
}

/** x in px → time in seconds, clamped to 0..duration. */
export function xToTime(x: number, duration: number, width: number, pps?: number): number {
  const scale = pps ?? (duration > 0 ? width / duration : 0);
  if (scale <= 0) return 0;
  return Math.min(Math.max(x / scale, 0), Math.max(duration, 0));
}

/** Resample tiles into one min and one max per pixel column over `start..end`. Columns without data stay 0. */
export function bucketTiles(tiles: WaveformTile[], start: number, end: number, columns: number): { min: Float32Array; max: Float32Array } {
  const min = new Float32Array(columns);
  const max = new Float32Array(columns);
  const span = end - start;
  if (!(span > 0) || columns <= 0) return { min, max };
  const secPerCol = span / columns;
  for (const t of tiles) {
    const n = Math.min(t.min.length, t.max.length);
    if (n === 0 || !(t.end > t.start)) continue;
    const secPerBucket = (t.end - t.start) / n;
    for (let i = 0; i < n; i++) {
      const bs = t.start + i * secPerBucket;
      const be = bs + secPerBucket;
      const c0 = Math.max(0, Math.floor((bs - start) / secPerCol));
      const c1 = Math.min(columns - 1, Math.ceil((be - start) / secPerCol) - 1);
      const lo = t.min[i] ?? 0;
      const hi = t.max[i] ?? 0;
      for (let c = c0; c <= c1; c++) {
        if (lo < (min[c] ?? 0)) min[c] = lo;
        if (hi > (max[c] ?? 0)) max[c] = hi;
      }
    }
  }
  return { min, max };
}

const STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600];

/** Tick times for a ruler: the smallest step that keeps labels at least `minPx` apart. */
export function rulerTicks(duration: number, width: number, minPx = 64): number[] {
  if (!(duration > 0) || !(width > 0)) return [];
  const pps = width / duration;
  const step = STEPS.find((s) => s * pps >= minPx) ?? 3600;
  const ticks: number[] = [];
  for (let t = 0; t <= duration + 1e-9; t += step) ticks.push(Math.round(t * 1000) / 1000);
  return ticks;
}

/** `m:ss`, or `h:mm:ss` from an hour. */
export function formatTimecode(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}:` : ""}${h > 0 ? String(m).padStart(2, "0") : m}:${String(sec).padStart(2, "0")}`;
}

function envelopePath(min: Float32Array, max: Float32Array, height: number): string {
  const n = min.length;
  if (n === 0) return "";
  const mid = height / 2;
  let d = `M0 ${mid}`;
  for (let x = 0; x < n; x++) d += ` L${x} ${(mid - (max[x] ?? 0) * mid).toFixed(2)}`;
  for (let x = n - 1; x >= 0; x--) d += ` L${x} ${(mid - (min[x] ?? 0) * mid).toFixed(2)}`;
  return d + " Z";
}

const WaveformStripImpl = forwardRef<HTMLDivElement, WaveformStripProps>(function WaveformStrip(
  {
    duration,
    tiles = [],
    segments = [],
    boundaries = [],
    markers = [],
    playhead,
    selection = null,
    zoom,
    width: widthProp,
    seekStep = 1,
    showRuler = true,
    size = "md",
    label = "Waveform",
    onSeek,
    onSelect,
    onMarkerClick,
    onSegmentClick,
    onTilesNeeded,
    className,
    onKeyDown,
    ...rest
  },
  ref
) {
  const innerRef = useRef<HTMLDivElement>(null);
  const measured = useElementSize(innerRef);
  const width = Math.max(0, Math.floor(widthProp ?? measured.width ?? 0));
  const pps = zoom ?? (duration > 0 && width > 0 ? width / duration : 0);
  const contentWidth = zoom ? Math.max(width, Math.ceil(duration * zoom)) : width;
  const height = size === "lg" ? 120 : 72;
  const columns = Math.max(0, Math.floor(contentWidth));

  const env = useMemo(() => bucketTiles(tiles, 0, duration, columns), [tiles, duration, columns]);
  const path = useMemo(() => envelopePath(env.min, env.max, height), [env, height]);
  const ticks = useMemo(() => (showRuler ? rulerTicks(duration, contentWidth) : []), [showRuler, duration, contentWidth]);
  const lanes = useMemo(() => LANE_ORDER.filter((k) => markers.some((m) => m.kind === k)), [markers]);

  useEffect(() => {
    if (onTilesNeeded && duration > 0 && pps > 0) onTilesNeeded({ start: 0, end: duration }, pps);
  }, [onTilesNeeded, duration, pps]);

  const x = useCallback((t: number) => timeToX(t, duration, contentWidth, pps || undefined), [duration, contentWidth, pps]);
  const toTime = useCallback(
    (clientX: number, el: HTMLElement) => xToTime(clientX - el.getBoundingClientRect().left + (innerRef.current?.scrollLeft ?? 0), duration, contentWidth, pps || undefined),
    [duration, contentWidth, pps]
  );

  const drag = useRef<{ start: number; moved: boolean } | null>(null);
  const [draft, setDraft] = useState<WaveformRange | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const t = toTime(e.clientX, e.currentTarget);
    drag.current = { start: t, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const t = toTime(e.clientX, e.currentTarget);
    if (Math.abs(x(t) - x(drag.current.start)) > 3) {
      drag.current.moved = true;
      setDraft({ start: Math.min(t, drag.current.start), end: Math.max(t, drag.current.start) });
    }
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const t = toTime(e.clientX, e.currentTarget);
    if (d.moved) {
      onSelect?.({ start: Math.min(t, d.start), end: Math.max(t, d.start) });
    } else {
      if (selection) onSelect?.(null);
      onSeek?.(t);
      const seg = segments.find((s) => t >= s.start && t < s.end);
      if (seg) onSegmentClick?.(seg.id);
    }
    setDraft(null);
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!onSeek || e.defaultPrevented) return;
    const cur = playhead ?? 0;
    const step = seekStep * (e.shiftKey ? 10 : 1);
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = cur + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = cur - step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = duration;
    if (next === null) return;
    e.preventDefault();
    onSeek(Math.min(Math.max(next, 0), duration));
  };

  const hiddenCount = segments.filter((s) => s.hidden).length;
  const summary = `${formatTimecode(playhead ?? 0)} of ${formatTimecode(duration)} · ${segments.length} take${segments.length === 1 ? "" : "s"}${hiddenCount ? ` (${hiddenCount} replaced)` : ""} · ${markers.length} marker${markers.length === 1 ? "" : "s"}`;
  const shown = draft ?? selection;

  return (
    <div
      ref={ref}
      className={cx("vf-waveform-strip", `vf-waveform-strip--${size}`, onSeek && "vf-waveform-strip--seekable", className)}
      {...rest}
    >
      <div ref={innerRef} className="vf-waveform-strip__viewport">
        <div className="vf-waveform-strip__content" style={{ width: contentWidth || undefined }}>
          {showRuler && (
            <div className="vf-waveform-strip__ruler" aria-hidden="true">
              {ticks.map((t) => (
                <span key={t} className="vf-waveform-strip__tick" style={{ left: x(t) }}>
                  {formatTimecode(t)}
                </span>
              ))}
            </div>
          )}
          {lanes.map((kind) => (
            <div key={kind} className={cx("vf-waveform-strip__lane", `vf-waveform-strip__lane--${kind}`)} data-lane={kind}>
              {markers
                .filter((m) => m.kind === kind)
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={cx("vf-waveform-strip__marker", `vf-waveform-strip__marker--${kind}`)}
                    style={{ left: x(m.at) }}
                    data-marker={m.id}
                    aria-label={`${KIND_WORD[kind]}${m.label ? `: ${m.label}` : ""}, ${formatTimecode(m.at)}`}
                    title={m.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick?.(m.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                ))}
            </div>
          ))}
          <div className="vf-waveform-strip__wave" style={{ height }}>
            <svg aria-hidden="true" className="vf-waveform-strip__svg" width={columns || undefined} height={height} viewBox={`0 0 ${Math.max(columns, 1)} ${height}`} preserveAspectRatio="none" focusable="false">
              <path className="vf-waveform-strip__envelope" d={path} />
            </svg>
            {segments.map((s) => (
              <div
                key={s.id}
                aria-hidden="true"
                className={cx("vf-waveform-strip__segment", s.hidden && "vf-waveform-strip__segment--hidden")}
                data-segment={s.id}
                data-hidden={s.hidden ? "true" : undefined}
                style={{ left: x(s.start), width: Math.max(0, x(s.end) - x(s.start)) }}
                title={s.label}
              />
            ))}
            {boundaries.map((b, i) => {
              const w = Math.max(1, ((b.crossfadeMs ?? 0) / 1000) * (pps || 0));
              return <div key={`${b.at}-${i}`} aria-hidden="true" className="vf-waveform-strip__boundary" data-boundary={b.at} style={{ left: x(b.at) - w / 2, width: w }} />;
            })}
            {shown && <div aria-hidden="true" className="vf-waveform-strip__selection" data-selection="true" style={{ left: x(shown.start), width: Math.max(0, x(shown.end) - x(shown.start)) }} />}
            {playhead !== undefined && <div aria-hidden="true" className="vf-waveform-strip__playhead" data-playhead={playhead} style={{ left: x(playhead) }} />}
            <div
              className="vf-waveform-strip__seek"
              role={onSeek ? "slider" : "img"}
              tabIndex={onSeek ? 0 : undefined}
              aria-label={label}
              aria-valuemin={onSeek ? 0 : undefined}
              aria-valuemax={onSeek ? Math.round(duration) : undefined}
              aria-valuenow={onSeek ? Math.round(playhead ?? 0) : undefined}
              aria-valuetext={summary}
              aria-roledescription={onSeek ? "waveform, arrow keys seek" : undefined}
              onKeyDown={handleKey}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * A timeline of recorded takes over a waveform drawn from min/max tiles the
 * consumer supplies: segments with superseded (hidden) ranges drawn dimmed
 * and hatched, boundaries with their crossfades, marker lanes (marker · flag
 * · gap · peak) as focusable buttons, a selection, a playhead and a ruler.
 * Click seeks, drag selects; with `onSeek` the strip is a slider the arrow
 * keys move. The strip is never the only way to reach anything: the consumer
 * renders the equivalent list and the component emits ids.
 */
export const WaveformStrip = memo(WaveformStripImpl);
