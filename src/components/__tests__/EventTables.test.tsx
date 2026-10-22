import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { ChangeTable, EventLog, EventTimeline, changeTone } from "../EventTables";

describe("EventLog", () => {
  const events = [
    { id: "e1", time: "00:00.100", label: "start", kind: "session", tone: "info" as const },
    { id: "e2", time: "00:01.000", end: "00:04.000", label: "take 1", kind: "take", detail: "3.0 s", payload: { ok: true } },
    { id: "e3", time: "00:05.000", label: "clip", kind: "warning", tone: "danger" as const },
  ];

  it("renders rows with anchors, tone bands, ranges, cited highlight and selection", () => {
    const onSelect = vi.fn();
    const { container } = renderWithTheme(<EventLog events={events} cited={["e3"]} selectedId="e1" onSelect={onSelect} expandable />);
    expect(container.querySelector("#event-e2")).not.toBeNull();
    expect(container.querySelector("#event-e3")).toHaveAttribute("data-cited");
    expect(container.querySelector("#event-e3")).toHaveAttribute("data-tone", "danger");
    expect(container.querySelector("#event-e1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/→ 00:04.000/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("clip"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "e3" }));
    fireEvent.keyDown(container.querySelector("#event-e2")!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "e2" }));
    fireEvent.click(screen.getByRole("button", { name: "Payload" }));
    expect(screen.getByText(/"ok": true/)).toBeInTheDocument();
  });

  it("filters by kind with chips", () => {
    const onVisibleKindsChange = vi.fn();
    renderWithTheme(<EventLog events={events} filterable onVisibleKindsChange={onVisibleKindsChange} />);
    const chips = screen.getAllByRole("button", { pressed: true });
    expect(chips.map((c) => c.textContent)).toEqual(["session", "take", "warning"]);
    fireEvent.click(screen.getByRole("button", { name: "take" }));
    expect(onVisibleKindsChange).toHaveBeenCalledWith(["session", "warning"]);
    expect(screen.queryByText("take 1")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "take" }));
    expect(onVisibleKindsChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByText("take 1")).toBeInTheDocument();
  });
});

describe("EventTimeline", () => {
  it("pairs request and response, derives duration, shows offsets and payloads", () => {
    const onSelect = vi.fn();
    const { container } = renderWithTheme(
      <EventTimeline
        onSelect={onSelect}
        events={[
          { id: "r1", at: 1000, kind: "request", label: "POST /chat", pairId: "a", payload: { q: "hi" } },
          { id: "x", at: 1200, kind: "event", label: "tool call", tone: "info" },
          { id: "s1", at: 1750, kind: "response", label: "200 OK", pairId: "a", tone: "success" },
        ]}
      />
    );
    const items = container.querySelectorAll(".vf-event-timeline__item");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("vf-event-timeline__item--paired");
    expect(items[0]).toHaveAttribute("data-tone", "success");
    expect(items[0]!.querySelector(".vf-event-timeline__duration")?.textContent).toBe("750 ms");
    expect(items[0]!.querySelector(".vf-event-timeline__offset")?.textContent).toBe("+0 ms");
    expect(items[1]!.querySelector(".vf-event-timeline__offset")?.textContent).toBe("+200 ms");
    fireEvent.click(screen.getByRole("button", { name: "Payload" }));
    expect(screen.getByText(/"q": "hi"/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "POST /chat" }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "r1" }));
  });
});

describe("ChangeTable", () => {
  it("derives direction tones, dims before values and shows verdicts", () => {
    expect(changeTone({ label: "x", before: 1, after: 2 })).toBe("success");
    expect(changeTone({ label: "x", before: 1, after: 2 }, "down-good")).toBe("danger");
    expect(changeTone({ label: "x", before: "a", after: "b" })).toBe("neutral");
    const { container } = renderWithTheme(
      <ChangeTable
        rows={[
          { label: "Noise floor", before: -58, after: -62, note: "better", verdict: "pass" },
          { label: "Title", before: "Old", after: "New", tone: "warning" },
        ]}
        direction="down-good"
      />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveAttribute("data-tone", "success");
    expect(rows[1]).toHaveAttribute("data-tone", "warning");
    expect(rows[0]!.querySelector(".vf-change-table__before .vf-code--muted")?.textContent).toBe("-58");
    expect(screen.getByText("better")).toBeInTheDocument();
    expect(rows[0]!.querySelector("[data-verdict='pass']")).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
  });
});
