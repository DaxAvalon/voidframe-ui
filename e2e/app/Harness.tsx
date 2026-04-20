import { Suspense, type ReactNode } from "react";
import { VoidframeProvider } from "voidframe";

type ThemeName = "dark" | "light" | "midnight" | "grey" | "system";

function parseTheme(search: string): ThemeName {
  const params = new URLSearchParams(search);
  const t = params.get("theme");
  if (t === "dark" || t === "light" || t === "midnight" || t === "grey" || t === "system") {
    return t;
  }
  return "dark";
}

interface HarnessProps {
  children: ReactNode;
}

/**
 * Wraps a route fixture in VoidframeProvider and a minimal <main> so
 * @axe-core/playwright runs against a clean document shell. Theme is
 * read from the `?theme=` query param on the hash so Playwright can
 * exercise theme-dependent flows.
 */
export function Harness({ children }: HarnessProps) {
  // Route is #/Name?theme=dark — split the query after the hash.
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const queryIdx = hash.indexOf("?");
  const search = queryIdx >= 0 ? hash.slice(queryIdx) : "";
  const theme = parseTheme(search);

  return (
    <VoidframeProvider themeName={theme}>
      <main
        style={{
          padding: 24,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
      </main>
    </VoidframeProvider>
  );
}
