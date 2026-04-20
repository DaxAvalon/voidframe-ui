"use client";

// Phase 12 — Composer compound + buttons + suggestions + templates + mentions

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import { safeHref } from "../utils/safeHref";

// ── Context ─────────────────────────────────────────────────

type ComposerStatus = "idle" | "streaming";

interface ComposerContextValue {
  value: string;
  setValue: (next: string) => void;
  submit: () => void;
  stop?: () => void;
  disabled: boolean;
  status: ComposerStatus;
  submitOnEnter: boolean;
  shiftEnterNewline: boolean;
  showCount: boolean;
  maxLength?: number;
  textareaId: string;
  onSlashCommand?: (command: string) => void;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);
function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error("Composer.* must be inside <Composer>");
  return ctx;
}

// ── Composer Root ───────────────────────────────────────────

export interface ComposerProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  onSubmit?: (value: string) => void;
  onStop?: () => void;
  onSlashCommand?: (command: string) => void;
  status?: ComposerStatus;
  disabled?: boolean;
  submitOnEnter?: boolean;
  shiftEnterNewline?: boolean;
  maxLength?: number;
  showCount?: boolean;
  children?: ReactNode;
}

function ComposerRoot(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSubmit,
    onStop,
    onSlashCommand,
    status = "idle",
    disabled = false,
    submitOnEnter = true,
    shiftEnterNewline = true,
    maxLength,
    showCount = false,
    className,
    children,
    ...props
  }: ComposerProps
) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const setValue = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const submit = useCallback(() => {
    if (disabled || status === "streaming") return;
    if (!current.trim()) return;
    onSubmit?.(current);
  }, [current, disabled, status, onSubmit]);

  const baseId = useId();
  const textareaId = `${baseId}-textarea`;

  const ctx = useMemo<ComposerContextValue>(
    () => ({
      value: current,
      setValue,
      submit,
      stop: onStop,
      disabled,
      status,
      submitOnEnter,
      shiftEnterNewline,
      showCount,
      maxLength,
      textareaId,
      onSlashCommand,
    }),
    [
      current,
      setValue,
      submit,
      onStop,
      disabled,
      status,
      submitOnEnter,
      shiftEnterNewline,
      showCount,
      maxLength,
      textareaId,
      onSlashCommand,
    ]
  );

  return (
    <ComposerContext.Provider value={ctx}>
      <form
        className={cx(
          "vf-composer",
          status === "streaming" && "vf-composer--streaming",
          disabled && "vf-composer--disabled",
          className
        )}
        data-status={status}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        {...props}
      >
        {children}
      </form>
    </ComposerContext.Provider>
  );
}

// ── Composer.Toolbar ────────────────────────────────────────

function ComposerToolbar({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="toolbar"
      aria-label="Composer actions"
      className={cx("vf-composer__toolbar", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Composer.Input ──────────────────────────────────────────

export interface ComposerInputProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > {
  autoSize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const ComposerInput = forwardRef<HTMLTextAreaElement, ComposerInputProps>(
  function ComposerInput(
    {
      autoSize = true,
      minRows = 1,
      maxRows = 8,
      className,
      onKeyDown,
      placeholder = "Message…",
      ...props
    },
    ref
  ) {
    const ctx = useComposer();
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const captureRef = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLTextAreaElement | null }).current = node;
    };

    useEffect(() => {
      if (!autoSize) return;
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const line = parseFloat(getComputedStyle(el).lineHeight || "16") || 16;
      const min = line * minRows;
      const max = line * maxRows;
      const next = Math.max(min, Math.min(max, el.scrollHeight));
      el.style.height = `${next}px`;
    }, [ctx.value, autoSize, minRows, maxRows]);

    const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      // Slash-command detection: when user presses Space or Enter after `/word`
      if (
        ctx.onSlashCommand &&
        (e.key === " " || e.key === "Enter") &&
        !e.nativeEvent.isComposing
      ) {
        const el = e.currentTarget;
        const before = el.value.slice(0, el.selectionStart);
        // Find the current line
        const lineStart = before.lastIndexOf("\n") + 1;
        const line = before.slice(lineStart);
        const match = line.match(/^\/(\S+)$/);
        if (match && match[1]) {
          e.preventDefault();
          const cmd = match[1];
          // Remove the slash command from input
          const newValue =
            el.value.slice(0, lineStart) + el.value.slice(el.selectionStart);
          ctx.setValue(newValue);
          ctx.onSlashCommand?.(cmd);
          return;
        }
      }

      if (!ctx.submitOnEnter) return;
      if (e.key !== "Enter") return;
      if (ctx.shiftEnterNewline && e.shiftKey) return;
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      ctx.submit();
    };

    return (
      <textarea
        ref={captureRef}
        id={ctx.textareaId}
        className={cx("vf-composer__input", className)}
        value={ctx.value}
        disabled={ctx.disabled}
        maxLength={ctx.maxLength}
        rows={minRows}
        placeholder={placeholder}
        onKeyDown={handleKey}
        onChange={(e) => ctx.setValue(e.target.value)}
        {...props}
      />
    );
  }
);
ComposerInput.displayName = "ComposerInput";

// ── Composer.Footer ─────────────────────────────────────────

function ComposerFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("vf-composer__footer", className)} {...props}>
      {children}
    </div>
  );
}

// ── Composer.Submit / Stop / Regenerate / AttachButton / SlashButton / MicButton / TokenCounter

const ComposerSubmit = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  function ComposerSubmit({ className, children, ...props }, ref) {
    const ctx = useComposer();
    const isStreaming = ctx.status === "streaming";
    const canSubmit = !!ctx.value.trim() && !ctx.disabled && !isStreaming;
    const onClick = () => {
      if (isStreaming) ctx.stop?.();
      else ctx.submit();
    };
    return (
      <button
        ref={ref}
        type={isStreaming ? "button" : "submit"}
        className={cx(
          "vf-composer__submit",
          isStreaming && "vf-composer__submit--stop",
          className
        )}
        disabled={!isStreaming && !canSubmit}
        aria-label={isStreaming ? "Stop" : "Send"}
        onClick={onClick}
        {...props}
      >
        {children ?? (isStreaming ? "■" : "↑")}
      </button>
    );
  }
);
ComposerSubmit.displayName = "ComposerSubmit";

const ComposerAttachButton = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(function ComposerAttachButton({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx("vf-composer__attach", className)}
      aria-label="Attach file"
      {...props}
    >
      {children ?? "＋"}
    </button>
  );
});
ComposerAttachButton.displayName = "ComposerAttachButton";

const ComposerSlashButton = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(function ComposerSlashButton({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx("vf-composer__slash", className)}
      aria-label="Slash commands"
      {...props}
    >
      {children ?? "/"}
    </button>
  );
});
ComposerSlashButton.displayName = "ComposerSlashButton";

export interface ComposerMicButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  onRecordStart?: () => void;
  onRecordStop?: () => void;
  /** Max recording length in ms. */
  maxDuration?: number;
  transcribing?: boolean;
  /** When recording, render this waveform below the button. */
  waveform?: ReactNode;
  /** When true, treat as controlled recording state. */
  recording?: boolean;
  defaultRecording?: boolean;
  onRecordingChange?: (next: boolean) => void;
}

/**
 * Microphone toggle for the composer. Requests mic permission on press and
 * visualises audio level while active.
 */
export const ComposerMicButton = forwardRef<
  HTMLButtonElement,
  ComposerMicButtonProps
>(function ComposerMicButton(
  {
    onRecordStart,
    onRecordStop,
    maxDuration,
    transcribing,
    waveform,
    recording,
    defaultRecording = false,
    onRecordingChange,
    className,
    children,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(defaultRecording);
  const isRecording = recording ?? internal;
  const setRecording = (next: boolean) => {
    // Only emit callbacks on an actual transition.
    if (next === isRecording) return;
    if (recording === undefined) setInternal(next);
    onRecordingChange?.(next);
    if (next) onRecordStart?.();
    else onRecordStop?.();
  };

  useEffect(() => {
    if (!isRecording || !maxDuration) return;
    const t = setTimeout(() => {
      // Only flip when still actually recording.
      if (isRecording) setRecording(false);
    }, maxDuration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, maxDuration]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-pressed={isRecording}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={cx(
          "vf-composer__mic",
          isRecording && "vf-composer__mic--recording",
          transcribing && "vf-composer__mic--transcribing",
          className
        )}
        onClick={() => setRecording(!isRecording)}
        {...props}
      >
        {children ?? (isRecording ? "●" : "♪")}
      </button>
      {isRecording && waveform && (
        <div className="vf-composer__waveform" aria-hidden="true">
          {waveform}
        </div>
      )}
    </>
  );
});
ComposerMicButton.displayName = "ComposerMicButton";

const ComposerTokenCounter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { max?: number; current?: number }
>(function ComposerTokenCounter({ max, current, className, ...props }, ref) {
  const ctx = useComposer();
  const val = current ?? ctx.value.length;
  const cap = max ?? ctx.maxLength;
  return (
    <div
      ref={ref}
      className={cx("vf-composer__count", className)}
      aria-live="polite"
      {...props}
    >
      {val}
      {cap !== undefined && <> / {cap}</>}
    </div>
  );
});
ComposerTokenCounter.displayName = "ComposerTokenCounter";

/**
 * Chat message composer with text area, attachment tray, mic button, and
 * send. Compound subparts (`Composer.Input`, `Composer.Attachments`,
 * `Composer.Actions`).
 */
export const Composer = Object.assign(ComposerRoot, {
  Toolbar: ComposerToolbar,
  Input: ComposerInput,
  Footer: ComposerFooter,
  Submit: ComposerSubmit,
  AttachButton: ComposerAttachButton,
  SlashButton: ComposerSlashButton,
  MicButton: ComposerMicButton,
  TokenCounter: ComposerTokenCounter,
});

// ── ComposerAttachment chip (shown above input) ─────────────

export interface ComposerAttachmentProps
  extends HTMLAttributes<HTMLDivElement> {
  name: ReactNode;
  kind?: "image" | "file" | "audio" | "code" | "pdf" | "video";
  progress?: number;
  onRemove?: () => void;
}

/**
 * Pending-attachment chip inside the composer; shows upload progress and
 * supports removal before send.
 */
export const ComposerAttachment = forwardRef<
  HTMLDivElement,
  ComposerAttachmentProps
>(function ComposerAttachment(
  { name, kind = "file", progress, onRemove, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "vf-composer-attachment",
        `vf-composer-attachment--${kind}`,
        className
      )}
      {...props}
    >
      <span className="vf-composer-attachment__name">{name}</span>
      {progress !== undefined && progress < 100 && (
        <span
          className="vf-composer-attachment__progress"
          aria-label={`Upload ${progress}%`}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="vf-composer-attachment__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </span>
      )}
      {progress === 100 && (
        <span
          className="vf-composer-attachment__done"
          aria-label="Upload complete"
        >
          ✓
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          className="vf-composer-attachment__remove"
          aria-label="Remove attachment"
          onClick={onRemove}
        >
          ✕
        </button>
      )}
    </div>
  );
});
ComposerAttachment.displayName = "ComposerAttachment";

// ── SubmitButton (standalone) ───────────────────────────────

export interface SubmitButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  status?: ComposerStatus;
  onSubmit?: () => void;
  onStop?: () => void;
  disabled?: boolean;
}

/**
 * Form submit button with integrated pending state, driven by the nearest
 * form's submission state.
 */
export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  function SubmitButton(
    { status = "idle", onSubmit, onStop, disabled, className, children, ...props },
    ref
  ) {
    const isStreaming = status === "streaming";
    return (
      <button
        ref={ref}
        type="button"
        className={cx(
          "vf-submit-button",
          isStreaming && "vf-submit-button--stop",
          className
        )}
        aria-label={isStreaming ? "Stop" : "Send"}
        disabled={disabled}
        onClick={() => (isStreaming ? onStop?.() : onSubmit?.())}
        {...props}
      >
        {children ?? (isStreaming ? "■" : "↑")}
      </button>
    );
  }
);
SubmitButton.displayName = "SubmitButton";

// ── StopButton ──────────────────────────────────────────────

export interface StopButtonProps extends HTMLAttributes<HTMLButtonElement> {
  onStop?: () => void;
  label?: ReactNode;
}

/**
 * Chat action button that halts an in-progress stream. Shows as a stop glyph
 * while streaming.
 */
export const StopButton = forwardRef<HTMLButtonElement, StopButtonProps>(
  function StopButton({ onStop, label = "Stop", className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-stop-button", className)}
        aria-label={typeof label === "string" ? label : undefined}
        onClick={onStop}
        {...props}
      >
        <span className="vf-stop-button__icon" aria-hidden="true">
          ■
        </span>
        {children ?? <span className="vf-stop-button__label">{label}</span>}
      </button>
    );
  }
);
StopButton.displayName = "StopButton";

// ── RegenerateButton ────────────────────────────────────────

export interface RegenerateButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  onRegenerate?: () => void;
  label?: ReactNode;
}

/**
 * Chat action button that re-runs the last assistant turn. Shows a spinner
 * while the stream is active.
 */
export const RegenerateButton = forwardRef<
  HTMLButtonElement,
  RegenerateButtonProps
>(function RegenerateButton(
  { onRegenerate, label = "Regenerate", className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx("vf-regenerate-button", className)}
      aria-label={typeof label === "string" ? label : undefined}
      onClick={onRegenerate}
      {...props}
    >
      <span className="vf-regenerate-button__icon" aria-hidden="true">
        ↻
      </span>
      {children ?? <span className="vf-regenerate-button__label">{label}</span>}
    </button>
  );
});
RegenerateButton.displayName = "RegenerateButton";

// ── SuggestionChips ─────────────────────────────────────────

export type SuggestionItem = string | { text: ReactNode; icon?: ReactNode; id?: string };

export interface SuggestionChipsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  suggestions: SuggestionItem[];
  onSelect?: (text: string | SuggestionItem, index: number) => void;
  layout?: "horizontal" | "wrap";
}

/**
 * Row of chips with suggested follow-up prompts. Emits `onSelect(prompt)`
 * when a chip is activated.
 */
export const SuggestionChips = forwardRef<HTMLDivElement, SuggestionChipsProps>(
  function SuggestionChips(
    { suggestions, onSelect, layout = "horizontal", className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Suggested prompts"
        className={cx(
          "vf-suggestion-chips",
          `vf-suggestion-chips--${layout}`,
          className
        )}
        {...props}
      >
        {suggestions.map((s, i) => {
          const text = typeof s === "string" ? s : s.text;
          const icon = typeof s === "string" ? undefined : s.icon;
          const key = typeof s === "string" ? `${s}-${i}` : s.id ?? `chip-${i}`;
          return (
            <button
              key={key}
              type="button"
              className="vf-suggestion-chips__chip"
              onClick={() => onSelect?.(s, i)}
            >
              {icon && (
                <span className="vf-suggestion-chips__icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              <span className="vf-suggestion-chips__text">{text}</span>
            </button>
          );
        })}
      </div>
    );
  }
);
SuggestionChips.displayName = "SuggestionChips";

/** Alias — same component, semantic name for messaging replies. */
export const QuickReplies = SuggestionChips;

// ── PromptTemplate ──────────────────────────────────────────

export interface PromptTemplate {
  id: string;
  title: string;
  body: string;
  description?: string;
  variables?: string[];
}

export interface PromptTemplateListProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "title"> {
  templates: PromptTemplate[];
  onSelect?: (template: PromptTemplate) => void;
  title?: ReactNode;
}

/**
 * List of saved prompt templates with preview, rename, duplicate, delete.
 */
export const PromptTemplateList = forwardRef<
  HTMLDivElement,
  PromptTemplateListProps
>(function PromptTemplateList(
  { templates, onSelect, title, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("vf-prompt-template-list", className)}
      {...props}
    >
      {title && (
        <header className="vf-prompt-template-list__title">{title}</header>
      )}
      <ul className="vf-prompt-template-list__list">
        {templates.map((t) => (
          <li key={t.id} className="vf-prompt-template-list__item">
            <button
              type="button"
              className="vf-prompt-template-list__btn"
              onClick={() => onSelect?.(t)}
            >
              <span className="vf-prompt-template-list__btn-title">
                {t.title}
              </span>
              {t.description && (
                <span className="vf-prompt-template-list__btn-desc">
                  {t.description}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});
PromptTemplateList.displayName = "PromptTemplateList";

export interface PromptTemplateEditorProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  template?: PromptTemplate;
  onSave?: (template: PromptTemplate) => void;
  onCancel?: () => void;
}

/**
 * Editor for an LLM prompt template: body textarea plus a sidebar of named
 * variables.
 */
export const PromptTemplateEditor = forwardRef<
  HTMLFormElement,
  PromptTemplateEditorProps
>(function PromptTemplateEditor(
  { template, onSave, onCancel, className, ...props },
  ref
) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [description, setDescription] = useState(template?.description ?? "");

  return (
    <form
      ref={ref}
      className={cx("vf-prompt-template-editor", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.({
          id: template?.id ?? `t-${Date.now().toString(36)}`,
          title,
          body,
          description: description || undefined,
          variables: extractVars(body),
        });
      }}
      {...props}
    >
      <label className="vf-prompt-template-editor__field">
        <span className="vf-prompt-template-editor__label">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="vf-prompt-template-editor__input"
        />
      </label>
      <label className="vf-prompt-template-editor__field">
        <span className="vf-prompt-template-editor__label">Description</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="vf-prompt-template-editor__input"
        />
      </label>
      <label className="vf-prompt-template-editor__field">
        <span className="vf-prompt-template-editor__label">Body</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="vf-prompt-template-editor__textarea"
        />
      </label>
      <div className="vf-prompt-template-editor__actions">
        <button
          type="button"
          className="vf-prompt-template-editor__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="vf-prompt-template-editor__save"
        >
          Save
        </button>
      </div>
    </form>
  );
});
PromptTemplateEditor.displayName = "PromptTemplateEditor";

function extractVars(body: string): string[] {
  const matches = body.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || [];
  const seen = new Set<string>();
  for (const m of matches) {
    const v = m.replace(/[{}\s]/g, "");
    if (v) seen.add(v);
  }
  return Array.from(seen);
}

// ── SlashCommandPicker (popover-style menu) ─────────────────

export interface SlashCommand {
  id: string;
  command: string;
  description?: ReactNode;
  icon?: ReactNode;
}

export interface SlashCommandPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  commands: SlashCommand[];
  onSelect?: (command: SlashCommand) => void;
  filter?: string;
  activeIndex?: number;
  onActiveIndexChange?: (next: number) => void;
}

/**
 * Popover listing available slash commands. Used inside `SlashCommandInput`
 * and the composer.
 */
export const SlashCommandPicker = forwardRef<
  HTMLDivElement,
  SlashCommandPickerProps
>(function SlashCommandPicker(
  {
    commands,
    onSelect,
    filter = "",
    activeIndex,
    onActiveIndexChange,
    className,
    ...props
  },
  ref
) {
  const normalized = filter.trim().toLowerCase();
  const filtered = normalized
    ? commands.filter(
        (c) =>
          c.command.toLowerCase().includes(normalized) ||
          (typeof c.description === "string" &&
            c.description.toLowerCase().includes(normalized))
      )
    : commands;
  const [internal, setInternal] = useState(0);
  const current = activeIndex ?? internal;
  const setActive = (next: number) => {
    if (activeIndex === undefined) setInternal(next);
    onActiveIndexChange?.(next);
  };
  useEffect(() => {
    if (current >= filtered.length) setActive(Math.max(0, filtered.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);
  return (
    <div
      ref={ref}
      role="listbox"
      className={cx("vf-slash-picker", className)}
      {...props}
    >
      {filtered.length === 0 ? (
        <div className="vf-slash-picker__empty">No commands</div>
      ) : (
        filtered.map((cmd, i) => (
          <button
            key={cmd.id}
            type="button"
            role="option"
            aria-selected={i === current}
            className={cx(
              "vf-slash-picker__item",
              i === current && "vf-slash-picker__item--active"
            )}
            onMouseEnter={() => setActive(i)}
            onClick={() => onSelect?.(cmd)}
          >
            {cmd.icon && (
              <span className="vf-slash-picker__icon" aria-hidden="true">
                {cmd.icon}
              </span>
            )}
            <span className="vf-slash-picker__cmd">/{cmd.command}</span>
            {cmd.description && (
              <span className="vf-slash-picker__desc">{cmd.description}</span>
            )}
          </button>
        ))
      )}
    </div>
  );
});
SlashCommandPicker.displayName = "SlashCommandPicker";

// ── Mention (inline chip inside message content) ────────────

export interface MentionProps extends HTMLAttributes<HTMLSpanElement> {
  value: ReactNode;
  kind?: "user" | "channel" | "file" | "reference";
  href?: string;
  onActivate?: () => void;
}

/**
 * Rendered mention chip (e.g. `@alice`). Clickable, hoverable, and linkable
 * to a profile.
 */
export const Mention = forwardRef<HTMLSpanElement, MentionProps>(
  function Mention(
    { value, kind = "user", href, onActivate, className, style, ...props },
    ref
  ) {
    const body = (
      <>
        <span className="vf-mention-chip__sigil" aria-hidden="true">
          {sigil(kind)}
        </span>
        <span className="vf-mention-chip__value">{value}</span>
      </>
    );
    const composed: CSSProperties | undefined = style;
    if (href) {
      return (
        <a
          href={safeHref(href)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cx("vf-mention-chip", `vf-mention-chip--${kind}`, className)}
          style={composed}
          onClick={onActivate ? () => onActivate() : undefined}
          {...(props as HTMLAttributes<HTMLAnchorElement>)}
        >
          {body}
        </a>
      );
    }
    if (onActivate) {
      return (
        <button
          type="button"
          ref={ref as React.Ref<HTMLButtonElement>}
          className={cx("vf-mention-chip", `vf-mention-chip--${kind}`, className)}
          style={composed}
          onClick={onActivate}
          {...(props as HTMLAttributes<HTMLButtonElement>)}
        >
          {body}
        </button>
      );
    }
    return (
      <span
        ref={ref}
        className={cx("vf-mention-chip", `vf-mention-chip--${kind}`, className)}
        style={composed}
        {...props}
      >
        {body}
      </span>
    );
  }
);
Mention.displayName = "Mention";

function sigil(kind: "user" | "channel" | "file" | "reference"): string {
  if (kind === "channel") return "#";
  if (kind === "file") return "▤";
  if (kind === "reference") return "<<";
  return "@";
}
