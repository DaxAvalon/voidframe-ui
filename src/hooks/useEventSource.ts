"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseEventSourceOptions {
  withCredentials?: boolean;
  autoConnect?: boolean;
  retryInterval?: number;
  maxRetries?: number;
  onOpen?: () => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
}

export interface UseEventSourceReturn {
  status: "connecting" | "open" | "closed" | "error";
  lastEvent: MessageEvent | null;
  lastEventData: string | null;
  error: Event | null;
  close: () => void;
  reconnect: () => void;
}

export function useEventSource(
  url: string | null,
  options: UseEventSourceOptions = {}
): UseEventSourceReturn {
  const {
    withCredentials = false,
    autoConnect = true,
    retryInterval = 3000,
    maxRetries = Infinity,
    onOpen,
    onError,
    onMessage,
  } = options;

  const [status, setStatus] = useState<UseEventSourceReturn["status"]>("closed");
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);
  const [lastEventData, setLastEventData] = useState<string | null>(null);
  const [error, setError] = useState<Event | null>(null);

  const sourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

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
    if (typeof EventSource === "undefined" || !url) return;

    closeSource();
    setError(null);
    setStatus("connecting");

    const es = new EventSource(url, { withCredentials });
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
        retryTimerRef.current = setTimeout(() => {
          connect();
        }, retryInterval);
      }
    };

    es.onmessage = (event: MessageEvent) => {
      setLastEvent(event);
      setLastEventData(event.data as string);
      onMessageRef.current?.(event);
    };
  }, [url, withCredentials, maxRetries, retryInterval, closeSource]);

  useEffect(() => {
    if (url && autoConnect) {
      connect();
    }
    return () => {
      closeSource();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect]);

  const close = useCallback(() => {
    closeSource();
  }, [closeSource]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  return { status, lastEvent, lastEventData, error, close, reconnect };
}
