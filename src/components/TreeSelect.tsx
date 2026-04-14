// Phase 7.3 — TreeSelect
//
// Hierarchical select: nodes can have children; toggling a parent expands/
// collapses. Single-select variant here; range selection is intentionally
// left out — use MultiSelect for flat multi.
//
// Follows WAI-ARIA treeview pattern:
//   ul[role="tree"] > li[role="treeitem"] (aria-expanded for parents)

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useClickOutside, useId, useMergedRefs } from "../hooks";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface TreeNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface TreeSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  nodes: TreeNode[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  /** Initially-expanded node values. */
  defaultExpanded?: string[];
  /** If true, clicking a parent selects it; otherwise only expands. */
  selectableBranches?: boolean;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}

function flatten(nodes: TreeNode[], expanded: Set<string>, depth = 0): Array<{ node: TreeNode; depth: number }> {
  const out: Array<{ node: TreeNode; depth: number }> = [];
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (n.children && expanded.has(n.value)) {
      out.push(...flatten(n.children, expanded, depth + 1));
    }
  }
  return out;
}

function findLabel(nodes: TreeNode[], value: string): string | null {
  for (const n of nodes) {
    if (n.value === value) return n.label;
    if (n.children) {
      const hit = findLabel(n.children, value);
      if (hit) return hit;
    }
  }
  return null;
}

export const TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>(
  function TreeSelect(
    {
      nodes,
      value,
      defaultValue,
      onChange,
      label,
      placeholder = "Select…",
      defaultExpanded = [],
      selectableBranches = true,
      disabled,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string | null>({
      value,
      defaultValue: defaultValue ?? null,
      onChange,
      componentName: "TreeSelect",
    });

    const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));
    const [open, setOpen] = useState(false);
    const [focusIndex, setFocusIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const clickOutsideRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
    const mergedRef = useMergedRefs(ref, containerRef, clickOutsideRef);
    const triggerId = useId(id);
    const treeId = useId();

    const flat = useMemo(() => flatten(nodes, expanded), [nodes, expanded]);

    const selectedLabel = current ? findLabel(nodes, current) : null;

    const toggleExpand = useCallback((val: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(val)) next.delete(val);
        else next.add(val);
        return next;
      });
    }, []);

    const selectNode = useCallback(
      (node: TreeNode) => {
        if (node.disabled) return;
        const isBranch = !!node.children?.length;
        if (isBranch && !selectableBranches) {
          toggleExpand(node.value);
          return;
        }
        setCurrent(node.value);
        setOpen(false);
      },
      [selectableBranches, setCurrent, toggleExpand]
    );

    const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!open) return;
      const item = flat[focusIndex];
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((i) => Math.min(flat.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" && item) {
        e.preventDefault();
        if (item.node.children?.length && !expanded.has(item.node.value)) {
          toggleExpand(item.node.value);
        }
      } else if (e.key === "ArrowLeft" && item) {
        e.preventDefault();
        if (item.node.children?.length && expanded.has(item.node.value)) {
          toggleExpand(item.node.value);
        }
      } else if ((e.key === "Enter" || e.key === " ") && item) {
        e.preventDefault();
        selectNode(item.node);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    return (
      <div
        ref={mergedRef}
        className={cx("vf-tree-select", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={triggerId}>
            {label}
          </Label>
        )}
        <button
          id={triggerId}
          type="button"
          className="vf-input vf-tree-select__trigger"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="tree"
          aria-expanded={open}
          aria-controls={treeId}
          aria-label={label ?? "Select"}
        >
          {selectedLabel ?? placeholder}
        </button>
        {open && (
          <div
            className="vf-tree-select__popover"
            onKeyDown={handleKey}
            tabIndex={-1}
          >
            <ul
              id={treeId}
              role="tree"
              aria-label={label ?? "Options"}
              className="vf-tree-select__tree"
            >
              {flat.map(({ node, depth }, idx) => {
                const hasChildren = !!node.children?.length;
                const isExpanded = expanded.has(node.value);
                const isSelected = node.value === current;
                const isFocused = idx === focusIndex;
                return (
                  <li
                    key={node.value}
                    role="treeitem"
                    aria-level={depth + 1}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-selected={isSelected}
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
                      "vf-tree-select__node",
                      isSelected && "vf-tree-select__node--selected",
                      node.disabled && "vf-tree-select__node--disabled"
                    )}
                    style={{ paddingInlineStart: `${8 + depth * 16}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusIndex(idx);
                      selectNode(node);
                    }}
                  >
                    {hasChildren && (
                      <button
                        type="button"
                        className="vf-tree-select__disclosure"
                        aria-label={
                          isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(node.value);
                        }}
                      >
                        {isExpanded ? "▾" : "▸"}
                      </button>
                    )}
                    <span className="vf-tree-select__label">{node.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
TreeSelect.displayName = "TreeSelect";

export type { TreeNode as TreeSelectNode };
