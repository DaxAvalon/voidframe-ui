import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Lightbox, ImageGallery } from "../Lightbox";

const IMAGES = [
  { src: "a.jpg", alt: "A" },
  { src: "b.jpg", alt: "B" },
  { src: "c.jpg", alt: "C" },
];

describe("Lightbox", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithTheme(
      <Lightbox images={IMAGES} open={false} onOpenChange={() => {}} index={0} />
    );
    expect(container.querySelector(".vf-lightbox")).toBeNull();
  });

  it("renders image when open (portal to body)", () => {
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={() => {}} index={0} />
    );
    expect(document.body.querySelector(".vf-lightbox")).toBeTruthy();
  });

  it("fires onOpenChange on close button click", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={onOpenChange} index={0} />
    );
    const close = document.body.querySelector(".vf-lightbox__close");
    if (close) fireEvent.click(close);
    expect(onOpenChange).toHaveBeenCalled();
  });

  it("navigates next/prev", () => {
    const onIndexChange = vi.fn();
    renderWithTheme(
      <Lightbox
        images={IMAGES}
        open
        onOpenChange={() => {}}
        index={1}
        onIndexChange={onIndexChange}
      />
    );
    const next = document.body.querySelector(".vf-lightbox__next");
    if (next) fireEvent.click(next);
    expect(onIndexChange).toHaveBeenCalled();
  });
});

describe("ImageGallery", () => {
  it("renders children", () => {
    const { container } = renderWithTheme(
      <ImageGallery images={IMAGES} />
    );
    expect(container.querySelector(".vf-image-gallery")).toBeTruthy();
  });
});
