import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Breadcrumb } from "../../components/Navigation";
import { BreadcrumbMenu } from "../../components/BreadcrumbMenu";
import { OrganizationCard } from "../../components/Identity";
import { CitationList, SourceCard } from "../../components/ChatCitations";
import { SkipToContent } from "../../primitives/SkipToContent";

// ─────────────────────────────────────────────────────────────
// Adversarial XSS-style payloads. Every test asserts a rendered
// anchor's `href` has been neutralized to "#" and no inline event
// handler attribute (`onclick=`, `onmouseover=`, etc.) appears in
// the DOM output.
// ─────────────────────────────────────────────────────────────

const UNSAFE_PAYLOADS: Array<[label: string, url: string]> = [
  ["javascript: scheme", "javascript:alert(1)"],
  ["uppercased javascript", "JAVASCRIPT:alert(1)"],
  ["mixed-case javascript", "jAvAsCrIpT:alert(1)"],
  ["tab-prefixed", "\tjavascript:alert(1)"],
  ["space-prefixed", "  javascript:alert(1)"],
  ["control-char-prefixed", "\u0000javascript:alert(1)"],
  ["vbscript", "vbscript:msgbox(1)"],
  ["data: HTML", "data:text/html,<script>alert(1)</script>"],
  ["file scheme", "file:///etc/passwd"],
];

function expectSafe(container: HTMLElement): void {
  // Every anchor's href was rewritten.
  for (const a of Array.from(container.querySelectorAll("a"))) {
    const href = a.getAttribute("href") ?? "";
    expect(href.toLowerCase()).not.toMatch(/^javascript:/);
    expect(href.toLowerCase()).not.toMatch(/^vbscript:/);
    expect(href.toLowerCase()).not.toMatch(/^data:/);
    expect(href.toLowerCase()).not.toMatch(/^file:/);
  }
  // No on* inline handler attributes should have leaked through.
  expect(container.innerHTML).not.toMatch(/\s+on\w+=/i);
}

describe("XSS — anchor components reject unsafe hrefs", () => {
  describe("Breadcrumb", () => {
    for (const [label, url] of UNSAFE_PAYLOADS) {
      it(`blocks ${label}`, () => {
        const { container } = renderWithTheme(
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Boom", href: url },
            ]}
          />
        );
        expectSafe(container);
      });
    }
  });

  describe("BreadcrumbMenu", () => {
    it("blocks javascript: URL in item and sibling", () => {
      const { container } = renderWithTheme(
        <BreadcrumbMenu
          items={[
            {
              label: "Root",
              href: "javascript:alert(1)",
              siblings: [
                { label: "Sibling", href: "javascript:void(0)" },
              ],
            },
          ]}
        />
      );
      expectSafe(container);
    });
  });

  describe("SkipToContent", () => {
    it("blocks a malicious href", () => {
      const { container } = renderWithTheme(
        <SkipToContent href="javascript:alert(1)">skip</SkipToContent>
      );
      expectSafe(container);
    });

    it("keeps a fragment href intact", () => {
      const { container } = renderWithTheme(
        <SkipToContent href="#main">skip</SkipToContent>
      );
      const a = container.querySelector("a");
      expect(a?.getAttribute("href")).toBe("#main");
    });
  });

  describe("OrganizationCard", () => {
    it("blocks javascript: website URL and sets noopener", () => {
      const { container } = renderWithTheme(
        <OrganizationCard
          organization={{
            name: "Acme",
            website: "javascript:alert(1)",
          }}
        />
      );
      expectSafe(container);
      const a = container.querySelector("a.vf-org-card__website");
      expect(a?.getAttribute("rel")).toBe("noreferrer noopener");
    });
  });

  describe("CitationList + SourceCard", () => {
    it("CitationList blocks unsafe source URL", () => {
      const { container } = renderWithTheme(
        <CitationList
          sources={[
            {
              id: 1,
              title: "Bad",
              url: "javascript:alert(1)",
            },
          ]}
        />
      );
      expectSafe(container);
      const a = container.querySelector("a");
      expect(a?.getAttribute("rel")).toBe("noreferrer noopener");
    });

    it("SourceCard blocks unsafe URL", () => {
      const { container } = renderWithTheme(
        <SourceCard title="Bad" url="javascript:alert(1)" />
      );
      expectSafe(container);
      const a = container.querySelector("a");
      expect(a?.getAttribute("rel")).toBe("noreferrer noopener");
    });
  });
});
