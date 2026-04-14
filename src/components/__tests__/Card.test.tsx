import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Card, ScrollRow, SegmentBar, StatusBar } from "../Card";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Card", () => {
  it("renders children", () => {
    renderWithTheme(<Card>inside</Card>);
    expect(screen.getByText("inside")).toBeInTheDocument();
  });

  it("renders title and subtitle when given", () => {
    renderWithTheme(
      <Card title="HEADER" subtitle="hello subtitle">
        body
      </Card>
    );
    expect(screen.getByText("HEADER")).toBeInTheDocument();
    expect(screen.getByText("hello subtitle")).toBeInTheDocument();
  });

  it("renders headerRight slot", () => {
    renderWithTheme(
      <Card title="T" headerRight={<span>ACTION</span>}>
        body
      </Card>
    );
    expect(screen.getByText("ACTION")).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Card title="Accessible" subtitle="With content">
        body
      </Card>
    );
    await expectNoA11yViolations(container);
  });
});

describe("ScrollRow", () => {
  it("uses the .vf-scroll-row class", () => {
    const { root } = renderWithTheme(
      <ScrollRow>
        <div>a</div>
        <div>b</div>
      </ScrollRow>
    );
    expect(root()).toHaveClass("vf-scroll-row");
  });
});

describe("StatusBar", () => {
  it("renders every item's label and value", () => {
    renderWithTheme(
      <StatusBar
        items={[
          { label: "ENV", value: "PROD" },
          { label: "REGION", value: "US-EAST-1" },
        ]}
      />
    );
    expect(screen.getByText("ENV")).toBeInTheDocument();
    expect(screen.getByText("PROD")).toBeInTheDocument();
    expect(screen.getByText("REGION")).toBeInTheDocument();
    expect(screen.getByText("US-EAST-1")).toBeInTheDocument();
  });

  it("renders an item with only a value", () => {
    renderWithTheme(<StatusBar items={[{ value: "orphan" }]} />);
    expect(screen.getByText("orphan")).toBeInTheDocument();
  });
});

describe("SegmentBar", () => {
  it("distributes widths proportional to span", () => {
    const { root } = renderWithTheme(
      <SegmentBar
        segments={[
          { label: "A", span: 1 },
          { label: "B", span: 3 },
        ]}
      />
    );
    const segs = Array.from(root().children) as HTMLElement[];
    // Total = 4; A = 25%, B = 75%
    expect(segs[0]!.style.width).toBe("25%");
    expect(segs[1]!.style.width).toBe("75%");
  });
});
