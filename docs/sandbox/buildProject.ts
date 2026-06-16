// Turns a docs playground snippet into a complete, runnable Vite + React + TS
// project that can be opened in StackBlitz or CodeSandbox. The same project
// shape feeds both providers; only the final "open" transport differs.
//
// The hard part is reproducing the docs playground's scope (where every
// voidframe export and a handful of React hooks are bare identifiers) as real
// ES module imports. We infer the imports by scanning the snippet for
// identifiers that match known export names — the export sets are derived from
// the actual source barrels, so they never drift from what the library ships.

import * as voidframe from "../../src";
import * as charts from "../../src/charts";
import pkg from "../../package.json";

const VF_NAMES = new Set(Object.keys(voidframe));
// Names that live only in the charts subpath (the main barrel does not
// re-export them), so they must be imported from "voidframe-ui/charts".
const CHART_NAMES = new Set(
  Object.keys(charts).filter((k) => !VF_NAMES.has(k))
);

const REACT_HOOKS = new Set([
  "useState", "useEffect", "useMemo", "useCallback", "useRef", "useReducer",
  "useContext", "useLayoutEffect", "useId", "useTransition", "useDeferredValue",
  "useImperativeHandle", "useSyncExternalStore", "useInsertionEffect",
]);

// Identifiers the docs scope exposes under a different name than the real
// export (see docs/scope.ts). Imported real-name-as-alias so the snippet still
// resolves.
const ALIASES: Record<string, string> = { TokenCounter: "ChatTokenCounter" };

const peers = (pkg.peerDependencies ?? {}) as Record<string, string>;
const VF_VERSION = `^${pkg.version}`;

function pickPeers(names: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of names) if (peers[n]) out[n] = peers[n];
  return out;
}

function uniqueIdentifiers(code: string): Set<string> {
  const ids = new Set<string>();
  const re = /[A-Za-z_$][A-Za-z0-9_$]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) ids.add(m[0]);
  return ids;
}

export interface BuildProjectOptions {
  title?: string;
  /** Matches the docs Playground prop: snippet calls `render(...)` itself. */
  noInline?: boolean;
}

export interface SandboxProject {
  title: string;
  description: string;
  /** Path → file contents, rooted at the project directory. */
  files: Record<string, string>;
  dependencies: Record<string, string>;
}

function buildImports(ids: Set<string>): string {
  const reactHooks: string[] = [];
  const vfNamed: string[] = [];
  const vfAliased: string[] = [];
  const chartNamed: string[] = [];
  let usesReactNamespace = false;

  for (const id of ids) {
    if (id === "React") usesReactNamespace = true;
    else if (REACT_HOOKS.has(id)) reactHooks.push(id);
    else if (ALIASES[id]) vfAliased.push(`${ALIASES[id]} as ${id}`);
    else if (CHART_NAMES.has(id)) chartNamed.push(id);
    else if (VF_NAMES.has(id)) vfNamed.push(id);
  }

  const lines: string[] = [];
  if (usesReactNamespace) lines.push(`import * as React from "react";`);
  if (reactHooks.length)
    lines.push(`import { ${reactHooks.sort().join(", ")} } from "react";`);
  const vfAll = [...vfNamed.sort(), ...vfAliased.sort()];
  if (vfAll.length)
    lines.push(`import { ${vfAll.join(", ")} } from "voidframe-ui";`);
  if (chartNamed.length)
    lines.push(
      `import { ${chartNamed.sort().join(", ")} } from "voidframe-ui/charts";`
    );
  return lines.join("\n");
}

function buildExample(code: string, noInline: boolean, imports: string): string {
  if (noInline) {
    // The snippet declares helpers and calls render(<X/>). Provide a local
    // `render` that captures the node, then return it — mirroring how
    // react-live evaluates noInline snippets.
    return `${imports}

export default function Example() {
  let __node: React.ReactNode = null;
  const render = (node: React.ReactNode) => {
    __node = node;
  };
${code
  .split("\n")
  .map((l) => (l ? `  ${l}` : l))
  .join("\n")}
  return <>{__node}</>;
}
`;
  }
  return `${imports}

export default function Example() {
  return (
    ${code.trim()}
  );
}
`;
}

export function buildProject(
  code: string,
  { title = "Voidframe example", noInline = false }: BuildProjectOptions = {}
): SandboxProject {
  const ids = uniqueIdentifiers(code);
  // React's namespace is referenced by the generated Example wrapper.
  ids.add("React");
  const imports = buildImports(ids);

  const chartsUsed = [...ids].some((id) => CHART_NAMES.has(id));
  const flowUsed = [...ids].some((id) => /Flow/.test(id) && /^[A-Z]/.test(id));

  const dependencies: Record<string, string> = {
    "voidframe-ui": VF_VERSION,
    ...pickPeers(["react", "react-dom"]),
    // Small, broadly-used peers — cheap to include so QR/barcode/markdown
    // snippets always run.
    ...pickPeers(["dompurify", "jsbarcode", "qrcode-generator"]),
  };
  if (chartsUsed) {
    Object.assign(
      dependencies,
      pickPeers([
        "d3-array", "d3-force", "d3-geo", "d3-hierarchy", "d3-sankey",
        "d3-scale", "d3-shape", "d3-time", "topojson-client",
      ])
    );
  }
  if (flowUsed) Object.assign(dependencies, pickPeers(["@xyflow/react"]));

  const example = buildExample(code, noInline, imports);

  const files: Record<string, string> = {
    "package.json": JSON.stringify(
      {
        name: "voidframe-example",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies,
        devDependencies: {
          "@types/react": "^18.3.0",
          "@types/react-dom": "^18.3.0",
          "@vitejs/plugin-react": "^4.3.0",
          typescript: "^5.5.0",
          vite: "^5.4.0",
        },
      },
      null,
      2
    ),
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });
`,
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ESNext",
          useDefineForClassFields: true,
          lib: ["DOM", "DOM.Iterable", "ESNext"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
        },
        include: ["src"],
      },
      null,
      2
    ),
    "src/main.tsx": `import { createRoot } from "react-dom/client";
import { VoidframeProvider } from "voidframe-ui";
import "voidframe-ui/styles.css";
import Example from "./Example";

createRoot(document.getElementById("root")!).render(
  <VoidframeProvider>
    <Example />
  </VoidframeProvider>
);
`,
    "src/Example.tsx": example,
  };

  return {
    title,
    description: "Voidframe UI example — opened from the docs playground.",
    files,
    dependencies,
  };
}
