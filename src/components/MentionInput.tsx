"use client";

// Phase 7.4 — MentionInput + SlashCommandInput
//
// MentionInput: textarea that watches for "@" (or any configured trigger),
// opens a popover list of options filtered by the text after the trigger,
// and inserts a formatted token on select.
//
// SlashCommandInput: same shape but the commands each have an action callback
// executed on selection. Nothing is inserted unless the command opts in.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── shared option type ────────────────────────────────────────

export interface MentionOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

function defaultFilter(query: string, option: MentionOption): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    option.label.toLowerCase().includes(q) ||
    option.value.toLowerCase().includes(q)
  );
}

// Locate the trigger character preceding the caret. Returns the start index
// of the trigger and the query that follows it, or null when the user is not
// in a trigger context.
function findTrigger(
  text: string,
  caret: number,
  triggers: string[]
): { triggerIndex: number; trigger: string; query: string } | null {
  let i = caret - 1;
  while (i >= 0) {
    const ch = text[i]!;
    if (triggers.includes(ch)) {
      // Must be at line start or preceded by whitespace.
      const prev = i === 0 ? " " : text[i - 1]!;
      if (/\s/.test(prev) || i === 0) {
        return { triggerIndex: i, trigger: ch, query: text.slice(i + 1, caret) };
      }
      return null;
    }
    if (/\s/.test(ch)) return null;
    i--;
  }
  return null;
}

// ── MentionInput ──────────────────────────────────────────────

type TextareaPassthrough = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value" | "defaultValue" | "ref"
>;

/** Context passed as the second arg to `onMention`, giving the caller the
 * live textarea state at the moment of selection. Useful for consumers who
 * need to run actions conditioned on the surrounding text (slash commands,
 * positional formatting). */
export interface MentionInputContext {
  /** Full textarea value at the time of selection. */
  text: string;
  /** Index of the trigger character within `text`. */
  triggerIndex: number;
  /** Caret position (textarea `selectionStart`) at the time of selection. */
  caret: number;
}

export interface MentionInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: MentionOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (text: string) => void;
  /** Emits whenever a mention is inserted. */
  onMention?: (option: MentionOption, context: MentionInputContext) => void;
  label?: string;
  /** Trigger character. Default "@". */
  trigger?: string;
  /** Formatter for the inserted token. Default: `@label`. */
  renderMention?: (opt: MentionOption) => string;
  filter?: (query: string, option: MentionOption) => boolean;
  placeholder?: string;
  minHeight?: number | string;
  disabled?: boolean;
  id?: string;
  /** Visual size variant — `"sm" | "md" | "lg"`. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Props forwarded to the outer wrapper `<div>`. */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
  textareaProps?: TextareaPassthrough;
}

/**
 * Text input with `@`-triggered mention autocomplete. Emits structured
 * tokens on change.
 */
export const MentionInput = forwardRef<HTMLDivElement, MentionInputProps>(
  function MentionInput(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      onMention,
      label,
      trigger = "@",
      renderMention = (opt) => `@${opt.label}`,
      filter = defaultFilter,
      placeholder,
      minHeight = 120,
      disabled,
      id,
      size = "md",
      wrapperProps,
      className,
      style,
      textareaProps,
      ...props
    },
    ref
  ) {
    const [text, setText] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange: onValueChange,
      componentName: "MentionInput",
    });

    const [query, setQuery] = useState<string | null>(null);
    const triggerIdxRef = useRef<number | null>(null);
    const dismissedAtRef = useRef<number | null>(null);
    const [highlighted, setHighlighted] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useMergedRefs(ref);
    const textareaId = useId(id);
    const listboxId = useId();

    const open = query !== null;
    const filtered = useMemo(
      () => (query === null ? [] : options.filter((o) => filter(query, o))),
      [query, options, filter]
    );

    useEffect(() => {
      setHighlighted(0);
    }, [query]);

    const updateTriggerState = useCallback(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const caret = ta.selectionStart;
      const hit = findTrigger(ta.value, caret, [trigger]);
      if (hit) {
        // Suppress if the user just dismissed this exact trigger position.
        if (dismissedAtRef.current === hit.triggerIndex) {
          triggerIdxRef.current = null;
          setQuery(null);
          return;
        }
        triggerIdxRef.current = hit.triggerIndex;
        setQuery(hit.query);
      } else {
        triggerIdxRef.current = null;
        dismissedAtRef.current = null;
        setQuery(null);
      }
    }, [trigger]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      // Defer to next microtask so selectionStart reflects post-input caret.
      queueMicrotask(updateTriggerState);
    };

    const insertMention = useCallback(
      (opt: MentionOption) => {
        const ta = textareaRef.current;
        const startIdx = triggerIdxRef.current;
        if (!ta || startIdx === null) return;
        const caret = ta.selectionStart;
        const liveText = ta.value;
        const mentionText = renderMention(opt);
        const before = liveText.slice(0, startIdx);
        const after = liveText.slice(caret);
        // Skip the trailing space when the command opts out of inserting a
        // token (e.g. slash-command mode emits ""): inserting " " would leave
        // an orphan space at the caret.
        const trailing = mentionText === "" ? "" : " ";
        const next = before + mentionText + trailing + after;
        setText(next);
        triggerIdxRef.current = null;
        setQuery(null);
        onMention?.(opt, { text: liveText, triggerIndex: startIdx, caret });
        // Reposition caret just after the inserted mention.
        requestAnimationFrame(() => {
          const pos = before.length + mentionText.length + trailing.length;
          ta.focus();
          ta.selectionStart = ta.selectionEnd = pos;
        });
      },
      [renderMention, setText, onMention]
    );

    const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        if (filtered[highlighted]) {
          e.preventDefault();
          insertMention(filtered[highlighted]!);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        dismissedAtRef.current = triggerIdxRef.current;
        triggerIdxRef.current = null;
        setQuery(null);
      }
    };

    return (
      <div
        ref={containerRef}
        className={cx("vf-mention", `vf-mention--${size}`, className)}
        data-size={size}
        style={style}
        {...wrapperProps}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={textareaId}>
            {label}
          </Label>
        )}
        <div className="vf-mention__frame">
          <textarea
            ref={textareaRef}
            id={textareaId}
            className="vf-input vf-mention__textarea"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKey}
            onKeyUp={updateTriggerState}
            onClick={updateTriggerState}
            placeholder={placeholder}
            disabled={disabled}
            style={{ minHeight }}
            aria-label={label ?? "Message"}
            aria-controls={listboxId}
            aria-expanded={open}
            aria-autocomplete="list"
            {...textareaProps}
          />
          {open && (
            <ul
              id={listboxId}
              role="listbox"
              className="vf-mention__list"
              aria-label={`${trigger} suggestions`}
            >
              {filtered.length === 0 && (
                <li className="vf-combobox__empty" aria-disabled="true">
                  No matches
                </li>
              )}
              {filtered.map((opt, idx) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={idx === highlighted}
                  aria-disabled={opt.disabled || undefined}
                  className={cx(
                    "vf-combobox__option",
                    idx === highlighted && "vf-combobox__option--highlighted",
                    opt.disabled && "vf-combobox__option--disabled"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!opt.disabled) insertMention(opt);
                  }}
                  onMouseEnter={() => setHighlighted(idx)}
                >
                  <span className="vf-mention__label">{opt.label}</span>
                  {opt.description && (
                    <span className="vf-mention__description">{opt.description}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);
MentionInput.displayName = "MentionInput";

// ── SlashCommandInput ─────────────────────────────────────────

export interface SlashCommandOption extends MentionOption {
  /** Called when the command is selected. */
  action?: (state: { text: string; triggerIndex: number; caret: number }) => void;
  /** If true, the command name is inserted into the text. Default: false. */
  insertToken?: boolean;
}

export interface SlashCommandInputProps
  extends Omit<MentionInputProps, "options" | "renderMention" | "onMention"> {
  commands: SlashCommandOption[];
  /** Character that triggers the menu. Default "/". */
  trigger?: string;
  /** Emits when a command has been selected (after its action runs). */
  onCommand?: (cmd: SlashCommandOption) => void;
}

/**
 * Text input with `/`-triggered command autocomplete. Emits the selected
 * command.
 */
export const SlashCommandInput = forwardRef<HTMLDivElement, SlashCommandInputProps>(
  function SlashCommandInput(
    { commands, trigger = "/", onCommand, ...rest },
    ref
  ) {
    return (
      <MentionInput
        ref={ref}
        options={commands}
        trigger={trigger}
        renderMention={(opt) => {
          const c = opt as SlashCommandOption;
          return c.insertToken ? `/${c.value}` : "";
        }}
        onMention={(opt, ctx) => {
          const c = opt as SlashCommandOption;
          c.action?.(ctx);
          onCommand?.(c);
        }}
        {...rest}
      />
    );
  }
);
SlashCommandInput.displayName = "SlashCommandInput";
