"use client";

import { forwardRef, memo, useCallback, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface Token {
  text: string;
  id?: number;
  logprob?: number;
  special?: boolean;
}

export interface TokenVisualizerProps extends HTMLAttributes<HTMLDivElement> {
  tokens: Token[] | string[];
  colorMode?: "alternating" | "logprob" | "type" | "none";
  showIds?: boolean;
  showLogprobs?: boolean;
  showBoundaries?: boolean;
  onTokenClick?: (token: Token, index: number) => void;
  onTokenHover?: (token: Token | null, index: number) => void;
  selectedTokens?: number[];
  wrap?: boolean;
  size?: "sm" | "md" | "lg";
}

function normalizeToken(t: Token | string): Token {
  return typeof t === "string" ? { text: t } : t;
}

function logprobClass(logprob: number | undefined): string {
  if (logprob === undefined) return "";
  if (logprob > -0.5) return "vf-token-viz__token--high-prob";
  if (logprob > -2) return "vf-token-viz__token--medium-prob";
  return "vf-token-viz__token--low-prob";
}

const TokenVisualizerImpl = forwardRef<HTMLDivElement, TokenVisualizerProps>(
  function TokenVisualizer(
    {
      tokens: rawTokens,
      colorMode = "alternating",
      showIds = false,
      showLogprobs = false,
      showBoundaries = true,
      onTokenClick,
      onTokenHover,
      selectedTokens = [],
      wrap = true,
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const tokens = rawTokens.map(normalizeToken);

    const handleMouseEnter = useCallback(
      (token: Token, index: number) => {
        onTokenHover?.(token, index);
      },
      [onTokenHover]
    );

    const handleMouseLeave = useCallback(
      (_token: Token, index: number) => {
        onTokenHover?.(null, index);
      },
      [onTokenHover]
    );

    const isWhitespace = (text: string) => /^\s+$/.test(text);

    return (
      <div
        ref={ref}
        className={cx(
          "vf-token-viz",
          `vf-token-viz--${size}`,
          !wrap && "vf-token-viz--nowrap",
          !showBoundaries && "vf-token-viz--no-boundaries",
          className
        )}
        style={style}
        {...props}
      >
        {tokens.map((token, i) => {
          const ws = isWhitespace(token.text);
          const tokenClass = cx(
            "vf-token-viz__token",
            colorMode === "alternating" &&
              (i % 2 === 0
                ? "vf-token-viz__token--even"
                : "vf-token-viz__token--odd"),
            colorMode === "logprob" && logprobClass(token.logprob),
            token.special && "vf-token-viz__token--special",
            ws && "vf-token-viz__token--whitespace",
            selectedTokens.includes(i) && "vf-token-viz__token--selected"
          );

          return (
            <span
              key={i}
              className={tokenClass}
              onClick={() => onTokenClick?.(token, i)}
              onMouseEnter={() => handleMouseEnter(token, i)}
              onMouseLeave={() => handleMouseLeave(token, i)}
              title={[
                token.id !== undefined ? `ID: ${token.id}` : null,
                token.logprob !== undefined ? `logprob: ${token.logprob}` : null,
              ]
                .filter(Boolean)
                .join(", ")}
              data-token-index={i}
            >
              {ws ? token.text.replace(/ /g, "\u00B7").replace(/\n/g, "\u21B5\n") : token.text}
              {showIds && token.id !== undefined && (
                <sub className="vf-token-viz__token-id">{token.id}</sub>
              )}
              {showLogprobs && token.logprob !== undefined && (
                <sub className="vf-token-viz__token-logprob">
                  {token.logprob.toFixed(2)}
                </sub>
              )}
            </span>
          );
        })}

        <div className="vf-token-viz__summary">
          {tokens.length} token{tokens.length !== 1 ? "s" : ""}
        </div>
      </div>
    );
  }
);
TokenVisualizerImpl.displayName = "TokenVisualizer";
export const TokenVisualizer = memo(TokenVisualizerImpl);
(TokenVisualizer as unknown as { displayName: string }).displayName =
  "TokenVisualizer";
