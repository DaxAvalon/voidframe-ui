"use client";

// useAudioLevel — RMS and peak level of a MediaStream in dBFS, with meter
// ballistics (instant attack, limited release) and a silence detector.
// Pure helpers are exported for custom meters and tests. The analysis runs
// locally in an AudioContext; nothing is sent anywhere.

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioLevelState = "idle" | "suspended" | "live" | "silent";

export interface UseAudioLevelOptions {
  /** Analyser window. Default 2048 samples. */
  fftSize?: 256 | 512 | 1024 | 2048 | 4096 | 8192;
  /** How fast the shown RMS level may fall. Default 24 dB/s. */
  releaseDbPerSecond?: number;
  /** How fast the peak indicator may fall. Default 12 dB/s. */
  peakReleaseDbPerSecond?: number;
  /** Level under which the signal counts as silent. Default -60 dBFS. */
  silentDb?: number;
  /** How long the level must stay under `silentDb` before `state` becomes `"silent"`. Default 2000 ms. */
  silenceMs?: number;
  /** Floor returned instead of -Infinity for digital silence. Default -100 dBFS. */
  floorDb?: number;
  /** Polling interval when `requestAnimationFrame` is unavailable. Default 50 ms. */
  intervalMs?: number;
  /** Reuse an existing context (the consumer owns it). */
  audioContext?: AudioContext | null;
}

export interface UseAudioLevelReturn {
  /** Smoothed RMS level in dBFS; `floorDb` when there is no signal. */
  db: number;
  /** Peak sample level in dBFS with slow release. */
  peak: number;
  /** `idle` without a stream; `suspended` until the context runs (call `resume()` from a gesture); `live` or `silent`. */
  state: AudioLevelState;
  /** Resume a suspended AudioContext (autoplay policy). */
  resume: () => Promise<void>;
}

/** RMS of a Float32 sample block in dBFS; `floorDb` for all-zero input. */
export function rmsDb(samples: ArrayLike<number>, floorDb = -100): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i]!;
    sum += v * v;
  }
  if (samples.length === 0 || sum === 0) return floorDb;
  const db = 20 * Math.log10(Math.sqrt(sum / samples.length));
  return Math.max(floorDb, db);
}

/** Peak absolute sample in dBFS; `floorDb` for all-zero input. */
export function peakDb(samples: ArrayLike<number>, floorDb = -100): number {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]!);
    if (a > max) max = a;
  }
  if (max === 0) return floorDb;
  return Math.max(floorDb, 20 * Math.log10(max));
}

/** Meter ballistics: rises are instant, falls are limited to `rateDbPerSecond`. */
export function applyRelease(shown: number, target: number, dtSeconds: number, rateDbPerSecond: number): number {
  if (!Number.isFinite(shown) || target >= shown) return target;
  if (rateDbPerSecond <= 0 || dtSeconds <= 0) return target;
  return Math.max(target, shown - rateDbPerSecond * dtSeconds);
}

/**
 * Silence detector: returns the new "silent since" timestamp (or null) and
 * whether silence has lasted at least `silenceMs`.
 */
export function detectSilence(
  db: number,
  nowMs: number,
  silentSince: number | null,
  silentDb: number,
  silenceMs: number
): { silentSince: number | null; silent: boolean } {
  if (db >= silentDb) return { silentSince: null, silent: false };
  const since = silentSince ?? nowMs;
  return { silentSince: since, silent: nowMs - since >= silenceMs };
}

type AudioContextCtor = new () => AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * Measure a stream's audio level for an `AudioLevelMeter`.
 *
 * ```tsx
 * const mic = useUserMedia({ audio: true });
 * const level = useAudioLevel(mic.stream);
 * <AudioLevelMeter value={level.db} peak={level.peak} state={level.state === "idle" ? "pending" : "live"} />
 * ```
 */
export function useAudioLevel(stream: MediaStream | null | undefined, options: UseAudioLevelOptions = {}): UseAudioLevelReturn {
  const {
    fftSize = 2048,
    releaseDbPerSecond = 24,
    peakReleaseDbPerSecond = 12,
    silentDb = -60,
    silenceMs = 2000,
    floorDb = -100,
    intervalMs = 50,
    audioContext,
  } = options;
  const [db, setDb] = useState(floorDb);
  const [peak, setPeak] = useState(floorDb);
  const [state, setState] = useState<AudioLevelState>("idle");
  const ctxRef = useRef<AudioContext | null>(null);
  const ownsCtxRef = useRef(false);

  const resume = useCallback(async () => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
      setState((s) => (s === "suspended" ? "live" : s));
    }
  }, []);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setState("idle");
      setDb(floorDb);
      setPeak(floorDb);
      return;
    }
    const Ctor = getAudioContextCtor();
    const ctx = audioContext ?? (Ctor ? new Ctor() : null);
    if (!ctx) {
      setState("idle");
      return;
    }
    ctxRef.current = ctx;
    ownsCtxRef.current = !audioContext;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    try {
      source = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      source.connect(analyser);
    } catch {
      setState("idle");
      return;
    }
    const buffer = new Float32Array(analyser.fftSize);
    let shownDb = floorDb;
    let shownPeak = floorDb;
    let silentSince: number | null = null;
    let last = typeof performance !== "undefined" ? performance.now() : Date.now();
    let cancelled = false;
    let frame = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    setState(ctx.state === "suspended" ? "suspended" : "live");

    const tick = () => {
      if (cancelled || !analyser) return;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      analyser.getFloatTimeDomainData(buffer);
      const targetDb = rmsDb(buffer, floorDb);
      const targetPeak = peakDb(buffer, floorDb);
      shownDb = applyRelease(shownDb, targetDb, dt, releaseDbPerSecond);
      shownPeak = applyRelease(shownPeak, targetPeak, dt, peakReleaseDbPerSecond);
      setDb(shownDb);
      setPeak(shownPeak);
      if (ctx.state === "suspended") {
        setState("suspended");
      } else {
        const res = detectSilence(targetDb, now, silentSince, silentDb, silenceMs);
        silentSince = res.silentSince;
        setState(res.silent ? "silent" : "live");
      }
      if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(tick);
    };
    if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(tick);
    else timer = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      if (frame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      if (timer) clearInterval(timer);
      try {
        source?.disconnect();
      } catch {
        /* noop */
      }
      if (ownsCtxRef.current) {
        void ctx.close().catch(() => undefined);
      }
      ctxRef.current = null;
    };
  }, [stream, audioContext, fftSize, releaseDbPerSecond, peakReleaseDbPerSecond, silentDb, silenceMs, floorDb, intervalMs]);

  return { db, peak, state, resume };
}
