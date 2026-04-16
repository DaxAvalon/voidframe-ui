import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
} from "../SkeletonComposites";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

// ── SkeletonText ────────────────────────────────────────────

describe("SkeletonText", () => {
  it("renders correct number of lines (default 3)", () => {
    renderWithTheme(<SkeletonText />);
    const root = screen.getByRole("status");
    const lines = root.querySelectorAll(".vf-skeleton-text__line");
    expect(lines).toHaveLength(3);
  });

  it("last line has reduced width", () => {
    renderWithTheme(<SkeletonText />);
    const root = screen.getByRole("status");
    const lines = root.querySelectorAll(".vf-skeleton-text__line");
    const lastLine = lines[lines.length - 1] as HTMLElement;
    expect(lastLine.style.width).toBe("60%");
  });

  it("custom lines count", () => {
    renderWithTheme(<SkeletonText lines={5} />);
    const root = screen.getByRole("status");
    const lines = root.querySelectorAll(".vf-skeleton-text__line");
    expect(lines).toHaveLength(5);
  });

  it.each(["sm", "md", "lg"] as const)("size=%s applies class", (size) => {
    renderWithTheme(<SkeletonText size={size} />);
    const root = screen.getByRole("status");
    expect(root.className).toContain(`vf-skeleton-text--${size}`);
  });
});

// ── SkeletonAvatar ──────────────────────────────────────────

describe("SkeletonAvatar", () => {
  it("renders circle by default", () => {
    renderWithTheme(<SkeletonAvatar />);
    const el = screen.getByRole("status");
    expect(el.className).toContain("vf-skeleton-avatar--circle");
  });

  it("shape=square applies class", () => {
    renderWithTheme(<SkeletonAvatar shape="square" />);
    const el = screen.getByRole("status");
    expect(el.className).toContain("vf-skeleton-avatar--square");
    expect(el.className).not.toContain("vf-skeleton-avatar--circle");
  });

  it.each(["sm", "md", "lg", "xl"] as const)("size=%s applies class", (size) => {
    renderWithTheme(<SkeletonAvatar size={size} />);
    const el = screen.getByRole("status");
    expect(el.className).toContain(`vf-skeleton-avatar--${size}`);
  });
});

// ── SkeletonButton ──────────────────────────────────────────

describe("SkeletonButton", () => {
  it("renders button-shaped skeleton", () => {
    renderWithTheme(<SkeletonButton />);
    const el = screen.getByRole("status");
    expect(el.className).toContain("vf-skeleton-button");
    expect(el.className).toContain("vf-skeleton-button--md");
  });

  it("custom width", () => {
    renderWithTheme(<SkeletonButton width="200px" />);
    const el = screen.getByRole("status");
    expect(el.style.width).toBe("200px");
  });
});

// ── SkeletonCard ────────────────────────────────────────────

describe("SkeletonCard", () => {
  it("renders with text lines", () => {
    renderWithTheme(<SkeletonCard />);
    const root = screen.getByRole("status");
    const lines = root.querySelectorAll(".vf-skeleton-card__line");
    expect(lines).toHaveLength(3);
  });

  it("hasImage adds image placeholder", () => {
    renderWithTheme(<SkeletonCard hasImage />);
    const root = screen.getByRole("status");
    expect(root.querySelector(".vf-skeleton-card__image")).toBeInTheDocument();
  });

  it("hasActions adds action placeholders", () => {
    renderWithTheme(<SkeletonCard hasActions />);
    const root = screen.getByRole("status");
    const actions = root.querySelectorAll(".vf-skeleton-card__action");
    expect(actions.length).toBeGreaterThanOrEqual(1);
  });
});

// ── SkeletonTable ───────────────────────────────────────────

describe("SkeletonTable", () => {
  it("renders correct rows and columns", () => {
    renderWithTheme(<SkeletonTable rows={3} columns={2} hasHeader={false} />);
    const root = screen.getByRole("status");
    const cells = root.querySelectorAll(".vf-skeleton-table__cell");
    expect(cells).toHaveLength(3 * 2);
  });

  it("hasHeader adds header row", () => {
    renderWithTheme(<SkeletonTable rows={2} columns={3} />);
    const root = screen.getByRole("status");
    const headerCells = root.querySelectorAll(".vf-skeleton-table__header-cell");
    expect(headerCells).toHaveLength(3);
    const bodyCells = root.querySelectorAll(".vf-skeleton-table__cell");
    expect(bodyCells).toHaveLength(2 * 3);
  });
});

// ── SkeletonForm ────────────────────────────────────────────

describe("SkeletonForm", () => {
  it("renders fields", () => {
    renderWithTheme(<SkeletonForm fields={4} />);
    const root = screen.getByRole("status");
    const fields = root.querySelectorAll(".vf-skeleton-form__field");
    expect(fields).toHaveLength(4);
  });

  it("hasSubmit adds button", () => {
    renderWithTheme(<SkeletonForm />);
    const root = screen.getByRole("status");
    expect(root.querySelector(".vf-skeleton-form__submit")).toBeInTheDocument();
  });

  it("hasSubmit=false omits button", () => {
    renderWithTheme(<SkeletonForm hasSubmit={false} />);
    const root = screen.getByRole("status");
    expect(root.querySelector(".vf-skeleton-form__submit")).not.toBeInTheDocument();
  });
});

// ── Shared: aria-busy ───────────────────────────────────────

describe("all composites have aria-busy", () => {
  it("all have aria-busy=true", () => {
    const { unmount: u1 } = renderWithTheme(<SkeletonText data-testid="st" />);
    expect(screen.getByTestId("st")).toHaveAttribute("aria-busy", "true");
    u1();

    const { unmount: u2 } = renderWithTheme(<SkeletonAvatar data-testid="sa" />);
    expect(screen.getByTestId("sa")).toHaveAttribute("aria-busy", "true");
    u2();

    const { unmount: u3 } = renderWithTheme(<SkeletonButton data-testid="sb" />);
    expect(screen.getByTestId("sb")).toHaveAttribute("aria-busy", "true");
    u3();

    const { unmount: u4 } = renderWithTheme(<SkeletonCard data-testid="sc" />);
    expect(screen.getByTestId("sc")).toHaveAttribute("aria-busy", "true");
    u4();

    const { unmount: u5 } = renderWithTheme(<SkeletonTable data-testid="stb" />);
    expect(screen.getByTestId("stb")).toHaveAttribute("aria-busy", "true");
    u5();

    const { unmount: u6 } = renderWithTheme(<SkeletonForm data-testid="sf" />);
    expect(screen.getByTestId("sf")).toHaveAttribute("aria-busy", "true");
    u6();
  });
});

// ── a11y ────────────────────────────────────────────────────

describe("a11y", () => {
  it("SkeletonText has no a11y violations", async () => {
    const { container } = renderWithTheme(<SkeletonText />);
    await expectNoA11yViolations(container);
  });

  it("SkeletonAvatar has no a11y violations", async () => {
    const { container } = renderWithTheme(<SkeletonAvatar />);
    await expectNoA11yViolations(container);
  });

  it("SkeletonButton has no a11y violations", async () => {
    const { container } = renderWithTheme(<SkeletonButton />);
    await expectNoA11yViolations(container);
  });

  it("SkeletonCard has no a11y violations", async () => {
    const { container } = renderWithTheme(<SkeletonCard hasImage hasActions />);
    await expectNoA11yViolations(container);
  });

  it("SkeletonTable has no a11y violations", async () => {
    const { container } = renderWithTheme(<SkeletonTable />);
    await expectNoA11yViolations(container);
  });

  it("SkeletonForm has no a11y violations", async () => {
    const { container } = renderWithTheme(<SkeletonForm />);
    await expectNoA11yViolations(container);
  });
});
