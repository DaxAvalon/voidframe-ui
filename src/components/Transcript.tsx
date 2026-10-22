"use client";

// Transcript — timed text segments that follow playback and seek on click.
// Text derived locally from a recording; the component never fetches or
// sends anything.

import { forwardRef, memo, useEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface TranscriptSegment {
  /** Stable id; defaults to the index. */
  id?: string;
  /** Start time in seconds. */
  startS: number;
  /** End time in seconds; defaults to the next segment's start. */
  endS?: number;
  text: string;
  /** 0..1 recogniser confidence; segments under `lowConfidenceBelow` are dimmed. */
  confidence?: number;
  speaker?: string;
  /** Marked by a reviewer; rendered with a flag. */
  flagged?: boolean;
}

export interface TranscriptProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  segments: TranscriptSegment[];
  /** Playback position; the segment containing it is highlighted (`aria-current`). */
  currentTimeS?: number;
  /** Click or Enter on a segment. When omitted, segments are static text. */
  onSeek?: (startS: number, segment: TranscriptSegment, index: number) => void;
  /** Dim segments whose confidence is below this. Default 0.6. */
  lowConfidenceBelow?: number;
  /** Show the start time before each segment. Default true. */
  showTimestamps?: boolean;
  /** Show the speaker before each segment. Default true when any segment has one. */
  showSpeakers?: boolean;
  /** Scroll the current segment into view as `currentTimeS` moves. Default false. */
  follow?: boolean;
  /** Time formatter. Default `m:ss`. */
  formatTime?: (seconds: number) => string;
  /** Accessible name. Default "Transcript". */
  label?: string;
  /** Text shown when `segments` is empty. */
  empty?: ReactNode;
  /** Custom segment body (text only; the row chrome stays). */
  renderText?: (segment: TranscriptSegment, index: number) => ReactNode;
  /** Text size. Default `md`. */
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

/** `m:ss` or `h:mm:ss`. */
export function formatTranscriptTime(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/**
 * Index of the segment containing `timeS`: the last segment whose start is
 * at or before the time, unless it has ended. -1 before the first segment.
 */
export function activeSegmentIndex(segments: readonly TranscriptSegment[], timeS: number | undefined): number {
  if (timeS === undefined || !Number.isFinite(timeS)) return -1;
  let active = -1;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (seg.startS > timeS) break;
    const end = seg.endS ?? segments[i + 1]?.startS;
    if (end === undefined || timeS < end) active = i;
    else active = -1;
  }
  return active;
}

const TranscriptImpl = forwardRef<HTMLDivElement, TranscriptProps>(function Transcript(
  {
    segments,
    currentTimeS,
    onSeek,
    lowConfidenceBelow = 0.6,
    showTimestamps = true,
    showSpeakers,
    follow = false,
    formatTime = formatTranscriptTime,
    label = "Transcript",
    empty = "No transcript.",
    renderText,
    size = "md",
    className,
    ...rest
  },
  ref
) {
  const active = useMemo(() => activeSegmentIndex(segments, currentTimeS), [segments, currentTimeS]);
  const speakers = showSpeakers ?? segments.some((s) => s.speaker);
  const activeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!follow || active < 0) return;
    activeRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [follow, active]);
  const interactive = Boolean(onSeek);
  return (
    <div
      ref={ref}
      role="list"
      aria-label={label}
      className={cx("vf-transcript", `vf-transcript--${size}`, interactive && "vf-transcript--interactive", className)}
      {...rest}
    >
      {segments.length === 0 ? (
        <p className="vf-transcript__empty">{empty}</p>
      ) : (
        segments.map((seg, i) => {
          const isActive = i === active;
          const low = seg.confidence !== undefined && seg.confidence < lowConfidenceBelow;
          const body = (
            <>
              {showTimestamps ? (
                <span className="vf-transcript__time">{formatTime(seg.startS)}</span>
              ) : null}
              {speakers && seg.speaker ? <span className="vf-transcript__speaker">{seg.speaker}</span> : null}
              <span className="vf-transcript__text">{renderText ? renderText(seg, i) : seg.text}</span>
              {seg.flagged ? (
                <span className="vf-transcript__flag" aria-label="Flagged" role="img">
                  ⚑
                </span>
              ) : null}
            </>
          );
          const common = {
            key: seg.id ?? i,
            role: "listitem" as const,
            className: cx(
              "vf-transcript__segment",
              isActive && "vf-transcript__segment--active",
              low && "vf-transcript__segment--low",
              seg.flagged && "vf-transcript__segment--flagged"
            ),
            "aria-current": isActive ? ("true" as const) : undefined,
            "data-start": seg.startS,
            "data-confidence": low ? "low" : undefined,
            "data-flagged": seg.flagged || undefined,
            ref: isActive ? (activeRef as React.RefObject<never>) : undefined,
          };
          return interactive ? (
            <button
              type="button"
              {...common}
              aria-label={`${formatTime(seg.startS)}${seg.speaker ? `, ${seg.speaker}` : ""}: ${seg.text}`}
              onClick={() => onSeek?.(seg.startS, seg, i)}
            >
              {body}
            </button>
          ) : (
            <div {...common}>{body}</div>
          );
        })
      )}
    </div>
  );
});

/**
 * A timed transcript: start-time stamps, optional speakers, the current
 * segment highlighted as playback moves, click (or Enter) to seek,
 * low-confidence segments dimmed and reviewer flags shown. Pairs with
 * `AudioPlayer`, `WaveformStrip` or any `currentTime`.
 */
export const Transcript = memo(TranscriptImpl);
(Transcript as unknown as { displayName: string }).displayName = "Transcript";
