"use client";

import { useEffect, useState } from "react";

export type PermissionName =
  | "camera"
  | "microphone"
  | "notifications"
  | "geolocation"
  | "clipboard-read"
  | "clipboard-write";

export interface UsePermissionReturn {
  status: PermissionState | "not-supported";
  isGranted: boolean;
  isDenied: boolean;
  isPrompt: boolean;
  isSupported: boolean;
}

export function usePermission(name: PermissionName): UsePermissionReturn {
  const [status, setStatus] = useState<PermissionState | "not-supported">(
    "not-supported"
  );

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.permissions?.query
    ) {
      setStatus("not-supported");
      return;
    }

    let permissionStatus: PermissionStatus | null = null;
    let cancelled = false;

    const onChange = () => {
      if (permissionStatus && !cancelled) {
        setStatus(permissionStatus.state);
      }
    };

    navigator.permissions
      .query({ name: name as globalThis.PermissionName })
      .then((result) => {
        if (cancelled) return;
        permissionStatus = result;
        setStatus(result.state);
        result.addEventListener("change", onChange);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("not-supported");
        }
      });

    return () => {
      cancelled = true;
      if (permissionStatus) {
        permissionStatus.removeEventListener("change", onChange);
      }
    };
  }, [name]);

  return {
    status,
    isGranted: status === "granted",
    isDenied: status === "denied",
    isPrompt: status === "prompt",
    isSupported: status !== "not-supported",
  };
}
