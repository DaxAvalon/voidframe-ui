// Phase 16 — useContainerQuery
//
// Observes a container's inline-size and reports which of the supplied
// media-query predicates match. For environments without container-query
// support (older browsers, happy-dom in tests) it falls back to the
// element's ResizeObserver-measured width and evaluates the predicates
// against it.

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type ContainerQueryMap<K extends string> = Record<K, string>;

/**
 * Observe a container element and return the key of the first matching
 * predicate. Predicates use CSS media-feature syntax (e.g.
 * `"(min-width: 400px)"`) and are evaluated against the element's current
 * inline-size.
 */
export function useContainerQuery<K extends string>(
  ref: RefObject<HTMLElement | null>,
  queries: ContainerQueryMap<K>
): K | null {
  const [active, setActive] = useState<K | null>(null);
  const parsed = useRef(parseQueries(queries));
  parsed.current = parseQueries(queries);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof ResizeObserver === "undefined") {
      setActive(firstKey(queries));
      return;
    }
    const update = () => {
      const width = el.getBoundingClientRect().width;
      for (const [key, pred] of parsed.current) {
        if (evalPredicate(width, pred)) {
          setActive(key);
          return;
        }
      }
      setActive(null);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, queries]);

  return active;
}

interface Predicate {
  min?: number;
  max?: number;
}

type ParsedQueryEntry<K extends string> = [K, Predicate];

function parseQueries<K extends string>(
  queries: ContainerQueryMap<K>
): ParsedQueryEntry<K>[] {
  return (Object.entries(queries) as Array<[K, string]>).map(([key, raw]) => [
    key,
    parseQuery(raw),
  ]);
}

function parseQuery(raw: string): Predicate {
  const out: Predicate = {};
  const minMatch = raw.match(/\(\s*min-width\s*:\s*(\d+(?:\.\d+)?)\s*px\s*\)/);
  const maxMatch = raw.match(/\(\s*max-width\s*:\s*(\d+(?:\.\d+)?)\s*px\s*\)/);
  if (minMatch) out.min = parseFloat(minMatch[1]!);
  if (maxMatch) out.max = parseFloat(maxMatch[1]!);
  return out;
}

function evalPredicate(width: number, pred: Predicate): boolean {
  if (pred.min !== undefined && width < pred.min) return false;
  if (pred.max !== undefined && width > pred.max) return false;
  // An empty predicate matches everything.
  return pred.min !== undefined || pred.max !== undefined || true;
}

function firstKey<K extends string>(
  queries: ContainerQueryMap<K>
): K | null {
  const keys = Object.keys(queries) as K[];
  return keys[0] ?? null;
}
