// Deterministic graph layouts.
//
// Pure functions, no peers, no randomness beyond an explicit seed. Given the
// same nodes and edges they return the same positions on every platform, so
// graphs rendered without stored positions (React Flow nodes, custom SVG)
// are stable across reloads and in snapshot tests.

export interface GraphLayoutNode {
  id: string;
}

export interface GraphLayoutEdge {
  source: string;
  target: string;
}

export interface GraphPosition {
  x: number;
  y: number;
}

export interface LayeredLayoutOptions {
  /** `"top-down"` lays layers out vertically (default); `"left-right"` horizontally. */
  direction?: "top-down" | "left-right";
  /** Node box size used for spacing. Default 96 × 32. */
  nodeWidth?: number;
  nodeHeight?: number;
  /** Gap between layers. Default 64. */
  layerGap?: number;
  /** Gap between siblings within a layer. Default 32. */
  siblingGap?: number;
  /**
   * Order of siblings within a layer. `"input"` (default) keeps the order
   * nodes were given in; `"barycenter"` sorts each layer by the mean position
   * of its parents in the previous layer to reduce crossings.
   */
  order?: "input" | "barycenter";
}

export interface LayeredLayoutResult {
  /** Top-left position of every node, keyed by id. */
  positions: Map<string, GraphPosition>;
  /** Layer index (0 = roots) of every node. */
  layers: Map<string, number>;
  /** Bounding box of the laid-out graph. */
  width: number;
  height: number;
}

/**
 * Longest-path layering by incoming edges: a node sits one layer below the
 * deepest node that points at it. Roots (no incoming edges) land at layer 0.
 * Cycles terminate: a back edge contributes layer 0 to the node it re-enters,
 * so every node still gets a finite layer.
 */
export function computeLayers(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[]
): Map<string, number> {
  const layer = new Map<string, number>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    if (!incoming.has(e.target)) incoming.set(e.target, []);
    incoming.get(e.target)!.push(e.source);
  }
  const visiting = new Set<string>();
  const visit = (id: string): number => {
    if (layer.has(id)) return layer.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const sources = incoming.get(id) ?? [];
    let l = 0;
    for (const s of sources) l = Math.max(l, visit(s) + 1);
    visiting.delete(id);
    layer.set(id, l);
    return l;
  };
  for (const n of nodes) visit(n.id);
  return layer;
}

/**
 * Place nodes in layers (the layout `DependencyGraph` uses) and return
 * top-left pixel positions. Deterministic for a given input.
 *
 * ```ts
 * const { positions } = layeredLayout(nodes, edges);
 * const flowNodes = nodes.map((n) => ({ ...n, position: positions.get(n.id)! }));
 * ```
 */
export function layeredLayout(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  options: LayeredLayoutOptions = {}
): LayeredLayoutResult {
  const {
    direction = "top-down",
    nodeWidth = 96,
    nodeHeight = 32,
    layerGap = 64,
    siblingGap = 32,
    order = "input",
  } = options;
  const layers = computeLayers(nodes, edges);
  const byLayer = new Map<number, string[]>();
  for (const n of nodes) {
    const l = layers.get(n.id) ?? 0;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n.id);
  }
  const layerIndices = [...byLayer.keys()].sort((a, b) => a - b);

  if (order === "barycenter") {
    const parents = new Map<string, string[]>();
    for (const e of edges) {
      if (!parents.has(e.target)) parents.set(e.target, []);
      parents.get(e.target)!.push(e.source);
    }
    const slot = new Map<string, number>();
    for (const l of layerIndices) {
      const ids = byLayer.get(l)!;
      if (l > 0) {
        const bary = (id: string): number => {
          const ps = (parents.get(id) ?? []).filter((p) => slot.has(p));
          if (ps.length === 0) return Number.POSITIVE_INFINITY;
          return ps.reduce((s, p) => s + slot.get(p)!, 0) / ps.length;
        };
        const inputIndex = new Map(ids.map((id, i) => [id, i] as const));
        ids.sort((a, b) => {
          const d = bary(a) - bary(b);
          if (d !== 0 && Number.isFinite(d)) return d;
          if (Number.isFinite(bary(a)) !== Number.isFinite(bary(b)))
            return Number.isFinite(bary(a)) ? -1 : 1;
          return inputIndex.get(a)! - inputIndex.get(b)!;
        });
      }
      ids.forEach((id, i) => slot.set(id, i));
    }
  }

  const positions = new Map<string, GraphPosition>();
  const maxCount = Math.max(1, ...layerIndices.map((l) => byLayer.get(l)!.length));
  const vertical = direction === "top-down";
  const acrossSize = vertical ? nodeWidth : nodeHeight;
  const alongSize = vertical ? nodeHeight : nodeWidth;
  const acrossExtent = maxCount * acrossSize + (maxCount - 1) * siblingGap;
  for (const l of layerIndices) {
    const ids = byLayer.get(l)!;
    const rowExtent = ids.length * acrossSize + (ids.length - 1) * siblingGap;
    const offset = (acrossExtent - rowExtent) / 2;
    ids.forEach((id, i) => {
      const across = offset + i * (acrossSize + siblingGap);
      const along = l * (alongSize + layerGap);
      positions.set(id, vertical ? { x: across, y: along } : { x: along, y: across });
    });
  }
  const layerCount = layerIndices.length;
  const alongExtent = layerCount * alongSize + Math.max(0, layerCount - 1) * layerGap;
  return {
    positions,
    layers,
    width: vertical ? acrossExtent : alongExtent,
    height: vertical ? alongExtent : acrossExtent,
  };
}

export interface ForceLayoutOptions {
  /** Seed for the deterministic pseudo-random initial placement. Default 1. */
  seed?: number;
  /** Simulation steps. Default 300. */
  iterations?: number;
  /** Canvas the layout is centred in. Default 800 × 600. */
  width?: number;
  height?: number;
  /** Target edge length. Default 120. */
  linkDistance?: number;
  /** Repulsion strength between every pair of nodes. Default 2000. */
  charge?: number;
  /** Pull toward the canvas centre. Default 0.02. */
  gravity?: number;
}

/** Mulberry32 — small, fast, deterministic PRNG. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded force-directed layout (Fruchterman–Reingold style: pairwise
 * repulsion, spring attraction along edges, mild gravity, cooling). Pure
 * JavaScript with `f64` arithmetic, so the same `seed`, nodes and edges give
 * the same positions on every run and platform. Returns node centres.
 */
export function forceLayout(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  options: ForceLayoutOptions = {}
): Map<string, GraphPosition> {
  const {
    seed = 1,
    iterations = 300,
    width = 800,
    height = 600,
    linkDistance = 120,
    charge = 2000,
    gravity = 0.02,
  } = options;
  const n = nodes.length;
  const positions = new Map<string, GraphPosition>();
  if (n === 0) return positions;
  const rand = seededRandom(seed);
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  const index = new Map<string, number>();
  nodes.forEach((node, i) => {
    index.set(node.id, i);
    xs[i] = width / 2 + (rand() - 0.5) * width * 0.5;
    ys[i] = height / 2 + (rand() - 0.5) * height * 0.5;
  });
  const links: Array<[number, number]> = [];
  for (const e of edges) {
    const a = index.get(e.source);
    const b = index.get(e.target);
    if (a !== undefined && b !== undefined && a !== b) links.push([a, b]);
  }
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  const cx = width / 2;
  const cy = height / 2;
  let temperature = Math.max(width, height) / 10;
  const cool = temperature / Math.max(1, iterations);
  for (let step = 0; step < iterations; step++) {
    fx.fill(0);
    fy.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = xs[i]! - xs[j]!;
        let dy = ys[i]! - ys[j]!;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          // Coincident nodes: nudge deterministically.
          dx = 0.1 * ((i + 1) % 3 - 1 || 1);
          dy = 0.1 * ((j + 1) % 3 - 1 || 1);
          d2 = dx * dx + dy * dy;
        }
        const f = charge / d2;
        const d = Math.sqrt(d2);
        fx[i]! += (dx / d) * f;
        fy[i]! += (dy / d) * f;
        fx[j]! -= (dx / d) * f;
        fy[j]! -= (dy / d) * f;
      }
    }
    for (const [a, b] of links) {
      const dx = xs[b]! - xs[a]!;
      const dy = ys[b]! - ys[a]!;
      const d = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
      const f = (d - linkDistance) * 0.05;
      fx[a]! += (dx / d) * f;
      fy[a]! += (dy / d) * f;
      fx[b]! -= (dx / d) * f;
      fy[b]! -= (dy / d) * f;
    }
    for (let i = 0; i < n; i++) {
      fx[i]! += (cx - xs[i]!) * gravity;
      fy[i]! += (cy - ys[i]!) * gravity;
      const mag = Math.sqrt(fx[i]! * fx[i]! + fy[i]! * fy[i]!);
      const scale = mag > temperature ? temperature / mag : 1;
      xs[i]! += fx[i]! * scale;
      ys[i]! += fy[i]! * scale;
    }
    temperature = Math.max(0.5, temperature - cool);
  }
  nodes.forEach((node, i) => {
    positions.set(node.id, { x: Math.round(xs[i]! * 100) / 100, y: Math.round(ys[i]! * 100) / 100 });
  });
  return positions;
}
