"use client";

// useMediaRecorder — record a MediaStream to Blobs with `MediaRecorder`.
// Recordings stay in memory in the page until the consumer does something
// with the Blob; nothing is uploaded.

import { useCallback, useEffect, useRef, useState } from "react";

export type MediaRecorderState = "inactive" | "recording" | "paused" | "unsupported";

export interface UseMediaRecorderOptions {
  /** Preferred container/codec; the first supported entry of this list (or the string) is used. */
  mimeType?: string | string[];
  /** Emit a chunk every N ms (`MediaRecorder.start(timeslice)`); omit for one chunk at stop. */
  timesliceMs?: number;
  /** Called for every chunk as it arrives. */
  onChunk?: (chunk: Blob, index: number) => void;
  /** Called when a recording stops, with the assembled Blob. */
  onStop?: (blob: Blob, chunks: Blob[]) => void;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

export interface UseMediaRecorderReturn {
  state: MediaRecorderState;
  /** Chunks received so far in the current or last recording. */
  chunks: Blob[];
  /** The assembled recording after `stop()`; `null` while recording or before any recording. */
  blob: Blob | null;
  /** Milliseconds recorded (excludes paused time). */
  durationMs: number;
  /** The MIME type actually in use, once started. */
  mimeType: string | null;
  error: unknown;
  start: () => void;
  /** Stops and resolves with the assembled Blob. */
  stop: () => Promise<Blob | null>;
  pause: () => void;
  resume: () => void;
  /** Forget the chunks and the blob. */
  reset: () => void;
}

const DEFAULT_AUDIO_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

/** First MIME type the browser's `MediaRecorder` supports, or `undefined` to let it choose. */
export function pickRecorderMimeType(preferred: string | string[] = DEFAULT_AUDIO_TYPES): string | undefined {
  const list = typeof preferred === "string" ? [preferred] : preferred;
  const MR = typeof MediaRecorder !== "undefined" ? MediaRecorder : null;
  if (!MR || typeof MR.isTypeSupported !== "function") return list[0];
  return list.find((t) => MR.isTypeSupported(t));
}

/**
 * Record a `MediaStream`. Create a recorder per `start()`, collect chunks,
 * and hand back a Blob on `stop()`.
 *
 * ```tsx
 * const rec = useMediaRecorder(mic.stream, { timesliceMs: 1000 });
 * <Button onClick={rec.state === "recording" ? () => void rec.stop() : rec.start}>…</Button>
 * ```
 */
export function useMediaRecorder(
  stream: MediaStream | null | undefined,
  options: UseMediaRecorderOptions = {}
): UseMediaRecorderReturn {
  const supported = typeof MediaRecorder !== "undefined";
  const [state, setState] = useState<MediaRecorderState>(supported ? "inactive" : "unsupported");
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const stopResolveRef = useRef<((b: Blob | null) => void) | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  const finish = useCallback(() => {
    const rec = recorderRef.current;
    const type = rec?.mimeType || mimeType || "application/octet-stream";
    const all = chunksRef.current.slice();
    const out = all.length ? new Blob(all, { type }) : null;
    if (startedAtRef.current !== null) {
      accumulatedRef.current += now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    setDurationMs(Math.round(accumulatedRef.current));
    setBlob(out);
    setState("inactive");
    recorderRef.current = null;
    if (out) optionsRef.current.onStop?.(out, all);
    stopResolveRef.current?.(out);
    stopResolveRef.current = null;
  }, [mimeType]);

  const start = useCallback(() => {
    if (!supported || !stream) return;
    if (recorderRef.current && recorderRef.current.state !== "inactive") return;
    const type = pickRecorderMimeType(optionsRef.current.mimeType);
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, {
        ...(type ? { mimeType: type } : {}),
        audioBitsPerSecond: optionsRef.current.audioBitsPerSecond,
        videoBitsPerSecond: optionsRef.current.videoBitsPerSecond,
      });
    } catch (err) {
      setError(err);
      return;
    }
    chunksRef.current = [];
    accumulatedRef.current = 0;
    setChunks([]);
    setBlob(null);
    setDurationMs(0);
    setError(null);
    setMimeType(rec.mimeType || type || null);
    rec.addEventListener("dataavailable", (e: BlobEvent) => {
      if (!e.data || e.data.size === 0) return;
      chunksRef.current.push(e.data);
      setChunks(chunksRef.current.slice());
      optionsRef.current.onChunk?.(e.data, chunksRef.current.length - 1);
    });
    rec.addEventListener("error", (e: Event) => {
      setError((e as { error?: unknown }).error ?? e);
    });
    rec.addEventListener("stop", finish);
    rec.addEventListener("pause", () => {
      if (startedAtRef.current !== null) {
        accumulatedRef.current += now() - startedAtRef.current;
        startedAtRef.current = null;
      }
      setDurationMs(Math.round(accumulatedRef.current));
      setState("paused");
    });
    rec.addEventListener("resume", () => {
      startedAtRef.current = now();
      setState("recording");
    });
    recorderRef.current = rec;
    const slice = optionsRef.current.timesliceMs;
    if (slice && slice > 0) rec.start(slice);
    else rec.start();
    startedAtRef.current = now();
    setState("recording");
  }, [supported, stream, finish]);

  const stop = useCallback((): Promise<Blob | null> => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return Promise.resolve(blob);
    return new Promise<Blob | null>((resolve) => {
      stopResolveRef.current = resolve;
      try {
        rec.stop();
      } catch (err) {
        setError(err);
        stopResolveRef.current = null;
        resolve(null);
      }
    });
  }, [blob]);

  const pause = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") rec.pause();
  }, []);
  const resume = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === "paused") rec.resume();
  }, []);
  const reset = useCallback(() => {
    chunksRef.current = [];
    accumulatedRef.current = 0;
    setChunks([]);
    setBlob(null);
    setDurationMs(0);
    setError(null);
  }, []);

  useEffect(
    () => () => {
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          /* noop */
        }
      }
    },
    []
  );

  return { state, chunks, blob, durationMs, mimeType, error, start, stop, pause, resume, reset };
}
