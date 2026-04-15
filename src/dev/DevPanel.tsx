"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import {
  getWarningHistory,
  subscribeWarnings,
  clearWarningHistory,
  type WarningEntry,
} from "../utils/warn";
import { getProfilerStore, useAllProfilerStats } from "./useRenderProfiler";

export type DevPanelPosition = "tl" | "tr" | "bl" | "br";
export type DevPanelTab = "renders" | "warnings" | "theme" | "about";

export interface DevPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Corner to anchor to. Default: "br". */
  position?: DevPanelPosition;
  /** If true, renders even in production. Default: false. */
  showInProduction?: boolean;
  /** Starting tab. */
  defaultTab?: DevPanelTab;
  /** Starting collapsed state. */
  defaultCollapsed?: boolean;
  /** Optional title shown in the header. */
  title?: string;
  /** Package/version info shown on the "about" tab. */
  version?: string;
}

const isProd: boolean =
  typeof process !== "undefined" &&
  process.env != null &&
  process.env.NODE_ENV === "production";

const POSITION_CLASS: Record<DevPanelPosition, string> = {
  tl: "vf-dev-panel--tl",
  tr: "vf-dev-panel--tr",
  bl: "vf-dev-panel--bl",
  br: "vf-dev-panel--br",
};

const TABS: { id: DevPanelTab; label: string }[] = [
  { id: "renders", label: "Renders" },
  { id: "warnings", label: "Warnings" },
  { id: "theme", label: "Theme" },
  { id: "about", label: "About" },
];

function useWarningHistory(): {
  entries: WarningEntry[];
  refresh: () => void;
} {
  const [entries, setEntries] = useState<WarningEntry[]>(() =>
    getWarningHistory()
  );
  const refresh = useCallback(() => setEntries(getWarningHistory()), []);
  useEffect(() => {
    // Subscribers may fire mid-render if another component emits a warning
    // during its render pass. Defer the setState to a microtask so we never
    // trigger reentrant React scheduling.
    let pending = false;
    const sync = () => {
      pending = false;
      setEntries(getWarningHistory());
    };
    sync();
    return subscribeWarnings(() => {
      if (pending) return;
      pending = true;
      queueMicrotask(sync);
    });
  }, []);
  return { entries, refresh };
}

function useThemeTokens(): { name: string; value: string }[] {
  const [tokens, setTokens] = useState<{ name: string; value: string }[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const names: string[] = [];
    for (let i = 0; i < style.length; i++) {
      const n = style.item(i);
      if (n.startsWith("--vf-")) names.push(n);
    }
    names.sort();
    setTokens(
      names.map((name) => ({ name, value: style.getPropertyValue(name).trim() }))
    );
  }, []);
  return tokens;
}

export function DevPanel({
  position = "br",
  showInProduction = false,
  defaultTab = "renders",
  defaultCollapsed = false,
  title = "voidframe dev",
  version,
  className,
  ...rest
}: DevPanelProps) {
  const [tab, setTab] = useState<DevPanelTab>(defaultTab);
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);

  if (isProd && !showInProduction) return null;

  return (
    <div
      role="complementary"
      aria-label={title}
      className={cx(
        "vf-dev-panel",
        POSITION_CLASS[position],
        collapsed && "vf-dev-panel--collapsed",
        className
      )}
      {...rest}
    >
      <div className="vf-dev-panel__head">
        <span className="vf-dev-panel__title">{title}</span>
        <button
          type="button"
          className="vf-dev-panel__toggle"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "+" : "–"}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="vf-dev-panel__tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={cx(
                  "vf-dev-panel__tab",
                  tab === t.id && "vf-dev-panel__tab--active"
                )}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="vf-dev-panel__body" role="tabpanel">
            {tab === "renders" && <RendersTab />}
            {tab === "warnings" && <WarningsTab />}
            {tab === "theme" && <ThemeTab />}
            {tab === "about" && <AboutTab version={version} />}
          </div>
        </>
      )}
    </div>
  );
}
DevPanel.displayName = "DevPanel";

function RendersTab() {
  const stats = useAllProfilerStats();
  const clear = useCallback(() => getProfilerStore().clear(), []);
  const sorted = useMemo(
    () => stats.slice().sort((a, b) => b.renderCount - a.renderCount),
    [stats]
  );
  return (
    <div className="vf-dev-panel__pane">
      <div className="vf-dev-panel__toolbar">
        <span className="vf-dev-panel__count">{stats.length} scopes</span>
        <button
          type="button"
          className="vf-dev-panel__action"
          onClick={clear}
          disabled={stats.length === 0}
        >
          Clear
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="vf-dev-panel__empty">
          No profiler scopes mounted. Wrap a component with
          <code> &lt;ProfilerScope id="..."&gt;</code>.
        </div>
      ) : (
        <table className="vf-dev-panel__table">
          <thead>
            <tr>
              <th>id</th>
              <th>count</th>
              <th>last</th>
              <th>avg</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.renderCount}</td>
                <td>{s.lastDuration.toFixed(2)}ms</td>
                <td>{s.avgDuration.toFixed(2)}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function WarningsTab() {
  const { entries, refresh } = useWarningHistory();
  const clear = useCallback(() => {
    clearWarningHistory();
    refresh();
  }, [refresh]);
  return (
    <div className="vf-dev-panel__pane">
      <div className="vf-dev-panel__toolbar">
        <span className="vf-dev-panel__count">{entries.length} warnings</span>
        <button
          type="button"
          className="vf-dev-panel__action"
          onClick={clear}
          disabled={entries.length === 0}
        >
          Clear
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="vf-dev-panel__empty">No warnings captured.</div>
      ) : (
        <ul className="vf-dev-panel__list">
          {entries
            .slice()
            .reverse()
            .map((e, i) => (
              <li key={i} className="vf-dev-panel__warning">
                <span
                  className={cx(
                    "vf-dev-panel__level",
                    `vf-dev-panel__level--${e.level}`
                  )}
                >
                  {e.level}
                </span>
                <span className="vf-dev-panel__warning-msg">{e.message}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function ThemeTab() {
  const tokens = useThemeTokens();
  return (
    <div className="vf-dev-panel__pane">
      <div className="vf-dev-panel__toolbar">
        <span className="vf-dev-panel__count">{tokens.length} tokens</span>
      </div>
      {tokens.length === 0 ? (
        <div className="vf-dev-panel__empty">No --vf-* tokens on :root.</div>
      ) : (
        <table className="vf-dev-panel__table">
          <tbody>
            {tokens.map((t) => (
              <tr key={t.name}>
                <td>
                  <span
                    className="vf-dev-panel__swatch"
                    style={{ background: t.value }}
                    aria-hidden="true"
                  />
                  {t.name}
                </td>
                <td className="vf-dev-panel__token-value">{t.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AboutTab({ version }: { version?: string }) {
  return (
    <div className="vf-dev-panel__pane vf-dev-panel__about">
      <dl>
        <dt>framework</dt>
        <dd>voidframe</dd>
        {version && (
          <>
            <dt>version</dt>
            <dd>{version}</dd>
          </>
        )}
        <dt>mode</dt>
        <dd>{isProd ? "production" : "development"}</dd>
      </dl>
    </div>
  );
}
