"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseEventSourceOptions<T = string> {
  withCredentials?: boolean;
  autoConnect?: boolean;
  retryInterval?: number;
  maxRetries?: number;
  /**
   * Named event types to subscribe to (`event: foo` lines) in addition to
   * the default `message` type. Each arrives through `onEvent`.
   */
  events?: string[];
  /** Turn `event.data` into `T` (JSON.parse, a schema). Errors land in `parseError`. */
  parse?: (data: string, type: string) => T;
  onOpen?: () => void;
  onError?: (event: Event) => void;
  /** Default `message` events only (historical). Prefer `onEvent`. */
  onMessage?: (event: MessageEvent) => void;
  /** Every subscribed event: its type, raw data, parsed data (when `parse` is set) and id. */
  onEvent?: (event: {
    type: string;
    data: string;
    parsed: T | null;
    lastEventId: string | null;
    raw: MessageEvent;
  }) => void;
}

export interface UseEventSourceReturn<T = string> {
  status: "connecting" | "open" | "closed" | "error";
  lastEvent: MessageEvent | null;
  lastEventData: string | null;
  /** `event.type` of the last event received. */
  lastEventType: string | null;
  /** The most recent `id:` seen; sent to the url factory on reconnect. */
  lastEventId: string | null;
  /** The last event's data through `parse` (or the raw string when no `parse`). */
  lastParsed: T | null;
  /** Error thrown by `parse`, if any. */
  parseError: unknown;
  error: Event | null;
  close: () => void;
  reconnect: () => void;
}

/**
 * Managed Server-Sent-Events (SSE) subscription. Auto-reconnects with
 * exponential backoff; exposes `{ data, readyState, error, close }`. Pass
 * `null` for `url` to pause the subscription.
 *
 * `url` may be a function of the last event id, so a reconnect can resume
 * from a cursor: `useEventSource((id) => id ? \`/feed?from=${id}\` : "/feed")`.
 * Named events are delivered when listed in `events`:
 *
 * ```ts
 * useEventSource<Job>("/jobs", { events: ["job", "done"], parse: JSON.parse, onEvent: ({ type, parsed }) => … });
 * ```
 */
export function useEventSource<T = string>(
  url: string | null | ((lastEventId: string | null) => string),
  options: UseEventSourceOptions<T> = {}
): UseEventSourceReturn<T> {
  const {
    withCredentials = false,
    autoConnect = true,
    retryInterval = 3000,
    maxRetries = Infinity,
    events,
    parse,
    onOpen,
    onError,
    onMessage,
    onEvent,
  } = options;

  const [status, setStatus] = useState<UseEventSourceReturn["status"]>("closed");
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);
  const [lastEventData, setLastEventData] = useState<string | null>(null);
  const [lastEventType, setLastEventType] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [lastParsed, setLastParsed] = useState<T | null>(null);
  const [parseError, setParseError] = useState<unknown>(null);
  const [error, setError] = useState<Event | null>(null);

  const sourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | null>(null);

  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);
  const onMessageRef = useRef(onMessage);
  const onEventRef = useRef(onEvent);
  const parseRef = useRef(parse);
  const urlRef = useRef(url);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);
  useEffect(() => { parseRef.current = parse; }, [parse]);
  urlRef.current = url;
  const eventsKey = (events ?? []).join("|");

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const closeSource = useCallback(() => {
    clearRetryTimer();
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setStatus("closed");
  }, [clearRetryTimer]);

  const connect = useCallback(() => {
    const target = urlRef.current;
    if (typeof EventSource === "undefined" || !target) return;
    const resolved = typeof target === "function" ? target(lastEventIdRef.current) : target;

    closeSource();
    setError(null);
    setStatus("connecting");

    const es = new EventSource(resolved, { withCredentials });
    sourceRef.current = es;

    es.onopen = () => {
      retriesRef.current = 0;
      setStatus("open");
      onOpenRef.current?.();
    };

    es.onerror = (event: Event) => {
      setStatus("error");
      setError(event);
      onErrorRef.current?.(event);

      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        // Exponential backoff, capped at 30 s.
        const delay = Math.min(30_000, retryInterval * 2 ** (retriesRef.current - 1));
        retryTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    const handle = (event: MessageEvent) => {
      const data = typeof event.data === "string" ? event.data : String(event.data);
      const id = event.lastEventId || null;
      if (id) lastEventIdRef.current = id;
      let parsed: T | null = null;
      if (parseRef.current) {
        try {
          parsed = parseRef.current(data, event.type);
          setParseError(null);
        } catch (err) {
          setParseError(err);
        }
      } else {
        parsed = data as unknown as T;
      }
      setLastEvent(event);
      setLastEventData(data);
      setLastEventType(event.type);
      setLastEventId(lastEventIdRef.current);
      setLastParsed(parsed);
      if (event.type === "message") onMessageRef.current?.(event);
      onEventRef.current?.({ type: event.type, data, parsed, lastEventId: id ?? lastEventIdRef.current, raw: event });
    };

    es.onmessage = handle;
    for (const type of eventsKey ? eventsKey.split("|") : []) {
      if (type && type !== "message") es.addEventListener(type, handle as EventListener);
    }
    // `eventsKey` stands for the events array's content.
  }, [withCredentials, maxRetries, retryInterval, closeSource, eventsKey]);

  const urlKey = typeof url === "function" ? "fn" : url;
  useEffect(() => {
    if (url && autoConnect) {
      connect();
    }
    return () => {
      closeSource();
    };
    // Reconnect when the url string or the subscribed events change.
  }, [urlKey, autoConnect, eventsKey]);

  const close = useCallback(() => {
    closeSource();
  }, [closeSource]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  return {
    status,
    lastEvent,
    lastEventData,
    lastEventType,
    lastEventId,
    lastParsed,
    parseError,
    error,
    close,
    reconnect,
  };
}
