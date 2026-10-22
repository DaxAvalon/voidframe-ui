import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VoidframeProvider } from "../../provider/VoidframeProvider";
import { CalendarHeatmap, weekdayLabels } from "../CalendarHeatmap";
import { COUNTRY_ALIASES, matchCountryNames, normalizeCountryName } from "../geo/countryNames";

const start = new Date(2026, 0, 7); // Wednesday
const end = new Date(2026, 0, 13);
const data = Array.from({ length: 7 }, (_, i) => ({ date: new Date(2026, 0, 7 + i), value: i }));

function cellY(container: HTMLElement, date: string): number {
  return Number(container.querySelector(`[data-date="${date}"]`)!.getAttribute("y"));
}

describe("CalendarHeatmap locale and interaction", () => {
  it("anchors weeks to the provider's first day of week and labels days in its locale", () => {
    const sunday = render(
      <VoidframeProvider localeTag="en-US" firstDayOfWeek={0}>
        <CalendarHeatmap start={start} end={end} data={data} cellSize={10} cellGap={0} showMonthLabels={false} />
      </VoidframeProvider>
    );
    // Wednesday is row 3 when the week starts on Sunday…
    expect(cellY(sunday.container, "2026-01-07")).toBe(30);
    sunday.unmount();
    const monday = render(
      <VoidframeProvider localeTag="de-DE" firstDayOfWeek={1}>
        <CalendarHeatmap start={start} end={end} data={data} cellSize={10} cellGap={0} showMonthLabels={false} />
      </VoidframeProvider>
    );
    // …and row 2 when it starts on Monday.
    expect(cellY(monday.container, "2026-01-07")).toBe(20);
    const labels = Array.from(monday.container.querySelectorAll(".vf-chart-calheat__day")).map((n) => n.textContent);
    expect(labels[0]).toMatch(/^Di/);
    expect(weekdayLabels("en-US", 1)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("overrides firstDayOfWeek and locale per chart, formats month labels by locale", () => {
    const { container } = render(
      <VoidframeProvider localeTag="en-US">
        <CalendarHeatmap start={new Date(2026, 1, 1)} end={new Date(2026, 2, 10)} data={[]} locale="fr-FR" firstDayOfWeek={1} dayLabels={["L", "", "M", "", "V", "", "D"]} />
      </VoidframeProvider>
    );
    const months = Array.from(container.querySelectorAll(".vf-chart-calheat__month")).map((n) => n.textContent);
    expect(months.join(" ")).toMatch(/févr/);
    const days = Array.from(container.querySelectorAll(".vf-chart-calheat__day")).map((n) => n.textContent);
    expect(days).toEqual(["L", "M", "V", "D"]);
  });

  it("fires onCellClick from click and keyboard, and marks today", () => {
    const onCellClick = vi.fn();
    const { container } = render(
      <VoidframeProvider>
        <CalendarHeatmap start={start} end={end} data={data} onCellClick={onCellClick} highlightToday today={new Date(2026, 0, 9)} />
      </VoidframeProvider>
    );
    const cell = container.querySelector('[data-date="2026-01-08"]') as SVGRectElement;
    expect(cell).toHaveAttribute("role", "button");
    expect(cell).toHaveAttribute("tabindex", "0");
    fireEvent.click(cell);
    expect(onCellClick).toHaveBeenCalledWith(expect.objectContaining({ value: 1 }));
    fireEvent.keyDown(cell, { key: "Enter" });
    expect(onCellClick).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[data-date="2026-01-09"]')).toHaveAttribute("data-today");
    expect(container.querySelectorAll("[data-today]")).toHaveLength(1);
    expect(screen.getAllByRole("button")).toHaveLength(7);
  });
});

describe("matchCountryNames", () => {
  const features = ["United States", "United Kingdom", "Vietnam", "Côte d'Ivoire", "Czechia", "Dem. Rep. Congo"];

  it("normalises, applies aliases and reports unmatched keys", () => {
    expect(normalizeCountryName("Côte d’Ivoire")).toBe("cote d'ivoire");
    const r = matchCountryNames(
      { USA: 10, "Viet Nam": 3, "czech republic": 4, "Ivory Coast": 2, DRC: 1, Narnia: 9, "united kingdom": 5 },
      features
    );
    expect(r.values).toEqual({
      "United States": 10,
      Vietnam: 3,
      Czechia: 4,
      "Côte d'Ivoire": 2,
      "Dem. Rep. Congo": 1,
      "United Kingdom": 5,
    });
    expect(r.unmatched).toEqual(["Narnia"]);
    expect(r.mapping.USA).toBe("United States");
    expect(COUNTRY_ALIASES.usa).toBe("United States");
  });

  it("accepts extra aliases", () => {
    const r = matchCountryNames({ Blighty: 1 }, features, { aliases: { blighty: "United Kingdom" } });
    expect(r.values).toEqual({ "United Kingdom": 1 });
  });
});
