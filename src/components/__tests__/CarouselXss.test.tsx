"use client";

import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { CarouselImageGallery } from "../Carousel";

describe("CarouselImageGallery XSS", () => {
  const UNSAFE_SRCS = [
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "\tjavascript:alert(1)",
    "\u0000javascript:alert(1)",
  ];

  for (const src of UNSAFE_SRCS) {
    it(`sanitizes dangerous src: ${src.slice(0, 30)}`, () => {
      const { container } = renderWithTheme(
        <CarouselImageGallery
          images={[{ src, alt: "test" }]}
        />
      );
      const img = container.querySelector("img");
      expect(img).toBeTruthy();
      const rendered = img!.getAttribute("src") ?? "";
      expect(rendered.toLowerCase()).not.toMatch(/^javascript:/);
      expect(rendered.toLowerCase()).not.toMatch(/^data:/);
    });
  }

  it("allows safe https src", () => {
    const { container } = renderWithTheme(
      <CarouselImageGallery
        images={[{ src: "https://example.com/photo.jpg", alt: "safe" }]}
      />
    );
    const img = container.querySelector("img");
    expect(img!.getAttribute("src")).toBe("https://example.com/photo.jpg");
  });
});
