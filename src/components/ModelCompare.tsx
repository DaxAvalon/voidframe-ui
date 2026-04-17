"use client";

import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";
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
          {models.map((model) => {
            const resp = getResponse(model.id);
            const status = resp?.status ?? "idle";
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
                <div className="vf-model-compare__panel-content">
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
