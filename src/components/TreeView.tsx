"use client";

// Phase 9 — TreeView
//
// Hierarchical tree with optional multi-select, checkable items, lazy
// children loading, and full keyboard navigation (ArrowKeys / Home / End /
// Enter / Space / Type-to-search).

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { itemKeyAttrs } from "../hooks/useItemKey";
import { cx } from "../utils/cx";

export interface TreeNode {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Semantic tone emitted as `data-tone` + BEM class on the rendered node. */
  tone?: "neutral" | "danger" | "warning" | "success";
  children?: TreeNode[];
  /** Hint to the view that children should be loaded via `loadChildren`. */
  hasChildren?: boolean;
  [key: string]: unknown;
}

export interface TreeViewRenderState {
  expanded: boolean;
  selected: boolean;
  checked?: boolean;
  depth: number;
}

export interface TreeViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: TreeNode[];
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (next: string[]) => void;
  selected?: string | string[] | null;
  onSelectionChange?: (next: string | string[] | null) => void;
  multiSelect?: boolean;
  checkable?: boolean;
  checked?: string[];
  onCheckedChange?: (next: string[]) => void;
  renderItem?: (item: TreeNode, state: TreeViewRenderState) => ReactNode;
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /**
   * Return arbitrary HTML attributes for each rendered tree node. Mirrors
   * `Table.rowAttributes` — tests can attach `data-testid` per node without
   * injecting marker spans inside `renderItem`.
   */
  itemAttributes?: (node: TreeNode, depth: number) => HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
}

function flatten(
  items: TreeNode[],
  expanded: Set<string>,
  depth = 0
): Array<{ node: TreeNode; depth: number }> {
  const out: Array<{ node: TreeNode; depth: number }> = [];
  for (const node of items) {
    out.push({ node, depth });
    if (node.children && expanded.has(node.id)) {
      out.push(...flatten(node.children, expanded, depth + 1));
    }
  }
  return out;
}

/**
 * A hierarchical tree for displaying and navigating nested data structures.
 * Supports expand/collapse, keyboard traversal, and optional selection.
 */
const TreeViewImpl = forwardRef<HTMLDivElement, TreeViewProps>(function TreeView(
  {
    items,
    defaultExpanded = [],
    expanded: expandedProp,
    onExpandedChange,
    selected: selectedProp,
    onSelectionChange,
    multiSelect,
    checkable,
    checked: checkedProp,
    onCheckedChange,
    renderItem,
    loadChildren,
    itemAttributes,
    className,
    style,
    ...props
  },
  ref
) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded)
  );
  const expanded = useMemo(
    () => new Set(expandedProp ?? [...internalExpanded]),
    [expandedProp, internalExpanded]
  );
  const setExpanded = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      const next = updater(expanded);
      if (expandedProp === undefined) setInternalExpanded(next);
      onExpandedChange?.([...next]);
    },
    [expanded, expandedProp, onExpandedChange]
  );

  const [internalSelected, setInternalSelected] = useState<string | string[] | null>(
    multiSelect ? [] : null
  );
  const selected = selectedProp !== undefined ? selectedProp : internalSelected;

  const [internalChecked, setInternalChecked] = useState<string[]>([]);
  const checked = checkedProp ?? internalChecked;

  const [liveChildren, setLiveChildren] = useState<Record<string, TreeNode[]>>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const resolveChildren = useCallback(
    (node: TreeNode): TreeNode[] | undefined => {
      if (node.children) return node.children;
      return liveChildren[node.id];
    },
    [liveChildren]
  );

  const toggleExpand = useCallback(
    async (node: TreeNode) => {
      const id = node.id;
      const isOpen = expanded.has(id);
      if (!isOpen && loadChildren && !node.children && !liveChildren[id]) {
        if (loadingRef.current.has(id)) return;
        loadingRef.current.add(id);
        try {
          const kids = await loadChildren(node);
          setLiveChildren((prev) => ({ ...prev, [id]: kids }));
        } finally {
          loadingRef.current.delete(id);
        }
      }
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [expanded, loadChildren, liveChildren, setExpanded]
  );

  const select = useCallback(
    (id: string) => {
      if (multiSelect) {
        const arr = Array.isArray(selected) ? selected : [];
        const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
        if (selectedProp === undefined) setInternalSelected(next);
        onSelectionChange?.(next);
      } else {
        if (selectedProp === undefined) setInternalSelected(id);
        onSelectionChange?.(id);
      }
    },
    [multiSelect, selected, selectedProp, onSelectionChange]
  );

  const toggleChecked = useCallback(
    (id: string) => {
      const next = checked.includes(id)
        ? checked.filter((x) => x !== id)
        : [...checked, id];
      if (checkedProp === undefined) setInternalChecked(next);
      onCheckedChange?.(next);
    },
    [checked, checkedProp, onCheckedChange]
  );

  // Rebuild flat when tree changes.
  const flat = useMemo(() => {
    // Merge in resolved children for items missing explicit ones.
    const merge = (rows: TreeNode[]): TreeNode[] =>
      rows.map((n) => ({
        ...n,
        children: n.children ?? liveChildren[n.id] ?? undefined,
      }));
    return flatten(merge(items).map((n) => ({
      ...n,
      children: n.children ? merge(n.children) : undefined,
    })), expanded);
  }, [items, expanded, liveChildren]);

  const [focusId, setFocusId] = useState<string | null>(() => flat[0]?.node.id ?? null);
  useEffect(() => {
    if (!focusId && flat[0]) setFocusId(flat[0].node.id);
  }, [flat, focusId]);

  // Type-to-search: accumulate keystrokes for 700 ms and jump focus to the
  // first item whose label (lowercase) starts with the buffered prefix.
  const searchBuffer = useRef<string>("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = flat.findIndex((f) => f.node.id === focusId);
    if (idx < 0) return;
    const current = flat[idx]!;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = flat[Math.min(flat.length - 1, idx + 1)];
      if (next) setFocusId(next.node.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = flat[Math.max(0, idx - 1)];
      if (prev) setFocusId(prev.node.id);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const kids = resolveChildren(current.node);
      const hasKids = !!kids?.length || current.node.hasChildren;
      if (hasKids) {
        if (!expanded.has(current.node.id)) {
          void toggleExpand(current.node);
        } else {
          const next = flat[idx + 1];
          if (next && next.depth > current.depth) setFocusId(next.node.id);
        }
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (expanded.has(current.node.id)) {
        void toggleExpand(current.node);
      } else if (current.depth > 0) {
        // Move focus to parent by scanning backwards for a lower depth.
        for (let j = idx - 1; j >= 0; j--) {
          if (flat[j]!.depth < current.depth) {
            setFocusId(flat[j]!.node.id);
            break;
          }
        }
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusId(flat[0]?.node.id ?? null);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusId(flat[flat.length - 1]?.node.id ?? null);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!current.node.disabled) select(current.node.id);
    } else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      /\S/.test(e.key)
    ) {
      // Type-to-search.
      searchBuffer.current += e.key.toLowerCase();
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        searchBuffer.current = "";
      }, 700);
      const needle = searchBuffer.current;
      const startFrom = idx + 1;
      const findMatch = (from: number, to: number): string | null => {
        for (let i = from; i < to; i++) {
          const label = flat[i]!.node.label;
          const text = typeof label === "string" ? label.toLowerCase() : "";
          if (text.startsWith(needle)) return flat[i]!.node.id;
        }
        return null;
      };
      const match =
        findMatch(startFrom, flat.length) ?? findMatch(0, startFrom);
      if (match) setFocusId(match);
    }
  };

  const renderRow = (node: TreeNode, depth: number): ReactNode => {
    const kids = resolveChildren(node);
    const hasKids = !!kids?.length || node.hasChildren;
    const isExpanded = expanded.has(node.id);
    const isSelected = Array.isArray(selected)
      ? selected.includes(node.id)
      : selected === node.id;
    const isChecked = checked.includes(node.id);
    const isFocused = focusId === node.id;
    const state: TreeViewRenderState = {
      expanded: isExpanded,
      selected: isSelected,
      checked: checkable ? isChecked : undefined,
      depth,
    };
    return (
      <div
        key={node.id}
        role="treeitem"
        aria-expanded={hasKids ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={depth + 1}
        aria-disabled={node.disabled || undefined}
        tabIndex={isFocused ? 0 : -1}
        ref={(el) => {
          if (isFocused && el && document.activeElement !== el) {
            if (el.parentElement?.contains(document.activeElement)) {
              el.focus({ preventScroll: true });
            }
          }
        }}
        className={cx(
          "vf-treeview__item",
          isSelected && "vf-treeview__item--selected",
          node.disabled && "vf-treeview__item--disabled",
          node.tone && `vf-treeview__item--${node.tone}`
        )}
        data-tone={node.tone}
        {...itemKeyAttrs("node", String(node.id))}
        style={{ paddingInlineStart: `${8 + depth * 16}px` }}
        {...(itemAttributes?.(node, depth) ?? {})}
        onClick={() => {
          setFocusId(node.id);
          if (!node.disabled) select(node.id);
        }}
      >
        {hasKids ? (
          <button
            type="button"
            className="vf-treeview__disclosure"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              void toggleExpand(node);
            }}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="vf-treeview__spacer" aria-hidden="true" />
        )}
        {checkable && (
          <input
            type="checkbox"
            checked={isChecked}
            aria-label={`Check ${typeof node.label === "string" ? node.label : node.id}`}
            onChange={(e) => {
              e.stopPropagation();
              toggleChecked(node.id);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {node.icon && <span className="vf-treeview__icon">{node.icon}</span>}
        <span className="vf-treeview__label">
          {renderItem ? renderItem(node, state) : node.label}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      role="tree"
      aria-multiselectable={multiSelect || undefined}
      className={cx("vf-treeview", className)}
      style={style}
      onKeyDown={handleKey}
      {...props}
    >
      {flat.map(({ node, depth }) => renderRow(node, depth))}
    </div>
  );
});
TreeViewImpl.displayName = "TreeView";

/**
 * Tree view. Memoized at the export site so parent re-renders with
 * referentially-stable `nodes` / `expanded` skip the recursive walk.
 */
export const TreeView = memo(TreeViewImpl);
(TreeView as unknown as { displayName: string }).displayName = "TreeView";
