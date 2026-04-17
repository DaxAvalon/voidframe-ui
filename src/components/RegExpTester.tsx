"use client";

import { forwardRef, memo, useMemo, type HTMLAttributes } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface RegExpTesterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  pattern?: string;
  defaultPattern?: string;
  onPatternChange?: (pattern: string) => void;
  testString?: string;
  defaultTestString?: string;
  onTestStringChange?: (text: string) => void;
  flags?: string;
  defaultFlags?: string;
  onFlagsChange?: (flags: string) => void;
  showFlags?: boolean;
  showMatches?: boolean;
  showCaptures?: boolean;
  showReplace?: boolean;
  size?: "sm" | "md";
  readOnly?: boolean;
}

const FLAG_OPTIONS = ["g", "i", "m", "s"] as const;

interface MatchResult {
  match: string;
  index: number;
  end: number;
  groups: string[];
}

function getMatches(pattern: string, flags: string, text: string): MatchResult[] {
  if (!pattern) return [];
  const results: MatchResult[] = [];
  try {
    const effectiveFlags = flags.includes("g") ? flags : flags + "g";
    const re = new RegExp(pattern, effectiveFlags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      results.push({
        match: m[0],
        index: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1),
      });
      if (!m[0].length) re.lastIndex++;
    }
  } catch {
    // invalid regex handled by getError
  }
  return results;
}

function getError(pattern: string, flags: string): string | null {
  if (!pattern) return null;
  try {
    new RegExp(pattern, flags);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

const RegExpTesterImpl = forwardRef<HTMLDivElement, RegExpTesterProps>(
  function RegExpTester(
    {
      pattern: patternProp,
      defaultPattern,
      onPatternChange,
      testString: testStringProp,
      defaultTestString,
      onTestStringChange,
      flags: flagsProp,
      defaultFlags,
      onFlagsChange,
      showFlags = true,
      showMatches = true,
      showCaptures = true,
      showReplace = false,
      size = "md",
      readOnly = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [pattern, setPattern] = useControllableState<string>({
      value: patternProp,
      defaultValue: defaultPattern ?? "",
      onChange: onPatternChange,
      componentName: "RegExpTester",
    });

    const [testString, setTestString] = useControllableState<string>({
      value: testStringProp,
      defaultValue: defaultTestString ?? "",
      onChange: onTestStringChange,
      componentName: "RegExpTester",
    });

    const [flags, setFlags] = useControllableState<string>({
      value: flagsProp,
      defaultValue: defaultFlags ?? "g",
      onChange: onFlagsChange,
      componentName: "RegExpTester",
    });

    const error = useMemo(() => getError(pattern, flags), [pattern, flags]);
    const matches = useMemo(
      () => (error ? [] : getMatches(pattern, flags, testString)),
      [pattern, flags, testString, error]
    );

    const toggleFlag = (f: string) => {
      setFlags(flags.includes(f) ? flags.replace(f, "") : flags + f);
    };

    const hasCaptures = matches.some((m) => m.groups.length > 0);

    return (
      <div
        ref={ref}
        className={cx(
          "vf-regexp-tester",
          `vf-regexp-tester--${size}`,
          className
        )}
        style={style}
        {...props}
      >
        {/* Pattern row */}
        <div className="vf-regexp-tester__pattern">
          <input
            className="vf-regexp-tester__pattern-input"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            readOnly={readOnly}
            aria-label="Regular expression pattern"
          />
          {showFlags && (
            <div className="vf-regexp-tester__flags" role="group" aria-label="Flags">
              {FLAG_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={cx(
                    "vf-regexp-tester__flag",
                    flags.includes(f) && "vf-regexp-tester__flag--active"
                  )}
                  onClick={() => toggleFlag(f)}
                  aria-pressed={flags.includes(f)}
                  aria-label={`Flag ${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="vf-regexp-tester__pattern-error" role="alert">
            {error}
          </div>
        )}

        {/* Test string */}
        <textarea
          className="vf-regexp-tester__test-string"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string..."
          readOnly={readOnly}
          aria-label="Test string"
        />

        {/* Match info */}
        {showMatches && matches.length > 0 && (
          <div className="vf-regexp-tester__match-info">
            <strong>{matches.length} match{matches.length !== 1 ? "es" : ""}</strong>
            {matches.map((m, i) => (
              <div key={i} className="vf-regexp-tester__match-item">
                Match {i + 1}: &quot;{m.match}&quot; at [{m.index}-{m.end}]
              </div>
            ))}
          </div>
        )}

        {/* Capture groups */}
        {showCaptures && hasCaptures && (
          <div className="vf-regexp-tester__captures">
            {matches.map((m, mi) =>
              m.groups.map((g, gi) => (
                <div key={`${mi}-${gi}`} className="vf-regexp-tester__capture-group">
                  Match {mi + 1}, Group {gi + 1}: &quot;{g}&quot;
                </div>
              ))
            )}
          </div>
        )}

        {/* Replace */}
        {showReplace && (
          <div className="vf-regexp-tester__replace">
            <input
              type="text"
              placeholder="Replace pattern..."
              aria-label="Replace pattern"
              className="vf-regexp-tester__replace-input"
            />
            <div className="vf-regexp-tester__replace-result" />
          </div>
        )}
      </div>
    );
  }
);
RegExpTesterImpl.displayName = "RegExpTester";
export const RegExpTester = memo(RegExpTesterImpl);
(RegExpTester as unknown as { displayName: string }).displayName =
  "RegExpTester";
