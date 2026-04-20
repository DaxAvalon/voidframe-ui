"use client";

import {
  forwardRef,
  memo,
  useState,
  type HTMLAttributes,
  type CSSProperties,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

// ── Types ───────────────────────────────────────────────────────

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TransferItem[];
  /** Controlled: selected keys (items in the right panel). */
  value?: string[];
  /** Uncontrolled initial selected keys. */
  defaultValue?: string[];
  onValueChange?: (selectedKeys: string[]) => void;
  /** Panel titles — `[left, right]`. */
  titles?: [string, string];
  /** Show search inputs inside each panel. */
  searchable?: boolean;
  /** Disable the entire component. */
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

// ── Component ───────────────────────────────────────────────────

const TransferImpl = forwardRef<HTMLDivElement, TransferProps>(
  function Transfer(
    {
      items,
      value,
      defaultValue,
      onValueChange,
      titles = ["Available", "Selected"],
      searchable = false,
      disabled = false,
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const [selectedKeys, setSelectedKeys] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
      componentName: "Transfer",
    });

    // Internal check state — tracks which items are ticked in each panel
    const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
    const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

    // Search state
    const [leftSearch, setLeftSearch] = useState("");
    const [rightSearch, setRightSearch] = useState("");

    const selectedSet = new Set(selectedKeys);

    const availableItems = items.filter((it) => !selectedSet.has(it.key));
    const selectedItems = items.filter((it) => selectedSet.has(it.key));

    const filteredAvailable = availableItems.filter((it) =>
      it.label.toLowerCase().includes(leftSearch.toLowerCase())
    );
    const filteredSelected = selectedItems.filter((it) =>
      it.label.toLowerCase().includes(rightSearch.toLowerCase())
    );

    // ── Handlers ──────────────────────────────────────────────

    const toggleCheck = (
      key: string,
      checked: Set<string>,
      setChecked: React.Dispatch<React.SetStateAction<Set<string>>>
    ) => {
      const next = new Set(checked);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setChecked(next);
    };

    const moveRight = () => {
      const movable = Array.from(leftChecked).filter((k) => {
        const item = items.find((it) => it.key === k);
        return item && !item.disabled;
      });
      if (movable.length === 0) return;
      setSelectedKeys([...selectedKeys, ...movable]);
      setLeftChecked(new Set());
    };

    const moveAllRight = () => {
      const movable = availableItems
        .filter((it) => !it.disabled)
        .map((it) => it.key);
      if (movable.length === 0) return;
      setSelectedKeys([...selectedKeys, ...movable]);
      setLeftChecked(new Set());
    };

    const moveLeft = () => {
      const movable = Array.from(rightChecked).filter((k) => {
        const item = items.find((it) => it.key === k);
        return item && !item.disabled;
      });
      if (movable.length === 0) return;
      setSelectedKeys(selectedKeys.filter((k) => !movable.includes(k)));
      setRightChecked(new Set());
    };

    const moveAllLeft = () => {
      const movable = selectedItems
        .filter((it) => !it.disabled)
        .map((it) => it.key);
      if (movable.length === 0) return;
      setSelectedKeys(selectedKeys.filter((k) => !movable.includes(k)));
      setRightChecked(new Set());
    };

    const moveItemRight = (key: string) => {
      const item = items.find((it) => it.key === key);
      if (!item || item.disabled || disabled) return;
      setSelectedKeys([...selectedKeys, key]);
      setLeftChecked((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    const moveItemLeft = (key: string) => {
      const item = items.find((it) => it.key === key);
      if (!item || item.disabled || disabled) return;
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
      setRightChecked((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    // ── Render helpers ────────────────────────────────────────

    const renderPanel = (
      title: string,
      panelItems: TransferItem[],
      filteredItems: TransferItem[],
      checked: Set<string>,
      setChecked: React.Dispatch<React.SetStateAction<Set<string>>>,
      search: string,
      setSearch: React.Dispatch<React.SetStateAction<string>>,
      onDoubleClick: (key: string) => void
    ) => (
      <div className="vf-transfer__panel">
        <div className="vf-transfer__panel-header">
          {title} ({panelItems.length})
        </div>
        {searchable && (
          <input
            type="text"
            className="vf-transfer__search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            aria-label={`Search ${title}`}
          />
        )}
        <div className="vf-transfer__list" role="listbox" aria-label={title}>
          {filteredItems.length === 0 ? (
            <div className="vf-transfer__empty">No items</div>
          ) : (
            filteredItems.map((item) => {
              const isChecked = checked.has(item.key);
              const isDisabled = disabled || !!item.disabled;
              return (
                <div
                  key={item.key}
                  role="option"
                  aria-selected={isChecked}
                  aria-disabled={isDisabled}
                  className={cx(
                    "vf-transfer__item",
                    isChecked && "vf-transfer__item--selected",
                    isDisabled && "vf-transfer__item--disabled"
                  )}
                  onClick={() => {
                    if (!isDisabled) toggleCheck(item.key, checked, setChecked);
                  }}
                  onDoubleClick={() => {
                    if (!isDisabled) onDoubleClick(item.key);
                  }}
                >
                  <span
                    className={cx(
                      "vf-transfer__checkbox",
                      isChecked && "vf-transfer__checkbox--checked"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cx(
          "vf-transfer",
          `vf-transfer--${size}`,
          disabled && "vf-transfer--disabled",
          className
        )}
        style={style}
        {...props}
      >
        {renderPanel(
          titles[0],
          availableItems,
          filteredAvailable,
          leftChecked,
          setLeftChecked,
          leftSearch,
          setLeftSearch,
          moveItemRight
        )}

        <div className="vf-transfer__actions">
          <button
            type="button"
            className="vf-transfer__action-btn"
            onClick={moveRight}
            disabled={disabled || leftChecked.size === 0}
            aria-label="Move selected right"
          >
            &gt;
          </button>
          <button
            type="button"
            className="vf-transfer__action-btn"
            onClick={moveAllRight}
            disabled={disabled || availableItems.filter((i) => !i.disabled).length === 0}
            aria-label="Move all right"
          >
            &gt;&gt;
          </button>
          <button
            type="button"
            className="vf-transfer__action-btn"
            onClick={moveLeft}
            disabled={disabled || rightChecked.size === 0}
            aria-label="Move selected left"
          >
            &lt;
          </button>
          <button
            type="button"
            className="vf-transfer__action-btn"
            onClick={moveAllLeft}
            disabled={disabled || selectedItems.filter((i) => !i.disabled).length === 0}
            aria-label="Move all left"
          >
            &lt;&lt;
          </button>
        </div>

        {renderPanel(
          titles[1],
          selectedItems,
          filteredSelected,
          rightChecked,
          setRightChecked,
          rightSearch,
          setRightSearch,
          moveItemLeft
        )}
      </div>
    );
  }
);
TransferImpl.displayName = "Transfer";

/**
 * Two-list transfer component. Users move items between `source` and
 * `target` with keyboard / button controls.
 */
export const Transfer = memo(TransferImpl);
