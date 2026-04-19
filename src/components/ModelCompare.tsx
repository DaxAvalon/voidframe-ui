"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface ModelCompareModel {
  id: string;
  name: string;
  icon?: ReactNode;
}

export interface ModelCompareResponse {
  modelId: string;
  content: string;
  tokens?: { input: number; output: number };
  latency?: number;
  status: "idle" | "streaming" | "complete" | "error";
  error?: string;
}

export interface ModelCompareProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onSubmit"> {
  models: [ModelCompareModel, ModelCompareModel];
  responses?: ModelCompareResponse[];
  onSubmit?: (prompt: string) => void;
  prompt?: string;
  defaultPrompt?: string;
  onPromptChange?: (prompt: string) => void;
  showMetrics?: boolean;
  syncScroll?: boolean;
  size?: "sm" | "md";
}

const ModelCompareImpl = forwardRef<HTMLDivElement, ModelCompareProps>(
  function ModelCompare(
    {
      models,
      responses = [],
      onSubmit,
      prompt: promptProp,
      defaultPrompt,
      onPromptChange,
      showMetrics = true,
      syncScroll = false,
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const [prompt, setPrompt] = useControllableState<string>({
      value: promptProp,
      defaultValue: defaultPrompt ?? "",
      onChange: onPromptChange,
      componentName: "ModelCompare",
    });

    const handleSubmit = () => {
      if (prompt.trim()) onSubmit?.(prompt);
    };

    const getResponse = (modelId: string) =>
      responses.find((r) => r.modelId === modelId);

    // Mirror scrollTop across the two panel-content divs when syncScroll is on.
    // Guarded by `syncingRef` to prevent the mirrored scroll from re-triggering this handler.
    const panelRefs = useRef<[HTMLDivElement | null, HTMLDivElement | null]>([null, null]);
    const syncingRef = useRef(false);
    const handlePanelScroll = useCallback(
      (idx: 0 | 1) => (e: UIEvent<HTMLDivElement>) => {
        if (!syncScroll) return;
        if (syncingRef.current) return;
        const other = panelRefs.current[idx === 0 ? 1 : 0];
        if (!other) return;
        syncingRef.current = true;
        other.scrollTop = e.currentTarget.scrollTop;
        // reset on next tick so user scrolls on `other` still work
        queueMicrotask(() => {
          syncingRef.current = false;
        });
      },
      [syncScroll]
    );

    return (
      <div
        ref={ref}
        className={cx(
          "vf-model-compare",
          `vf-model-compare--${size}`,
          className
        )}
        style={style}
        {...props}
      >
        {/* Prompt */}
        <div className="vf-model-compare__prompt">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter prompt…"
            aria-label="Prompt"
          />
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </div>

        {/* Panels */}
        <div className="vf-model-compare__panels">
          {models.map((model, idx) => {
            const resp = getResponse(model.id);
            const status = resp?.status ?? "idle";
            const panelIdx = (idx === 0 ? 0 : 1) as 0 | 1;
            return (
              <div
                key={model.id}
                className={cx(
                  "vf-model-compare__panel",
                  status === "streaming" && "vf-model-compare__panel--streaming",
                  status === "error" && "vf-model-compare__panel--error"
                )}
              >
                <div className="vf-model-compare__panel-header">
                  {model.icon && (
                    <span aria-hidden="true">{model.icon}</span>
                  )}
                  <span>{model.name}</span>
                </div>
                <div
                  className="vf-model-compare__panel-content"
                  ref={(el) => {
                    panelRefs.current[panelIdx] = el;
                  }}
                  onScroll={handlePanelScroll(panelIdx)}
                >
                  {status === "error" && resp?.error
                    ? resp.error
                    : resp?.content ?? ""}
                </div>
                {showMetrics && resp && (resp.tokens || resp.latency !== undefined) && (
                  <div className="vf-model-compare__panel-metrics">
                    {resp.tokens && (
                      <span>
                        {resp.tokens.input}in / {resp.tokens.output}out
                      </span>
                    )}
                    {resp.latency !== undefined && (
                      <span>{resp.latency}ms</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ModelCompareImpl.displayName = "ModelCompare";
export const ModelCompare = memo(ModelCompareImpl);
(ModelCompare as unknown as { displayName: string }).displayName =
  "ModelCompare";
