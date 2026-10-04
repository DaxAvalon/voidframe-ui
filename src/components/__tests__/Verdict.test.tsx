import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Verdict, verdictTone, type VerdictKind } from "../Verdict";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const ALL: VerdictKind[] = ["pass", "warn", "fail", "flagged", "skipped"];

describe("verdictTone", () => {
  it("maps every verdict to a badge tone", () => {
    expect(ALL.map(verdictTone)).toEqual(["success", "warning", "danger", "warning", "neutral"]);
  });
});

describe("Verdict", () => {
  it("renders the word as text and the glyph as decoration for every verdict", () => {
    const { container } = renderWithTheme(
      <div>
        {ALL.map((v) => (
          <Verdict key={v} verdict={v} data-testid={`v-${v}`} />
        ))}
      </div>
    );
    for (const v of ALL) {
      const el = screen.getByTestId(`v-${v}`);
      expect(el).toHaveAttribute("data-verdict", v);
      expect(el.querySelector(".vf-badge")).toHaveAttribute("data-tone", verdictTone(v));
      expect(el.querySelector(".vf-badge__label")).toHaveTextContent(v);
      expect(el.querySelector(".vf-badge__icon")).toHaveAttribute("aria-hidden", "true");
    }
    expect(container.querySelectorAll(".vf-verdict")).toHaveLength(5);
  });

  it("links the explanation to the badge", () => {
    renderWithTheme(<Verdict verdict="fail" explanation="Too noisy in the pauses." data-testid="v" />);
    const badge = screen.getByTestId("v").querySelector(".vf-badge")!;
    const id = badge.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent("Too noisy in the pauses.");
  });

  it("has no aria-describedby without an explanation", () => {
    renderWithTheme(<Verdict verdict="pass" data-testid="v" />);
    expect(screen.getByTestId("v").querySelector(".vf-badge")).not.toHaveAttribute("aria-describedby");
  });

  it("renders measured and required with hidden labels and a decorative separator", () => {
    renderWithTheme(<Verdict verdict="warn" measured="-18.4 dB RMS" required="-23 to -18 dB RMS" data-testid="v" />);
    const el = screen.getByTestId("v");
    expect(el.querySelector(".vf-verdict__measured")).toHaveTextContent("measured -18.4 dB RMS");
    expect(el.querySelector(".vf-verdict__required")).toHaveTextContent("required -23 to -18 dB RMS");
    expect(el.querySelector(".vf-verdict__numbers [aria-hidden='true']")).toHaveTextContent("·");
  });

  it("omits the numbers block when neither value is given", () => {
    renderWithTheme(<Verdict verdict="pass" explanation="OK." data-testid="v" />);
    expect(screen.getByTestId("v").querySelector(".vf-verdict__numbers")).toBeNull();
  });

  it("passes the size to the badge and the root", () => {
    renderWithTheme(<Verdict verdict="pass" size="lg" data-testid="v" />);
    const el = screen.getByTestId("v");
    expect(el).toHaveClass("vf-verdict--lg");
    expect(el.querySelector(".vf-badge")).toHaveAttribute("data-size", "lg");
  });

  it("renders the word as written with wordCase lower, and a custom label", () => {
    renderWithTheme(<Verdict verdict="flagged" wordCase="lower" label="markiert" data-testid="v" />);
    const badge = screen.getByTestId("v").querySelector<HTMLElement>(".vf-badge")!;
    expect(badge.style.textTransform).toBe("none");
    expect(badge).toHaveTextContent("markiert");
    expect(screen.getByTestId("v")).toHaveAttribute("data-verdict", "flagged");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <div>
        <Verdict verdict="pass" explanation="OK." />
        <Verdict verdict="warn" measured="-18.4 dB RMS" required="-23 to -18 dB RMS" explanation="Near the edge of the window." />
        <Verdict verdict="fail" measured="-54 dB RMS" required="≤ -60 dB RMS" explanation="Too noisy in the pauses." />
        <Verdict verdict="flagged" explanation="Louder than the rest of the book." />
        <Verdict verdict="skipped" explanation="Too short to measure." size="sm" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
