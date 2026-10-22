"use client";

// useUserMedia — request a camera and/or microphone stream.
//
// Media never leaves the device through this hook: it returns the
// `MediaStream` and nothing else is done with it. Sending audio or video
// anywhere is the consumer's explicit act.

import { useCallback, useEffect, useRef, useState } from "react";

export type UserMediaState = "off" | "asking" | "on" | "failed" | "unsupported";

/** Why a request failed, mapped from the `DOMException` name. */
export type UserMediaReason =
  | "denied"
  | "not-found"
  | "in-use"
  | "overconstrained"
  | "insecure"
  | "unsupported"
  | "aborted"
  | "ended"
  | "unknown";

export interface UseUserMediaOptions {
  /** Request the stream on mount. Default false: call `start()` from a gesture. */
  autoStart?: boolean;
  /** Called with the stream once it is live. */
  onStream?: (stream: MediaStream) => void;
  /** Called when the request fails or a track ends. */
  onFailure?: (reason: UserMediaReason, error: unknown) => void;
}

export interface UseUserMediaReturn {
  stream: MediaStream | null;
  state: UserMediaState;
  /** Set while `state === "failed"` (or `"off"` after a track ended). */
  reason: UserMediaReason | null;
  /** The raw error, for logging. */
  error: unknown;
  /** Label of the first audio or video track ("Scarlett 2i2 (1235:8211)"). */
  deviceLabel: string | null;
  /** Labels of the first audio and video tracks. */
  deviceLabels: { audio: string | null; video: string | null };
  /** Request the stream; replaces the current one. Optional constraints override the hook's. */
  start: (constraints?: MediaStreamConstraints) => Promise<MediaStream | null>;
  /** Stop every track and release the device. */
  stop: () => void;
}

/** Map a `getUserMedia` rejection to a user-facing reason. */
export function userMediaReason(error: unknown): UserMediaReason {
  const name = typeof error === "object" && error !== null ? String((error as { name?: unknown }).name ?? "") : "";
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "denied";
    case "SecurityError":
      return typeof window !== "undefined" && window.isSecureContext === false ? "insecure" : "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "not-found";
    case "NotReadableError":
    case "TrackStartError":
      return "in-use";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "overconstrained";
    case "AbortError":
      return "aborted";
    case "TypeError":
      return "unsupported";
    default:
      return "unknown";
  }
}

function labelsOf(stream: MediaStream | null): { audio: string | null; video: string | null } {
  if (!stream) return { audio: null, video: null };
  const audio = stream.getAudioTracks()[0]?.label ?? null;
  const video = stream.getVideoTracks()[0]?.label ?? null;
  return { audio: audio || null, video: video || null };
}

/**
 * Request a camera and/or microphone with `getUserMedia`, exposing the
 * stream and a small state machine (`off → asking → on | failed`) with a
 * `reason` the UI can show. Tracks are stopped on `stop()` and on unmount;
 * a track that ends on its own (device unplugged) returns the hook to `off`
 * with `reason: "ended"`.
 *
 * ```tsx
 * const mic = useUserMedia({ audio: { echoCancellation: false } });
 * <Button onClick={() => mic.start()}>Check microphone</Button>
 * {mic.state === "failed" && <Text>{mic.reason === "denied" ? "Allow the microphone in the address bar." : "No microphone found."}</Text>}
 * ```
 */
export function useUserMedia(
  constraints: MediaStreamConstraints = { audio: true },
  options: UseUserMediaOptions = {}
): UseUserMediaReturn {
  const supported =
    typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<UserMediaState>(supported ? "off" : "unsupported");
  const [reason, setReason] = useState<UserMediaReason | null>(supported ? null : "unsupported");
  const [error, setError] = useState<unknown>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const constraintsRef = useRef(constraints);
  constraintsRef.current = constraints;

  const releaseStream = useCallback(() => {
    const current = streamRef.current;
    if (current) {
      for (const track of current.getTracks()) {
        try {
          track.stop();
        } catch {
          /* already stopped */
        }
      }
    }
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    releaseStream();
    setStream(null);
    setState(supported ? "off" : "unsupported");
    setReason(supported ? null : "unsupported");
    setError(null);
  }, [releaseStream, supported]);

  const start = useCallback(
    async (override?: MediaStreamConstraints): Promise<MediaStream | null> => {
      if (!supported) {
        setState("unsupported");
        setReason("unsupported");
        return null;
      }
      const id = ++requestRef.current;
      releaseStream();
      setStream(null);
      setState("asking");
      setReason(null);
      setError(null);
      try {
        const next = await navigator.mediaDevices.getUserMedia(override ?? constraintsRef.current);
        if (id !== requestRef.current) {
          for (const t of next.getTracks()) t.stop();
          return null;
        }
        streamRef.current = next;
        for (const track of next.getTracks()) {
          track.addEventListener("ended", () => {
            if (streamRef.current !== next) return;
            // Every track gone → the stream is over.
            if (next.getTracks().every((t) => t.readyState === "ended")) {
              releaseStream();
              setStream(null);
              setState("off");
              setReason("ended");
              optionsRef.current.onFailure?.("ended", null);
            }
          });
        }
        setStream(next);
        setState("on");
        optionsRef.current.onStream?.(next);
        return next;
      } catch (err) {
        if (id !== requestRef.current) return null;
        const why = userMediaReason(err);
        setError(err);
        setReason(why);
        setState("failed");
        optionsRef.current.onFailure?.(why, err);
        return null;
      }
    },
    [releaseStream, supported]
  );

  useEffect(() => {
    if (options.autoStart) void start();
    return () => {
      requestRef.current += 1;
      releaseStream();
    };
    // autoStart is a mount-time choice.
  }, []);

  const labels = labelsOf(stream);
  return {
    stream,
    state,
    reason,
    error,
    deviceLabel: labels.audio ?? labels.video,
    deviceLabels: labels,
    start,
    stop,
  };
}
