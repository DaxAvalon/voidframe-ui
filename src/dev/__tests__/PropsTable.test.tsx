import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { PropsTable, type ComponentDoc } from "../PropsTable";

const FIXTURE: ComponentDoc = {
  name: "Demo",
  description: "Fixture component",
  props: [
    {
      name: "value",
      type: "string",
      required: true,
      description: "Controlled value.",
    },
    {
      name: "onChange",
      type: "(v: string) => void",
      required: true,
      description: "Change handler.",
    },
    {
      name: "label",
      type: "string",
      description: "Optional label.",
    },
    {
      name: "size",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
  ],
};

describe("PropsTable", () => {
  it("renders a row per prop", () => {
    const { container } = renderWithTheme(<PropsTable doc={FIXTURE} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(FIXTURE.props.length);
  });

  it("marks required props with an asterisk", () => {
    const { container } = renderWithTheme(<PropsTable doc={FIXTURE} />);
    const required = container.querySelectorAll(".vf-props-table__required");
    expect(required.length).toBe(2);
  });

  it("sorts required props before optional", () => {
    const { container } = renderWithTheme(<PropsTable doc={FIXTURE} />);
    const names = Array.from(
      container.querySelectorAll(".vf-props-table__name")
    ).map((el) => el.textContent?.replace(/\*/g, "").trim());
    // The first two should be the required props (sorted alphabetically).
    expect(names.slice(0, 2).sort()).toEqual(["onChange", "value"]);
  });

  it("respects `only` filter", () => {
    const { container } = renderWithTheme(
      <PropsTable doc={FIXTURE} only={["label"]} />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0]?.textContent).toContain("label");
  });

  it("respects `exclude` filter", () => {
    const { container } = renderWithTheme(
      <PropsTable doc={FIXTURE} exclude={["onChange", "value"]} />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);
  });

  it("renders empty-state when no props survive filtering", () => {
    const { container } = renderWithTheme(
      <PropsTable doc={{ name: "Empty", props: [] }} />
    );
    expect(container.querySelector(".vf-props-table__empty")).toBeTruthy();
  });

  it("renders default values as code", () => {
    const { container } = renderWithTheme(<PropsTable doc={FIXTURE} />);
    const codes = Array.from(
      container.querySelectorAll(".vf-props-table__default code")
    ).map((el) => el.textContent);
    expect(codes).toContain('"md"');
  });
});
