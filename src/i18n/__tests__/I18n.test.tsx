import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import {
  MessagesProvider,
  VoidframeProvider,
  enMessages,
  es,
  ja,
  ar,
  he,
  enXA,
  formatCurrency,
  formatDate,
  formatList,
  formatPercent,
  formatRelativeTime,
  mergeMessages,
  pluralize,
  pseudolocalize,
  resolvePath,
  useMessages,
} from "../../index";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("messages — resolvePath + mergeMessages", () => {
  it("resolves a plain string path", () => {
    expect(resolvePath(enMessages, "pagination.previous")).toBe("Previous");
  });

  it("invokes a template function with args", () => {
    expect(
      resolvePath(enMessages, "pagination.pageOf", { current: 2, total: 10 })
    ).toBe("Page 2 of 10");
  });

  it("returns the path when unknown", () => {
    expect(resolvePath(enMessages, "does.not.exist")).toBe("does.not.exist");
  });

  it("deep-merges partial overrides over English defaults", () => {
    const merged = mergeMessages(enMessages, {
      dialog: { confirm: "Do it" },
    });
    expect(merged.dialog.confirm).toBe("Do it");
    expect(merged.dialog.cancel).toBe("Cancel");
    expect(merged.pagination.previous).toBe("Previous");
  });
});

describe("MessagesProvider + useMessages", () => {
  function Probe() {
    const { t, locale, direction, firstDayOfWeek } = useMessages();
    return (
      <div>
        <span data-testid="prev">{t("pagination.previous")}</span>
        <span data-testid="of">{t("pagination.pageOf", { current: 2, total: 5 })}</span>
        <span data-testid="locale">{locale}</span>
        <span data-testid="dir">{direction}</span>
        <span data-testid="fdow">{firstDayOfWeek}</span>
      </div>
    );
  }

  it("falls back to English when no locale is passed", () => {
    renderWithTheme(<Probe />);
    expect(screen.getByTestId("prev")).toHaveTextContent("Previous");
    expect(screen.getByTestId("of")).toHaveTextContent("Page 2 of 5");
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });

  it("picks up a supplied locale pack", () => {
    renderWithTheme(
      <MessagesProvider locale={es}>
        <Probe />
      </MessagesProvider>
    );
    expect(screen.getByTestId("prev")).toHaveTextContent("Anterior");
    expect(screen.getByTestId("of")).toHaveTextContent("Página 2 de 5");
    expect(screen.getByTestId("locale")).toHaveTextContent("es");
    expect(screen.getByTestId("fdow")).toHaveTextContent("1");
  });

  it("auto-sets dir=rtl from an RTL locale pack", () => {
    const { container } = renderWithTheme(
      <VoidframeProvider locale={ar}>
        <Probe />
      </VoidframeProvider>
    );
    const roots = container.querySelectorAll(".vf-root");
    expect(roots[roots.length - 1]).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("dir")).toHaveTextContent("rtl");
  });

  it("lets direction prop override the locale pack", () => {
    renderWithTheme(
      <VoidframeProvider locale={he} direction="ltr">
        <Probe />
      </VoidframeProvider>
    );
    expect(screen.getByTestId("dir")).toHaveTextContent("ltr");
  });

  it("layers `messages` overrides on top of the locale pack", () => {
    renderWithTheme(
      <MessagesProvider
        locale={ja}
        messages={{ pagination: { previous: "Custom" } }}
      >
        <Probe />
      </MessagesProvider>
    );
    expect(screen.getByTestId("prev")).toHaveTextContent("Custom");
    // unaffected keys still fall through to ja
    expect(screen.getByTestId("of")).toHaveTextContent("5 中 2 ページ");
  });
});

describe("pluralize", () => {
  it("picks the right form for English counts", () => {
    const forms = { one: "1 file", other: (n: number) => `${n} files` };
    expect(pluralize(1, "en", { one: forms.one, other: "n files" })).toBe(
      "1 file"
    );
    expect(pluralize(5, "en", { one: forms.one, other: "n files" })).toBe(
      "n files"
    );
  });

  it("falls back to `other` when the locale has no matching form", () => {
    expect(
      pluralize(2, "ja", { one: "one", other: "other" })
    ).toBe("other");
  });
});

describe("format utilities", () => {
  it("formatCurrency respects locale + currency", () => {
    const out = formatCurrency(1234.5, "EUR", "de-DE");
    expect(out).toMatch(/1\.?234|1\s?234/);
    expect(out).toContain("€");
  });

  it("formatPercent renders a fraction as a percentage", () => {
    expect(formatPercent(0.125, "en-US")).toBe("13%");
  });

  it("formatDate respects locale options", () => {
    const d = new Date(Date.UTC(2026, 3, 14));
    const out = formatDate(d, "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    expect(out).toContain("2026");
  });

  it("formatRelativeTime picks the correct unit", () => {
    const now = Date.now();
    const out = formatRelativeTime(now - 3600_000, "en", now);
    expect(out).toMatch(/hour/);
  });

  it("formatList joins with the locale's connector", () => {
    const out = formatList(["a", "b", "c"], "en");
    // ListFormat may not be available everywhere — both are valid outputs.
    expect(out === "a, b, and c" || out === "a, b, c").toBe(true);
  });
});

describe("pseudolocalize + en-XA", () => {
  it("wraps strings in ⟦…⟧ and expands length", () => {
    const out = pseudolocalize(enMessages) as typeof enMessages;
    expect(typeof out.pagination.previous).toBe("string");
    expect(out.pagination.previous).toMatch(/^⟦.+⟧$/);
    expect(out.pagination.previous.length).toBeGreaterThan("Previous".length);
  });

  it("en-XA locale pack wraps even the template functions", () => {
    const withArgs = (enXA.messages.pagination!.pageOf as (a: {
      current: number;
      total: number;
    }) => string)({ current: 1, total: 9 });
    expect(withArgs).toMatch(/^⟦.*⟧$/);
  });
});
