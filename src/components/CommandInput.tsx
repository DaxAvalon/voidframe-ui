"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface CommandInputSuggestion {
  value: string;
  label?: string;
  description?: string;
}

export interface CommandInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit: (command: string) => void;
  history?: string[];
  maxHistory?: number;
  suggestions?:
    | CommandInputSuggestion[]
    | ((partial: string) => CommandInputSuggestion[]);
  placeholder?: string;
  prompt?: string | ReactNode;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  style?: CSSProperties;
}

const CommandInputImpl = forwardRef<HTMLDivElement, CommandInputProps>(
  function CommandInput(
    {
      value,
      defaultValue = "",
      onValueChange,
      onSubmit,
      history: controlledHistory,
      maxHistory = 100,
      suggestions,
      placeholder,
      prompt = "$",
      disabled,
      size = "md",
      autoFocus,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
      componentName: "CommandInput",
    });

    const [internalHistory, setInternalHistory] = useState<string[]>([]);
    const history = controlledHistory ?? internalHistory;
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [savedDraft, setSavedDraft] = useState("");

    const [completionsOpen, setCompletionsOpen] = useState(false);
    const [activeCompletion, setActiveCompletion] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    const resolvedSuggestions = useCallback(
      (partial: string): CommandInputSuggestion[] => {
        if (!suggestions) return [];
        if (typeof suggestions === "function") return suggestions(partial);
        if (!partial) return [];
        return suggestions.filter((s) =>
          s.value.toLowerCase().startsWith(partial.toLowerCase())
        );
      },
      [suggestions]
    );

    const currentSuggestions = resolvedSuggestions(current);

    // Ghost text: show first suggestion's remaining text inline
    const ghostText =
      currentSuggestions.length > 0 && current.length > 0
        ? currentSuggestions[0]!.value.slice(current.length)
        : "";

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (completionsOpen && currentSuggestions.length > 0) {
          e.preventDefault();
          const selected = currentSuggestions[activeCompletion];
          if (selected) {
            setCurrent(selected.value);
            setCompletionsOpen(false);
            setActiveCompletion(0);
          }
          return;
        }
        e.preventDefault();
        if (!current.trim()) return;
        onSubmit(current);
        if (!controlledHistory) {
          setInternalHistory((prev) => {
            const next = [current, ...prev];
            return next.slice(0, maxHistory);
          });
        }
        setCurrent("");
        setHistoryIndex(-1);
        setSavedDraft("");
        setCompletionsOpen(false);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (completionsOpen) {
          setActiveCompletion((prev) =>
            prev > 0 ? prev - 1 : currentSuggestions.length - 1
          );
          return;
        }
        if (history.length === 0) return;
        if (historyIndex === -1) {
          setSavedDraft(current);
        }
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        setCurrent(history[nextIdx] ?? "");
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (completionsOpen) {
          setActiveCompletion((prev) =>
            prev < currentSuggestions.length - 1 ? prev + 1 : 0
          );
          return;
        }
        if (historyIndex <= 0) {
          setHistoryIndex(-1);
          setCurrent(savedDraft);
          return;
        }
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCurrent(history[nextIdx] ?? "");
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const matches = resolvedSuggestions(current);
        if (matches.length === 1) {
          setCurrent(matches[0]!.value);
          setCompletionsOpen(false);
        } else if (matches.length > 1) {
          setCompletionsOpen(true);
          setActiveCompletion(0);
        }
        return;
      }

      if (e.key === "Escape") {
        setCompletionsOpen(false);
        setActiveCompletion(0);
      }
    };

    const handleChange = (val: string) => {
      setCurrent(val);
      setHistoryIndex(-1);
      setCompletionsOpen(false);
      setActiveCompletion(0);
    };

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    return (
      <div
        ref={ref}
        className={cx(
          "vf-command-input",
          `vf-command-input--${size}`,
          disabled && "vf-command-input--disabled",
          className
        )}
        style={style}
        {...props}
      >
        <span className="vf-command-input__prompt" aria-hidden="true">
          {prompt}
        </span>
        <div className="vf-command-input__input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="vf-command-input__input"
            value={current}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            role={completionsOpen ? "combobox" : undefined}
            aria-expanded={completionsOpen ? true : undefined}
            aria-autocomplete={completionsOpen ? "list" : undefined}
            aria-label="Command input"
          />
          {ghostText && (
            <span className="vf-command-input__suggestion" aria-hidden="true">
              {current}
              <span className="vf-command-input__suggestion-ghost">
                {ghostText}
              </span>
            </span>
          )}
        </div>
        {completionsOpen && currentSuggestions.length > 0 && (
          <ul className="vf-command-input__completions" role="listbox">
            {currentSuggestions.map((s, i) => (
              <li
                key={s.value}
                className={cx(
                  "vf-command-input__completion-item",
                  i === activeCompletion &&
                    "vf-command-input__completion-item--active"
                )}
                role="option"
                aria-selected={i === activeCompletion}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCurrent(s.value);
                  setCompletionsOpen(false);
                }}
              >
                <span>{s.label ?? s.value}</span>
                {s.description && (
                  <span className="vf-command-input__completion-desc">
                    {s.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
CommandInputImpl.displayName = "CommandInput";
export const CommandInput = memo(CommandInputImpl);
(CommandInput as unknown as { displayName: string }).displayName =
  "CommandInput";
