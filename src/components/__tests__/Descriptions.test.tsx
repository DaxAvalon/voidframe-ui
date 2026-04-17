import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Descriptions, type DescriptionItem } from "../Descriptions";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const items: DescriptionItem[] = [
  { key: "name", label: "Name", value: "Alice" },
  { key: "email", label: "Email", value: "alice@example.com" },
  { key: "role", label: "Role", value: "Admin" },
  { key: "bio", label: "Bio", value: "A long biography text", span: 2 },
];

describe("Descriptions", () => {
  it("renders items with labels and values", () => {
    renderWithTheme(<Descriptions items={items} />);
    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("renders title", () => {
    renderWithTheme(<Descriptions items={items} title="User Info" />);
    expect(screen.getByText("User Info")).toBeInTheDocument();
  });

  it("columns controls grid template", () => {
    const { container } = renderWithTheme(
      <Descriptions items={items} columns={2} />
    );
    const list = container.querySelector(
      ".vf-descriptions__list"
    ) as HTMLElement;
    expect(list.style.gridTemplateColumns).toContain("repeat(2");
  });

  it("span allows items to span multiple columns", () => {
    const { container } = renderWithTheme(
      <Descriptions items={items} columns={3} />
    );
    const spanItem = container.querySelectorAll(".vf-descriptions__item")[3];
    expect(spanItem).toBeInTheDocument();
    expect((spanItem as HTMLElement).style.gridColumn).toContain("span");
  });

  it("bordered variant applies class", () => {
    const { container } = renderWithTheme(
      <Descriptions items={items} bordered />
    );
    expect(
      container.querySelector(".vf-descriptions--bordered")
    ).toBeInTheDocument();
  });

  it("vertical layout applies class", () => {
    const { container } = renderWithTheme(
      <Descriptions items={items} layout="vertical" />
    );
    expect(
      container.querySelector(".vf-descriptions--vertical")
    ).toBeInTheDocument();
  });

  it("horizontal layout is default", () => {
    const { container } = renderWithTheme(
      <Descriptions items={items} />
    );
    expect(
      container.querySelector(".vf-descriptions--horizontal")
    ).toBeInTheDocument();
  });

  it("colon={false} omits colon after label", () => {
    renderWithTheme(
      <Descriptions items={[{ key: "a", label: "Foo", value: "Bar" }]} colon={false} />
    );
    expect(screen.getByText("Foo")).toBeInTheDocument();
    expect(screen.queryByText("Foo:")).not.toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(
      <Descriptions items={items} size={size} />
    );
    expect(
      container.querySelector(`.vf-descriptions--${size}`)
    ).toBeInTheDocument();
  });

  it("renders ReactNode values", () => {
    const richItems: DescriptionItem[] = [
      {
        key: "link",
        label: "Website",
        value: <a href="https://example.com">example.com</a>,
      },
    ];
    renderWithTheme(<Descriptions items={richItems} />);
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("uses semantic dl/dt/dd elements", () => {
    const { container } = renderWithTheme(<Descriptions items={items} />);
    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelectorAll("dt").length).toBeGreaterThan(0);
    expect(container.querySelectorAll("dd").length).toBeGreaterThan(0);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Descriptions items={items} title="Details" />
    );
    await expectNoA11yViolations(container);
  });
});
