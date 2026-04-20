"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseWebSocketOptions {
  protocols?: string | string[];
  autoConnect?: boolean;
  retryInterval?: number;
  maxRetries?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  filter?: (message: MessageEvent) => boolean;
}

export interface UseWebSocketReturn {
  status: "connecting" | "open" | "closing" | "closed";
  readyState: number;
  lastMessage: MessageEvent | null;
  lastJsonMessage: unknown | null;
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  sendJson: (data: unknown) => void;
  close: (code?: number, reason?: string) => void;
  reconnect: () => void;
  getSocket: () => WebSocket | null;
}

const readyStateToStatus = (
  rs: number
): UseWebSocketReturn["status"] => {
  switch (rs) {
    case 0: return "connecting";
    case 1: return "open";
    case 2: return "closing";
    case 3: return "closed";
    default: return "closed";
  }
};

/**
 * Managed WebSocket subscription. Exposes `{ readyState, lastMessage, send,
 * close }`; auto-reconnects with exponential backoff; closes on unmount.
 * Pass `null` for `url` to pause.
 */
export function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    protocols,
    autoConnect = true,
    retryInterval = 3000,
    maxRetries = 5,
    onOpen,
    onClose,
    onError,
    onMessage,
    filter,
  } = options;

  const [status, setStatus] = useState<UseWebSocketReturn["status"]>("closed");
  const [readyState, setReadyState] = useState<number>(3);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [lastJsonMessage, setLastJsonMessage] = useState<unknown | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);

  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const onMessageRef = useRef(onMessage);
  const filterRef = useRef(filter);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { filterRef.current = filter; }, [filter]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    clearRetryTimer();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus("closed");
    setReadyState(3);
  }, [clearRetryTimer]);

  const connect = useCallback(() => {
    if (typeof WebSocket === "undefined" || !url) return;

    closeSocket();
    intentionalCloseRef.current = false;
    setStatus("connecting");
    setReadyState(0);

    const ws = protocols
      ? new WebSocket(url, protocols)
      : new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = (event: Event) => {
      retriesRef.current = 0;
      setStatus("open");
      setReadyState(1);
      onOpenRef.current?.(event);
    };

    ws.onclose = (event: CloseEvent) => {
      setStatus("closed");
      setReadyState(3);
      onCloseRef.current?.(event);

      if (!intentionalCloseRef.current && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
          connect();
        }, retryInterval);
      }
    };

    ws.onerror = (event: Event) => {
      onErrorRef.current?.(event);
    };

    ws.onmessage = (event: MessageEvent) => {
      onMessageRef.current?.(event);

      if (filterRef.current && !filterRef.current(event)) return;

      setLastMessage(event);
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(event.data as string);
      } catch {
        parsed = null;
      }
      setLastJsonMessage(parsed);
    };
  }, [url, protocols, maxRetries, retryInterval, closeSocket]);

  useEffect(() => {
    if (url && autoConnect) {
      connect();
    }
    return () => {
      intentionalCloseRef.current = true;
      closeSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect]);

  const send = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      socketRef.current?.send(data);
    },
    []
  );

  const sendJson = useCallback((data: unknown) => {
    socketRef.current?.send(JSON.stringify(data));
  }, []);

  const close = useCallback(
    (code?: number, reason?: string) => {
      intentionalCloseRef.current = true;
      clearRetryTimer();
      if (socketRef.current) {
        socketRef.current.close(code, reason);
        socketRef.current = null;
      }
      setStatus("closed");
      setReadyState(3);
    },
    [clearRetryTimer]
  );

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  const getSocket = useCallback(() => socketRef.current, []);

  return {
    status,
    readyState,
    lastMessage,
    lastJsonMessage,
    send,
    sendJson,
    close,
    reconnect,
    getSocket,
  };
}
