import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { Verdict, VerdictCallout, VERDICT_KINDS, verdictTone, type VerdictKinds } from "../Verdict";
import { StatusStrip, collapseSegments } from "../StatusStrip";

const REVIEW: VerdictKinds = {
  accept: { tone: "success", glyph: "✓", word: "accepted" },
  "needs-approval": { tone: "info", glyph: "◷", word: "needs approval" },
  reject: { tone: "danger", glyph: "✕", word: "rejected" },
};

describe("Verdict vocabularies", () => {
  it("renders a consumer vocabulary with its tone, glyph and word", () => {
    renderWithTheme(<Verdict verdict="needs-approval" kinds={REVIEW} data-testid="v" />);
    const v = screen.getByTestId("v");
    expect(v).toHaveAttribute("data-verdict", "needs-approval");
    expect(v).toHaveAttribute("data-tone", "info");
    expect(v.textContent).toContain("needs approval");
    expect(v.textContent).toContain("◷");
    expect(verdictTone("reject", REVIEW)).toBe("danger");
    expect(verdictTone("pass")).toBe("success");
    expect(verdictTone("unknown")).toBe("neutral");
  });

  it("built-ins still work alongside a vocabulary and tone/glyph override", () => {
    renderWithTheme(<Verdict verdict="skipped" kinds={REVIEW} data-testid="a" />);
    expect(screen.getByTestId("a")).toHaveAttribute("data-tone", "neutral");
    renderWithTheme(<Verdict verdict="pass" tone="warning" glyph="~" data-testid="b" />);
    const b = screen.getByTestId("b");
    expect(b).toHaveAttribute("data-tone", "warning");
    expect(b.textContent).toContain("~");
    expect(Object.keys(VERDICT_KINDS)).toEqual(["pass", "warn", "fail", "flagged", "skipped", "pending"]);
  });
});

describe("VerdictCallout", () => {
  it("renders headline, reasons with per-reason verdicts, body, details and actions", () => {
    const onRerun = vi.fn();
    renderWithTheme(
      <VerdictCallout
        verdict="reject"
        kinds={REVIEW}
        headline="Noise floor above the limit"
        measured="-54 dB"
        required="≤ -60 dB"
        reasons={["Room tone too loud", { text: "Peaks clipped", verdict: "accept" }, null]}
        details={<pre>raw log</pre>}
        actions={<button type="button" onClick={onRerun}>Re-run</button>}
        headingAs="h3"
        data-testid="c"
      >
        Re-record the first paragraph.
      </VerdictCallout>
    );
    const c = screen.getByTestId("c");
    expect(c).toHaveAttribute("data-tone", "danger");
    expect(c).toHaveAttribute("data-verdict", "reject");
    expect(screen.getByRole("heading", { level: 3 }).textContent).toContain("rejected");
    expect(screen.getByText("Noise floor above the limit")).toBeInTheDocument();
    expect(screen.getByText("-54 dB")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(c.querySelectorAll(".vf-verdict-callout__reason-verdict")).toHaveLength(1);
    expect(screen.getByText("Re-record the first paragraph.")).toBeInTheDocument();
    expect(screen.queryByText("raw log")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Details/ }));
    expect(screen.getByText("raw log")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Re-run"));
    expect(onRerun).toHaveBeenCalled();
  });

  it("omits the reasons block and details when not given", () => {
    const { container } = renderWithTheme(<VerdictCallout verdict="pass" headline="All clear" />);
    expect(container.querySelector(".vf-verdict-callout__reasons")).toBeNull();
    expect(container.querySelector(".vf-verdict-callout__details")).toBeNull();
    expect(container.querySelector(".vf-verdict-callout")).toHaveAttribute("data-tone", "success");
  });
});

describe("StatusStrip collapse", () => {
  const segments = [
    { id: "iface", value: "Scarlett", priority: 1 },
    { id: "rate", value: "48 kHz", priority: 3 },
    { id: "latency", label: "latency", value: "6 ms", priority: 2 },
    { id: "drop", label: "dropouts", value: "0" },
    { id: "saved", value: "saved 20 s ago", priority: 1 },
  ];

  it("collapseSegments drops lowest priority first, ties from the end, never unprioritised", () => {
    const widths = new Map(segments.map((s) => [s.id, 100]));
    expect(collapseSegments(segments, widths, 1000)).toEqual([]);
    expect(collapseSegments(segments, widths, 450)).toEqual(["saved"]);
    expect(collapseSegments(segments, widths, 350)).toEqual(["saved", "iface"]);
    expect(collapseSegments(segments, widths, 150)).toEqual(["saved", "iface", "latency", "rate"]);
    expect(collapseSegments(segments, widths, 50)).toEqual(["saved", "iface", "latency", "rate"]);
    expect(collapseSegments(segments, widths, 0)).toEqual([]);
  });

  it("hides segments to fit the measured width and reports the change", () => {
    const onCollapseChange = vi.fn();
    const originalRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const width = this.tagName === "UL" ? 250 : 100;
      return { width, height: 20, top: 0, left: 0, right: width, bottom: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    try {
      renderWithTheme(<StatusStrip segments={segments} collapse onCollapseChange={onCollapseChange} />);
      const list = screen.getByRole("list", { name: "Status" });
      expect(list).toHaveClass("vf-status-strip--collapse");
      const hidden = Array.from(list.querySelectorAll("li[hidden]")).map((li) => li.getAttribute("data-segment"));
      expect(hidden).toEqual(["iface", "latency", "saved"]);
      expect(screen.getByText("48 kHz")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(onCollapseChange).toHaveBeenLastCalledWith(["saved", "iface", "latency"]);
    } finally {
      Element.prototype.getBoundingClientRect = originalRect;
    }
  });

  it("without collapse nothing is hidden and wrap still applies", () => {
    renderWithTheme(<StatusStrip segments={segments} wrap />);
    const list = screen.getByRole("list", { name: "Status" });
    expect(list).toHaveClass("vf-status-strip--wrap");
    expect(list.querySelectorAll("li[hidden]")).toHaveLength(0);
    act(() => undefined);
  });
});
