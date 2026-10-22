import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { CheckList, checkListSummary, type CheckListItem } from "../CheckList";
import { FactRow } from "../FactRow";
import { Verdict, verdictTone } from "../Verdict";

const report: CheckListItem[] = [
  { id: "peak", label: "Peaks under −3 dBFS", verdict: "pass", measured: "−4.1 dBFS", required: "≤ −3 dBFS" },
  { id: "floor", label: "Noise floor under −60 dB", verdict: "warn", explanation: "Close to the limit." },
  { id: "rt", label: "Room tone captured", verdict: "pending" },
  { id: "clip", label: "No clipping", verdict: "fail", action: <button>Re-record</button> },
];

describe("Verdict pending", () => {
  it("is an info-toned verdict with a glyph and the word", () => {
    expect(verdictTone("pending")).toBe("info");
    const { container } = renderWithTheme(<Verdict verdict="pending" />);
    expect(container.querySelector(".vf-verdict--pending")).toBeTruthy();
    expect(container.textContent).toContain("pending");
  });
});

describe("checkListSummary", () => {
  it("counts and derives canProceed from blocking fails and pendings", () => {
    expect(checkListSummary(report)).toEqual({ total: 4, passed: 1, failed: 1, pending: 1, canProceed: false });
    expect(checkListSummary([{ id: "a", label: "a", verdict: "pass" }, { id: "b", label: "b", verdict: "warn" }]).canProceed).toBe(true);
    expect(checkListSummary([{ id: "b", label: "b", verdict: "warn", blocking: true }]).canProceed).toBe(false);
    expect(checkListSummary([{ id: "c", label: "c", verdict: "fail", blocking: false }]).canProceed).toBe(true);
    expect(checkListSummary([{ id: "c", label: "c", verdict: "skipped", blocking: true }]).canProceed).toBe(true);
  });

  it("editable mode derives verdicts from checked", () => {
    const items: CheckListItem[] = [{ id: "a", label: "a", checked: true }, { id: "b", label: "b" }];
    expect(checkListSummary(items, true)).toEqual({ total: 2, passed: 1, failed: 0, pending: 1, canProceed: false });
    expect(checkListSummary([{ id: "a", label: "a", checked: true }], true).canProceed).toBe(true);
  });
});

describe("CheckList report mode", () => {
  it("renders verdict rows with sentences, actions, progress and a gated proceed button", async () => {
    const onProceed = vi.fn();
    const onSummary = vi.fn();
    renderWithTheme(
      <CheckList items={report} title="Session check" proceed={{ label: "Start", onClick: onProceed, blockedHint: "Fix the failing checks" }} onSummary={onSummary} />
    );
    expect(screen.getByRole("heading", { name: "Session check" })).toBeInTheDocument();
    const rows = document.querySelectorAll(".vf-checklist__row");
    expect(rows.length).toBe(4);
    expect(rows[3]).toHaveAttribute("data-verdict", "fail");
    expect(rows[3]).toHaveClass("vf-checklist__row--fail");
    expect(screen.getByText("Peaks under −3 dBFS")).toBeInTheDocument();
    expect(screen.getByText("Close to the limit.")).toHaveClass("vf-checklist__explanation");
    expect(screen.getByRole("button", { name: "Re-record" })).toBeInTheDocument();
    expect(screen.getByLabelText("1 of 4 passed")).toHaveTextContent("1/4");
    const start = screen.getByRole("button", { name: "Start" });
    expect(start).toBeDisabled();
    expect(screen.getByText("Fix the failing checks")).toBeInTheDocument();
    expect(document.querySelector(".vf-checklist")).toHaveAttribute("data-can-proceed", "false");
    expect(onSummary).toHaveBeenLastCalledWith(expect.objectContaining({ canProceed: false, passed: 1 }));
    await userEvent.click(start);
    expect(onProceed).not.toHaveBeenCalled();
  });

  it("enables proceed when nothing blocks", async () => {
    const onProceed = vi.fn();
    renderWithTheme(
      <CheckList items={[{ id: "a", label: "ok", verdict: "pass" }, { id: "b", label: "meh", verdict: "warn" }]} proceed={{ label: "Go", onClick: onProceed }} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onProceed).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("1 of 2 passed")).toBeInTheDocument();
  });
});

describe("CheckList editable mode", () => {
  it("rows are checkboxes; toggle, remove and add fire with ids and labels", async () => {
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    const onAdd = vi.fn();
    renderWithTheme(
      <CheckList
        items={[{ id: "a", label: "Warm up", checked: true }, { id: "b", label: "Water" }]}
        onToggle={onToggle}
        onRemove={onRemove}
        onAdd={onAdd}
      />
    );
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes.length).toBe(2);
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
    expect(document.querySelectorAll(".vf-checklist__row")[1]).toHaveAttribute("data-verdict", "pending");
    await userEvent.click(boxes[1]!);
    expect(onToggle).toHaveBeenCalledWith("b", true);
    await userEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]!);
    expect(onRemove).toHaveBeenCalledWith("a");
    const add = screen.getByRole("button", { name: "Add" });
    expect(add).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox", { name: "Add a check" }), "Tea{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Tea");
    expect(screen.getByLabelText("1 of 2 passed")).toBeInTheDocument();
  });
});

describe("FactRow", () => {
  it("renders label, value, note and actions with a tone rule and min height", () => {
    renderWithTheme(
      <ul>
        <FactRow as="li" label="Sample rate" value="48 kHz" note="device" tone="success" actions={<button>Change</button>} data-testid="row" />
        <FactRow as="li" label="Latency" value={<span>6 ms</span>} mono={false} minHeight={56} data-testid="row2" />
      </ul>
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("LI");
    expect(row).toHaveClass("vf-fact-row", "vf-fact-row--success");
    expect(row).toHaveAttribute("data-tone", "success");
    expect(row.style.getPropertyValue("--vf-fact-row-min-height")).toBe("44px");
    expect(row.querySelector(".vf-fact-row__value")).toHaveClass("vf-fact-row__value--mono");
    expect(row.querySelector(".vf-fact-row__note")).toHaveTextContent("device");
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
    const row2 = screen.getByTestId("row2");
    expect(row2.style.getPropertyValue("--vf-fact-row-min-height")).toBe("56px");
    expect(row2.querySelector(".vf-fact-row__value")).not.toHaveClass("vf-fact-row__value--mono");
  });
});
