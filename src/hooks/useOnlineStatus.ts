"use client";

import { useCallback, useEffect, useState } from "react";

export interface NetworkInfo {
  online: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

function getConnection(): NetworkInformationLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as unknown as { connection?: NetworkInformationLike }).connection;
}

function buildInfo(): NetworkInfo {
  if (typeof navigator === "undefined") {
    return { online: true };
  }

  const info: NetworkInfo = { online: navigator.onLine };
  const conn = getConnection();
  if (conn) {
    if (conn.effectiveType) info.effectiveType = conn.effectiveType as NetworkInfo["effectiveType"];
    if (conn.downlink !== undefined) info.downlink = conn.downlink;
    if (conn.rtt !== undefined) info.rtt = conn.rtt;
    if (conn.saveData !== undefined) info.saveData = conn.saveData;
    if (conn.type) info.type = conn.type;
  }
  return info;
}

/**
 * Track online/offline status and network quality via the Network Information API.
 * SSR-safe: returns `{ online: true }` on the server.
 */
export function useOnlineStatus(): NetworkInfo {
  const [info, setInfo] = useState<NetworkInfo>(buildInfo);

  const update = useCallback(() => {
    setInfo(buildInfo());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const conn = getConnection();
    if (conn) {
      conn.addEventListener("change", update);
    }

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (conn) {
        conn.removeEventListener("change", update);
      }
    };
  }, [update]);

  return info;
}
