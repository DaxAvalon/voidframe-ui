import { describe, expect, it } from "vitest";
import * as voidframe from "../../src";
import * as charts from "../../src/charts";
import { buildProject } from "../sandbox/buildProject";

// A component that lives only in the charts subpath (not re-exported from the
// main barrel), chosen dynamically so the test never drifts from the library.
const chartOnlyName = Object.keys(charts).find(
  (k) => !(k in voidframe)
)!;

describe("buildProject", () => {
  it("emits a complete, runnable project scaffold", () => {
    const { files, dependencies } = buildProject("<Button>Hi</Button>");
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining([
        "package.json",
        "index.html",
        "vite.config.ts",
        "tsconfig.json",
        "src/main.tsx",
        "src/Example.tsx",
      ])
    );
    expect(dependencies["voidframe-ui"]).toMatch(/^\^\d+\.\d+\.\d+/);
    expect(dependencies.react).toBeTruthy();
    expect(dependencies["react-dom"]).toBeTruthy();
    // main.tsx wires the provider and stylesheet.
    expect(files["src/main.tsx"]).toContain("voidframe-ui/styles.css");
    expect(files["src/main.tsx"]).toContain("VoidframeProvider");
  });

  it("infers named imports from voidframe-ui and react", () => {
    const { files } = buildProject(
      `<div>{(() => { const [n] = useState(0); return n; })()}<Button>Go</Button></div>`
    );
    const example = files["src/Example.tsx"];
    expect(example).toContain(`import { Button } from "voidframe-ui";`);
    expect(example).toContain(`import { useState } from "react";`);
  });

  it("imports chart-only components from the charts subpath and adds d3 peers", () => {
    const { files, dependencies } = buildProject(`<${chartOnlyName} data={[]} />`);
    expect(files["src/Example.tsx"]).toContain(
      `import { ${chartOnlyName} } from "voidframe-ui/charts";`
    );
    expect(dependencies["d3-array"]).toBeTruthy();
    expect(dependencies["d3-scale"]).toBeTruthy();
  });

  it("does not pull d3 peers for a non-chart snippet", () => {
    const { dependencies } = buildProject("<Button>Hi</Button>");
    expect(dependencies["d3-array"]).toBeUndefined();
    expect(dependencies["@xyflow/react"]).toBeUndefined();
  });

  it("wraps a render()-style (noInline) snippet so it returns the node", () => {
    const code = `const x = 1;\nrender(<Badge>{x}</Badge>);`;
    const { files } = buildProject(code, { noInline: true });
    const example = files["src/Example.tsx"];
    expect(example).toContain("const render = (node");
    expect(example).toContain("return <>{__node}</>");
    expect(example).toContain(`import { Badge } from "voidframe-ui";`);
  });

  it("aliases scope-only names to their real export", () => {
    const { files } = buildProject("<TokenCounter />");
    expect(files["src/Example.tsx"]).toContain(
      "ChatTokenCounter as TokenCounter"
    );
  });
});
