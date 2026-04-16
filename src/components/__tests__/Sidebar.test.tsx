import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Sidebar } from "../Sidebar";

describe("Sidebar", () => {
  it("renders as an aside with aria-label", () => {
    const { container } = renderWithTheme(<Sidebar>content</Sidebar>);
    const aside = container.querySelector("aside");
    expect(aside).toBeTruthy();
    expect(aside?.getAttribute("aria-label")).toBe("Sidebar");
  });

  it("renders children", () => {
    const { container } = renderWithTheme(
      <Sidebar>
        <span data-testid="child">hello</span>
      </Sidebar>
    );
    expect(container.querySelector("[data-testid='child']")).toBeTruthy();
  });

  it("accepts className", () => {
    const { container } = renderWithTheme(
      <Sidebar className="my-sidebar">x</Sidebar>
    );
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("my-sidebar");
  });

  it("applies collapsed class when collapsed=true", () => {
    const { container } = renderWithTheme(
      <Sidebar collapsed>x</Sidebar>
    );
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("vf-sidebar--collapsed");
  });

  it("renders Brand subcomponent", () => {
    const { container } = renderWithTheme(
      <Sidebar>
        <Sidebar.Brand>Logo</Sidebar.Brand>
      </Sidebar>
    );
    expect(container.querySelector(".vf-sidebar__brand")).toBeTruthy();
  });

  it("renders Section with label", () => {
    const { container } = renderWithTheme(
      <Sidebar>
        <Sidebar.Section label="Nav">
          <a href="/">Home</a>
        </Sidebar.Section>
      </Sidebar>
    );
    expect(container.querySelector(".vf-sidebar__section")).toBeTruthy();
    expect(container.querySelector(".vf-sidebar__section-label")).toBeTruthy();
  });

  it("hides Section label when collapsed", () => {
    const { container } = renderWithTheme(
      <Sidebar collapsed>
        <Sidebar.Section label="Nav">
          <a href="/">Home</a>
        </Sidebar.Section>
      </Sidebar>
    );
    expect(container.querySelector(".vf-sidebar__section-label")).toBeNull();
  });

  it("renders Separator", () => {
    const { container } = renderWithTheme(
      <Sidebar>
        <Sidebar.Separator />
      </Sidebar>
    );
    const sep = container.querySelector(".vf-sidebar__separator");
    expect(sep).toBeTruthy();
    expect(sep?.getAttribute("role")).toBe("separator");
  });

  it("renders Footer", () => {
    const { container } = renderWithTheme(
      <Sidebar>
        <Sidebar.Footer>footer</Sidebar.Footer>
      </Sidebar>
    );
    expect(container.querySelector(".vf-sidebar__footer")).toBeTruthy();
  });
});
