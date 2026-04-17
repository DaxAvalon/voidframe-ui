import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";
import { EnvironmentVars, type EnvVar } from "../EnvironmentVars";

const sampleVars: EnvVar[] = [
  { key: "DATABASE_URL", value: "postgres://localhost:5432/db", type: "url" },
  { key: "API_KEY", value: "sk-secret-123", secret: true, type: "string" },
  {
    key: "NODE_ENV",
    value: "production",
    type: "string",
    group: "runtime",
    inherited: true,
  },
];

describe("EnvironmentVars", () => {
  it("renders all variables", () => {
    renderWithTheme(<EnvironmentVars variables={sampleVars} />);
    expect(screen.getByText("DATABASE_URL")).toBeInTheDocument();
    expect(screen.getByText("API_KEY")).toBeInTheDocument();
    expect(screen.getByText("NODE_ENV")).toBeInTheDocument();
  });

  it("masks secret values", () => {
    renderWithTheme(<EnvironmentVars variables={sampleVars} />);
    // The secret value should be masked
    expect(screen.getByText("\u2022\u2022\u2022\u2022\u2022")).toBeInTheDocument();
    // The non-secret value should be visible
    expect(
      screen.getByText("postgres://localhost:5432/db")
    ).toBeInTheDocument();
  });

  it("reveal toggle shows secret value", async () => {
    renderWithTheme(<EnvironmentVars variables={sampleVars} />);
    const revealBtn = screen.getByLabelText("Reveal value");
    await userEvent.click(revealBtn);
    expect(screen.getByText("sk-secret-123")).toBeInTheDocument();
  });

  it("copy button is present when copyable", () => {
    renderWithTheme(<EnvironmentVars variables={sampleVars} copyable />);
    const copyBtns = screen.getAllByText("Copy");
    expect(copyBtns.length).toBeGreaterThan(0);
  });

  it("fires onChange on value edit", async () => {
    const handleChange = vi.fn();
    const vars: EnvVar[] = [
      { key: "FOO", value: "bar" },
    ];
    renderWithTheme(
      <EnvironmentVars variables={vars} onChange={handleChange} />
    );
    // Click on value to start editing
    const valueEl = screen.getByText("bar");
    await userEvent.click(valueEl);
    const input = screen.getByLabelText("Edit value for FOO");
    await userEvent.clear(input);
    await userEvent.type(input, "baz");
    fireEvent.blur(input);
    expect(handleChange).toHaveBeenCalledWith([{ key: "FOO", value: "baz" }]);
  });

  it("fires onAdd when adding a variable", async () => {
    const handleAdd = vi.fn();
    renderWithTheme(
      <EnvironmentVars variables={[]} onAdd={handleAdd} addable />
    );
    const keyInput = screen.getByLabelText("New variable key");
    const valInput = screen.getByLabelText("New variable value");
    await userEvent.type(keyInput, "NEW_KEY");
    await userEvent.type(valInput, "new_value");
    await userEvent.click(screen.getByLabelText("Add variable"));
    expect(handleAdd).toHaveBeenCalledWith({
      key: "NEW_KEY",
      value: "new_value",
    });
  });

  it("fires onRemove when removing a variable", async () => {
    const handleRemove = vi.fn();
    const vars: EnvVar[] = [{ key: "FOO", value: "bar" }];
    renderWithTheme(
      <EnvironmentVars variables={vars} onRemove={handleRemove} />
    );
    await userEvent.click(screen.getByLabelText("Remove FOO"));
    expect(handleRemove).toHaveBeenCalledWith("FOO");
  });

  it("readOnly hides edit/add/delete controls", () => {
    renderWithTheme(
      <EnvironmentVars variables={sampleVars} readOnly onRemove={vi.fn()} />
    );
    expect(screen.queryByLabelText("Add variable")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Remove DATABASE_URL")).not.toBeInTheDocument();
  });

  it("search filters by key", async () => {
    renderWithTheme(
      <EnvironmentVars variables={sampleVars} searchable />
    );
    const searchInput = screen.getByLabelText("Search variables");
    await userEvent.type(searchInput, "API");
    expect(screen.getByText("API_KEY")).toBeInTheDocument();
    expect(screen.queryByText("DATABASE_URL")).not.toBeInTheDocument();
  });

  it("groupBy renders group headers", () => {
    const vars: EnvVar[] = [
      { key: "A", value: "1", group: "secrets" },
      { key: "B", value: "2", group: "runtime" },
    ];
    renderWithTheme(
      <EnvironmentVars variables={vars} groupBy="group" />
    );
    expect(screen.getByText("secrets")).toBeInTheDocument();
    expect(screen.getByText("runtime")).toBeInTheDocument();
  });

  it("shows type badges when showTypes is true", () => {
    renderWithTheme(
      <EnvironmentVars variables={sampleVars} showTypes />
    );
    const badges = document.querySelectorAll(".vf-env-vars__type-badge");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("inherited vars are dimmed and not editable", () => {
    renderWithTheme(
      <EnvironmentVars variables={sampleVars} onRemove={vi.fn()} />
    );
    const inheritedRow = document.querySelector(
      '.vf-env-vars__row[data-inherited="true"]'
    );
    expect(inheritedRow).toBeInTheDocument();
    expect(inheritedRow?.classList.contains("vf-env-vars__row--inherited")).toBe(
      true
    );
    // Should not have a remove button for inherited
    expect(
      screen.queryByLabelText("Remove NODE_ENV")
    ).not.toBeInTheDocument();
  });

  it.each(["sm", "md"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(
      <EnvironmentVars variables={[]} size={size} />
    );
    expect(
      container.querySelector(`.vf-env-vars--${size}`)
    ).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <EnvironmentVars variables={sampleVars} />
    );
    await expectNoA11yViolations(container);
  });
});
