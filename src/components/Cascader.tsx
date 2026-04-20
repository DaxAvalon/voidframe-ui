"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (path: string[], options: CascaderOption[]) => void;
  placeholder?: string;
  expandTrigger?: "click" | "hover";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  allowClear?: boolean;
}

function findOptionsByPath(
  options: CascaderOption[],
  path: string[]
): CascaderOption[] {
  const result: CascaderOption[] = [];
  let current = options;
  for (const val of path) {
    const found = current.find((o) => o.value === val);
    if (!found) break;
    result.push(found);
    current = found.children ?? [];
  }
  return result;
}

function getPanels(
  options: CascaderOption[],
  activePath: string[]
): CascaderOption[][] {
  const panels: CascaderOption[][] = [options];
  let current = options;
  for (const val of activePath) {
    const found = current.find((o) => o.value === val);
    if (!found?.children?.length) break;
    panels.push(found.children);
    current = found.children;
  }
  return panels;
}

const CascaderImpl = forwardRef<HTMLDivElement, CascaderProps>(
  function Cascader(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = "Select...",
      expandTrigger = "click",
      size = "md",
      disabled = false,
      label,
      allowClear = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [selected, setSelected] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: (next) => {
        const opts = findOptionsByPath(options, next);
        onValueChange?.(next, opts);
      },
      componentName: "Cascader",
    });

    const [open, setOpen] = useState(false);
    const [activePath, setActivePath] = useState<string[]>([]);
    const [focusedPanel, setFocusedPanel] = useState(0);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const panels = useMemo(
      () => (open ? getPanels(options, activePath) : []),
      [open, options, activePath]
    );

    const displayLabel = useMemo(() => {
      if (selected.length === 0) return "";
      const opts = findOptionsByPath(options, selected);
      return opts.map((o) => o.label).join(" / ");
    }, [selected, options]);

    const toggleOpen = useCallback(() => {
      if (disabled) return;
      setOpen((prev) => {
        if (!prev) {
          setActivePath(selected.slice(0, -1));
          setFocusedPanel(0);
          setFocusedIndex(0);
        }
        return !prev;
      });
    }, [disabled, selected]);

    const handleOptionClick = useCallback(
      (panelIndex: number, option: CascaderOption) => {
        if (option.disabled) return;
        const newPath = activePath.slice(0, panelIndex);
        newPath.push(option.value);

        if (option.children?.length) {
          setActivePath(newPath);
          setFocusedPanel(panelIndex + 1);
          setFocusedIndex(0);
        } else {
          setSelected(newPath);
          setOpen(false);
        }
      },
      [activePath, setSelected]
    );

    const handleOptionHover = useCallback(
      (panelIndex: number, option: CascaderOption) => {
        if (expandTrigger !== "hover" || option.disabled) return;
        if (option.children?.length) {
          const newPath = activePath.slice(0, panelIndex);
          newPath.push(option.value);
          setActivePath(newPath);
        }
      },
      [expandTrigger, activePath]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (!open) {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            toggleOpen();
          }
          return;
        }

        const currentPanel = panels[focusedPanel];
        if (!currentPanel) return;

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            setFocusedIndex((prev) =>
              Math.min(prev + 1, currentPanel.length - 1)
            );
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
            break;
          }
          case "ArrowRight": {
            e.preventDefault();
            const focused = currentPanel[focusedIndex];
            if (focused?.children?.length && !focused.disabled) {
              handleOptionClick(focusedPanel, focused);
            }
            break;
          }
          case "ArrowLeft": {
            e.preventDefault();
            if (focusedPanel > 0) {
              setFocusedPanel((p) => p - 1);
              setFocusedIndex(0);
              setActivePath((prev) => prev.slice(0, -1));
            }
            break;
          }
          case "Enter": {
            e.preventDefault();
            const focused = currentPanel[focusedIndex];
            if (focused) handleOptionClick(focusedPanel, focused);
            break;
          }
          case "Escape": {
            e.preventDefault();
            setOpen(false);
            break;
          }
        }
      },
      [open, panels, focusedPanel, focusedIndex, toggleOpen, handleOptionClick]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelected([]);
        setOpen(false);
      },
      [setSelected]
    );

    // Close on outside click
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
      <div
        ref={ref}
        className={cx("vf-cascader", `vf-cascader--${size}`, className)}
        style={style}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {label && (
          <span className="vf-cascader__label">{label}</span>
        )}
        <div ref={containerRef} className="vf-cascader__container">
          <button
            type="button"
            className="vf-cascader__trigger"
            onClick={toggleOpen}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="vf-cascader__display">
              {displayLabel || placeholder}
            </span>
            {allowClear && selected.length > 0 && !disabled && (
              <span
                className="vf-cascader__clear"
                role="button"
                aria-label="Clear selection"
                onClick={handleClear}
              >
                &times;
              </span>
            )}
          </button>
          {open && (
            <div className="vf-cascader__dropdown" role="listbox">
              {panels.map((panel, panelIndex) => (
                <div
                  key={panelIndex}
                  className="vf-cascader__panel"
                  role="group"
                >
                  {panel.map((option, optIndex) => {
                    const isActive = activePath[panelIndex] === option.value;
                    const isFocused =
                      focusedPanel === panelIndex &&
                      focusedIndex === optIndex;
                    return (
                      <div
                        key={option.value}
                        className={cx(
                          "vf-cascader__option",
                          isActive && "vf-cascader__option--active",
                          option.disabled && "vf-cascader__option--disabled",
                          isFocused && "vf-cascader__option--focused"
                        )}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={option.disabled}
                        onClick={() =>
                          handleOptionClick(panelIndex, option)
                        }
                        onMouseEnter={() =>
                          handleOptionHover(panelIndex, option)
                        }
                      >
                        <span>{option.label}</span>
                        {option.children?.length ? (
                          <span
                            className="vf-cascader__option-arrow"
                            aria-hidden="true"
                          >
                            &#x203A;
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
CascaderImpl.displayName = "Cascader";
/**
 * Hierarchical select. Each column filters the next based on the user's
 * pick; emits the full path on commit.
 */
export const Cascader = memo(CascaderImpl);
(Cascader as unknown as { displayName: string }).displayName = "Cascader";
