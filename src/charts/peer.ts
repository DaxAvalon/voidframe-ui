"use client";

// Helper for charts that depend on optional peer packages (d3-force,
// d3-geo, topojson-client, d3-hierarchy, d3-sankey). These are listed as
// optional peer deps so consumers who don't need NetworkGraph /
// ChoroplethMap / BubbleMap / TreeMap / Sunburst / Sankey don't pay for
// them. When the chart renders without the package installed, throw a
// clear error pointing to the install command.

import { useEffect, useState } from "react";

export class MissingPeerDependencyError extends Error {
  readonly packageName: string;
  constructor(packageName: string, usedBy: string) {
    super(
      `[voidframe] ${usedBy} requires the optional peer dependency "${packageName}". ` +
        `Install it with: npm install ${packageName}`
    );
    this.name = "MissingPeerDependencyError";
    this.packageName = packageName;
  }
}

/**
 * Wrap a try/catch around a peer-dep import so callers get a uniform
 * error if the package is missing.
 */
export async function loadPeer<T>(
  packageName: string,
  usedBy: string,
  loader: () => Promise<T>
): Promise<T> {
  try {
    return await loader();
  } catch (cause) {
    throw new MissingPeerDependencyError(packageName, usedBy);
  }
}

// Loaded peer modules, keyed by package name. A second chart that needs
// the same peer renders synchronously on its first paint instead of
// flashing a placeholder.
const peerCache = new Map<string, unknown>();

export interface PeerState<T> {
  /** The loaded module, or `null` while loading or when it failed. */
  module: T | null;
  /** Set when the peer could not be imported. */
  error: MissingPeerDependencyError | null;
}

/**
 * Load an optional peer package on mount and re-render once it is
 * available. The `loader` must be a literal `() => import("pkg")` so the
 * consumer's bundler can see the dependency.
 */
export function usePeer<T>(
  packageName: string,
  usedBy: string,
  loader: () => Promise<T>
): PeerState<T> {
  const [state, setState] = useState<PeerState<T>>(() => ({
    module: (peerCache.get(packageName) as T | undefined) ?? null,
    error: null,
  }));

  useEffect(() => {
    if (state.module || state.error) return;
    let cancelled = false;
    loadPeer(packageName, usedBy, loader).then(
      (mod) => {
        peerCache.set(packageName, mod);
        if (!cancelled) setState({ module: mod, error: null });
      },
      (e: unknown) => {
        if (cancelled) return;
        if (e instanceof MissingPeerDependencyError) {
          setState({ module: null, error: e });
        } else {
          throw e;
        }
      }
    );
    return () => {
      cancelled = true;
    };
    // `loader` is a fresh closure every render; the package name is the
    // identity that matters, so it is deliberately not a dependency.
  }, [packageName, usedBy, state.module, state.error]);

  return state;
}
