// createNavModel — derive sidebar items, breadcrumbs and the active match
// from one navigation tree, so an app declares its routes once and the
// Sidebar, the Breadcrumbs and "which item is current" agree.

import type { ReactNode } from "react";

export interface NavNode<Ctx = unknown> {
  /** Stable id; defaults to `href` or the label when it is a string. */
  id?: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  children?: NavNode<Ctx>[];
  /**
   * Show this node (and its subtree). A predicate receives the context
   * passed to `createNavModel` (roles, feature flags). Default visible.
   */
  visible?: boolean | ((ctx: Ctx) => boolean);
  /**
   * How `href` matches the current path. `"prefix"` (default) matches the
   * path and anything under it; `"exact"` matches the path only.
   */
  match?: "exact" | "prefix";
  /** Anything else the app wants to carry (badge counts, keyboard shortcuts). */
  meta?: Record<string, unknown>;
}

export interface NavModelItem<Ctx = unknown> {
  id: string;
  node: NavNode<Ctx>;
  depth: number;
  /** The item whose `href` is the deepest match for the current path. */
  active: boolean;
  /** An ancestor of the active item. */
  ancestorOfActive: boolean;
  parentId: string | null;
}

export interface NavModel<Ctx = unknown> {
  /** Visible nodes in depth-first order with their depth and active flags. */
  items: NavModelItem<Ctx>[];
  /** Root → active item (visible nodes only). Empty when nothing matches. */
  breadcrumbs: NavModelItem<Ctx>[];
  /** The active item, or `null` when the path matches nothing visible. */
  match: NavModelItem<Ctx> | null;
  /**
   * Set when the current path's own item is hidden (by a predicate) or the
   * route matches nothing: where to send the user. The nearest visible
   * ancestor with an `href` when the hidden item has one (its prefix match
   * is also reported as `match`), else the first visible item with an
   * `href`, else `null`. `null` while the current item is visible.
   */
  fallback: NavModelItem<Ctx> | null;
}

export interface CreateNavModelOptions<Ctx> {
  /** Passed to every `visible` predicate. */
  ctx?: Ctx;
}

function nodeId<Ctx>(node: NavNode<Ctx>, index: number, parent: string | null): string {
  if (node.id) return node.id;
  if (node.href) return node.href;
  if (typeof node.label === "string") return `${parent ?? ""}/${node.label}`;
  return `${parent ?? ""}#${index}`;
}

function isVisible<Ctx>(node: NavNode<Ctx>, ctx: Ctx): boolean {
  const v = node.visible;
  if (v === undefined) return true;
  return typeof v === "function" ? v(ctx) : v;
}

function hrefMatches(href: string, path: string, mode: "exact" | "prefix"): boolean {
  if (href === path) return true;
  if (mode === "exact") return false;
  if (href === "/") return false;
  return path.startsWith(href.endsWith("/") ? href : `${href}/`);
}

export function createNavModel<Ctx = unknown>(
  tree: NavNode<Ctx>[],
  currentPath: string,
  options: CreateNavModelOptions<Ctx> = {}
): NavModel<Ctx> {
  const ctx = options.ctx as Ctx;
  type Flat = NavModelItem<Ctx> & { hidden: boolean; score: number };
  const flat: Flat[] = [];
  const byId = new Map<string, Flat>();

  const walk = (nodes: NavNode<Ctx>[], depth: number, parentId: string | null, parentHidden: boolean) => {
    nodes.forEach((node, i) => {
      const id = nodeId(node, i, parentId);
      const hidden = parentHidden || !isVisible(node, ctx);
      const matches = node.href ? hrefMatches(node.href, currentPath, node.match ?? "prefix") : false;
      const item: Flat = {
        id,
        node,
        depth,
        active: false,
        ancestorOfActive: false,
        parentId,
        hidden,
        // Deeper and longer hrefs win: /a/b over /a.
        score: matches ? (node.href?.length ?? 0) * 1000 + depth : -1,
      };
      flat.push(item);
      byId.set(id, item);
      if (node.children) walk(node.children, depth + 1, id, hidden);
    });
  };
  walk(tree, 0, null, false);

  // Best match overall (hidden or not), then the best visible one.
  let best: Flat | null = null;
  let bestVisible: Flat | null = null;
  for (const f of flat) {
    if (f.score < 0) continue;
    if (!best || f.score > best.score) best = f;
    if (!f.hidden && (!bestVisible || f.score > bestVisible.score)) bestVisible = f;
  }
  const match = bestVisible;
  if (match) {
    match.active = true;
    let p = match.parentId;
    while (p) {
      const anc = byId.get(p);
      if (!anc) break;
      anc.ancestorOfActive = true;
      p = anc.parentId;
    }
  }

  const strip = ({ hidden: _h, score: _s, ...rest }: Flat): NavModelItem<Ctx> => rest;
  const items = flat.filter((f) => !f.hidden).map(strip);

  const breadcrumbs: NavModelItem<Ctx>[] = [];
  if (match) {
    let cur: Flat | undefined = match;
    while (cur) {
      breadcrumbs.unshift(strip(cur));
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
  }

  let fallback: NavModelItem<Ctx> | null = null;
  if (!match || (best && best.hidden)) {
    if (best) {
      // The route exists but is hidden: climb to the nearest visible ancestor.
      let p = best.parentId;
      while (p) {
        const anc = byId.get(p);
        if (!anc) break;
        if (!anc.hidden && anc.node.href) {
          fallback = strip(anc);
          break;
        }
        p = anc.parentId;
      }
    }
    if (!fallback) {
      const first = flat.find((f) => !f.hidden && f.node.href);
      fallback = first ? strip(first) : null;
    }
  }

  return { items, breadcrumbs, match: match ? strip(match) : null, fallback };
}
