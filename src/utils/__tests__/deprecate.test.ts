import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deprecatedComponent, deprecatedProp } from "../deprecate";
import { _resetWarnings, getLogger, setLogger } from "../warn";

describe("deprecatedProp", () => {
  let logged: unknown[][];
  const original = getLogger();

  beforeEach(() => {
    logged = [];
    setLogger({ warn: (...args) => logged.push(args) });
    _resetWarnings();
  });

  afterEach(() => {
    setLogger(original);
  });

  it("warns once per (component, prop) pair", () => {
    deprecatedProp("Button", "color", "accent", "v2.0");
    deprecatedProp("Button", "color", "accent", "v2.0");
    expect(logged).toHaveLength(1);
  });

  it("mentions old name, new name, and target version", () => {
    deprecatedProp("Toggle", "active", "checked", "v2.1");
    const msg = String(logged[0]?.[0] ?? "");
    expect(msg).toContain("Toggle");
    expect(msg).toContain("active");
    expect(msg).toContain("checked");
    expect(msg).toContain("v2.1");
  });

  it("tracks (component, prop) pairs independently", () => {
    deprecatedProp("Button", "old1", "new1", "v2.0");
    deprecatedProp("Button", "old2", "new2", "v2.0");
    deprecatedProp("Input", "old1", "new1", "v2.0");
    expect(logged).toHaveLength(3);
  });
});

describe("deprecatedComponent", () => {
  let logged: unknown[][];
  const original = getLogger();

  beforeEach(() => {
    logged = [];
    setLogger({ warn: (...args) => logged.push(args) });
    _resetWarnings();
  });

  afterEach(() => {
    setLogger(original);
  });

  it("warns once per component", () => {
    deprecatedComponent("OldModal", "Modal", "v2.0");
    deprecatedComponent("OldModal", "Modal", "v2.0");
    expect(logged).toHaveLength(1);
  });

  it("includes the replacement component name", () => {
    deprecatedComponent("OldBadge", "Badge", "v3.0");
    const msg = String(logged[0]?.[0] ?? "");
    expect(msg).toContain("OldBadge");
    expect(msg).toContain("Badge");
    expect(msg).toContain("v3.0");
  });
});
