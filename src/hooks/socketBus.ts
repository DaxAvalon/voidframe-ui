"use client";

// Socket bus — one WebSocket shared by many subscribers.
//
// Messages are JSON objects; `topicKey` names the field that routes them
// ("conversationId", "topic"). `subscribe(topic, handler)` receives the
// messages for one topic, `subscribe("*", handler)` receives all. The bus
// reconnects with backoff, replays from the last event id when `replay`
// is set, and treats the configured `authCloseCodes` as terminal (no retry).

import { useEffect, useRef, useState } from "react";

export type SocketBusStatus = "idle" | "connecting" | "open" | "closed" | "unauthorized";

export interface SocketBusOptions {
  /** URL, or a function of the last event id for replay-on-reconnect. */
  url: string | ((lastEventId: string | null) => string);
  protocols?: string | string[];
  /** Field on each message that names its topic. Default `"topic"`. */
  topicKey?: string;
  /** Field on each message that carries a resumable id. Default `"id"`. */
  idKey?: string;
  /**
   * Resume support: remember the last seen id and pass it to the `url`
   * factory on reconnect (and send `{ type: "replay", from }` after open
   * when `replay === "message"`).
   */
  replay?: boolean | "message";
  /** Close codes that mean the credentials are no longer valid; the bus stops retrying. Default `[4001, 4003, 4401, 4403]`. */
  authCloseCodes?: number[];
  retryInterval?: number;
  maxRetries?: number;
  /** Parse incoming data. Default `JSON.parse`; return `null` to drop a frame. */
  parse?: (data: string) => Record<string, unknown> | null;
  /** Serialise outgoing messages. Default `JSON.stringify`. */
  serialize?: (message: unknown) => string;
  /** Open the connection when the first subscriber arrives and close when the last leaves. Default true. */
  lazy?: boolean;
  onStatusChange?: (status: SocketBusStatus, event?: Event | CloseEvent) => void;
}

export type SocketBusHandler = (message: Record<string, unknown>, topic: string) => void;

export interface SocketBus {
  /** Receive messages for one topic (`"*"` for all). Returns the unsubscribe function. */
  subscribe: (topic: string, handler: SocketBusHandler) => () => void;
  /** Send a message (queued until open). */
  send: (message: unknown) => void;
  /** Open the connection now. */
  connect: () => void;
  /** Close and stop retrying. */
  close: (code?: number, reason?: string) => void;
  getStatus: () => SocketBusStatus;
  onStatus: (listener: (status: SocketBusStatus) => void) => () => void;
  getLastEventId: () => string | null;
  /** Number of active subscriptions. */
  size: () => number;
}

/**
 * Create a multiplexed WebSocket bus. One per URL, at module scope or in a
 * provider; subscribe per conversation or per topic with `useSocketTopic`.
 *
 * ```ts
 * export const bus = createSocketBus({ url: (id) => id ? `/ws?from=${id}` : "/ws", topicKey: "conversationId", replay: true });
 * useSocketTopic(bus, conversationId, (msg) => append(msg));
 * ```
 */
export function createSocketBus(options: SocketBusOptions): SocketBus {
  const {
    url,
    protocols,
    topicKey = "topic",
    idKey = "id",
    replay = false,
    authCloseCodes = [4001, 4003, 4401, 4403],
    retryInterval = 1000,
    maxRetries = Infinity,
    parse = (data: string) => {
      try {
        const v = JSON.parse(data) as unknown;
        return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
      } catch {
        return null;
      }
    },
    serialize = (m: unknown) => JSON.stringify(m),
    lazy = true,
    onStatusChange,
  } = options;

  const handlers = new Map<string, Set<SocketBusHandler>>();
  const statusListeners = new Set<(s: SocketBusStatus) => void>();
  const queue: string[] = [];
  let socket: WebSocket | null = null;
  let status: SocketBusStatus = "idle";
  let retries = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastEventId: string | null = null;
  let intentional = false;

  const setStatus = (next: SocketBusStatus, event?: Event | CloseEvent) => {
    if (status === next) return;
    status = next;
    onStatusChange?.(next, event);
    for (const l of statusListeners) l(next);
  };

  const dispatch = (message: Record<string, unknown>) => {
    const id = message[idKey];
    if (replay && (typeof id === "string" || typeof id === "number")) lastEventId = String(id);
    const topic = String(message[topicKey] ?? "*");
    handlers.get(topic)?.forEach((h) => h(message, topic));
    if (topic !== "*") handlers.get("*")?.forEach((h) => h(message, topic));
  };

  const flush = () => {
    if (!socket || socket.readyState !== 1) return;
    while (queue.length) socket.send(queue.shift()!);
  };

  const connect = () => {
    if (typeof WebSocket === "undefined") return;
    if (socket && (socket.readyState === 0 || socket.readyState === 1)) return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    intentional = false;
    const resolved = typeof url === "function" ? url(lastEventId) : url;
    setStatus("connecting");
    const ws = protocols ? new WebSocket(resolved, protocols) : new WebSocket(resolved);
    socket = ws;
    ws.onopen = () => {
      retries = 0;
      setStatus("open");
      if (replay === "message" && lastEventId) ws.send(serialize({ type: "replay", from: lastEventId }));
      flush();
    };
    ws.onmessage = (e: MessageEvent) => {
      const data = typeof e.data === "string" ? e.data : String(e.data);
      const parsed = parse(data);
      if (parsed) dispatch(parsed);
    };
    ws.onclose = (e: CloseEvent) => {
      if (socket !== ws) return;
      socket = null;
      if (authCloseCodes.includes(e.code)) {
        setStatus("unauthorized", e);
        return;
      }
      setStatus("closed", e);
      if (!intentional && handlers.size > 0 && retries < maxRetries) {
        retries += 1;
        const delay = Math.min(30_000, retryInterval * 2 ** (retries - 1));
        timer = setTimeout(connect, delay);
      }
    };
    ws.onerror = () => undefined;
  };

  const close = (code?: number, reason?: string) => {
    intentional = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const ws = socket;
    socket = null;
    ws?.close(code, reason);
    setStatus("closed");
  };

  const subscribe: SocketBus["subscribe"] = (topic, handler) => {
    let set = handlers.get(topic);
    if (!set) {
      set = new Set();
      handlers.set(topic, set);
    }
    set.add(handler);
    if (lazy && !socket && status !== "unauthorized") connect();
    return () => {
      set!.delete(handler);
      if (set!.size === 0) handlers.delete(topic);
      if (lazy && handlers.size === 0) close(1000, "no subscribers");
    };
  };

  return {
    subscribe,
    send: (message) => {
      const frame = serialize(message);
      if (socket && socket.readyState === 1) socket.send(frame);
      else {
        queue.push(frame);
        if (!socket && status !== "unauthorized") connect();
      }
    },
    connect,
    close,
    getStatus: () => status,
    onStatus: (listener) => {
      statusListeners.add(listener);
      return () => {
        statusListeners.delete(listener);
      };
    },
    getLastEventId: () => lastEventId,
    size: () => [...handlers.values()].reduce((n, s) => n + s.size, 0),
  };
}

/**
 * Subscribe a component to one topic on a bus. The handler may change every
 * render; the subscription follows `topic` and `enabled`.
 */
export function useSocketTopic(
  bus: SocketBus | null | undefined,
  topic: string | null | undefined,
  handler: SocketBusHandler,
  options: { enabled?: boolean } = {}
): void {
  const { enabled = true } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (!bus || !topic || !enabled) return;
    return bus.subscribe(topic, (m, t) => handlerRef.current(m, t));
  }, [bus, topic, enabled]);
}

/** The bus's connection status as React state. */
export function useSocketBusStatus(bus: SocketBus | null | undefined): SocketBusStatus {
  const [status, setStatus] = useState<SocketBusStatus>(bus?.getStatus() ?? "idle");
  useEffect(() => {
    if (!bus) return;
    setStatus(bus.getStatus());
    return bus.onStatus(setStatus);
  }, [bus]);
  return status;
}
