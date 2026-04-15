"use client";

import { useEffect, useState } from "react";

export interface NetworkStatus {
  online: boolean;
  downlink?: number;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    downlink?: number;
    effectiveType?: NetworkStatus["effectiveType"];
    addEventListener: (type: string, fn: () => void) => void;
    removeEventListener: (type: string, fn: () => void) => void;
  };
}

function read(): NetworkStatus {
  if (typeof navigator === "undefined") return { online: true };
  const conn = (navigator as NavigatorWithConnection).connection;
  return {
    online: navigator.onLine,
    downlink: conn?.downlink,
    effectiveType: conn?.effectiveType,
  };
}

/**
 * `{ online, downlink?, effectiveType? }`. Reacts to `online`/`offline` events
 * and (where supported) `navigator.connection` changes.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(read);

  useEffect(() => {
    const update = () => setStatus(read());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as NavigatorWithConnection).connection;
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);

  return status;
}
