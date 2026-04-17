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

  it("keyboard ArrowRight navigates to next image", () => {
    const onIndexChange = vi.fn();
    renderWithTheme(
      <Lightbox
        images={IMAGES}
        open
        onOpenChange={() => {}}
        index={0}
        onIndexChange={onIndexChange}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("keyboard ArrowLeft navigates to previous image", () => {
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
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it("keyboard + zooms in", () => {
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={() => {}} index={0} />
    );
    const img = document.body.querySelector(".vf-lightbox__img") as HTMLElement;
    fireEvent.keyDown(window, { key: "+" });
    // Scale should have increased from 1
    expect(img.style.transform).toContain("scale(1.25)");
  });

  it("keyboard - zooms out", () => {
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={() => {}} index={0} />
    );
    fireEvent.keyDown(window, { key: "-" });
    const img = document.body.querySelector(".vf-lightbox__img") as HTMLElement;
    expect(img.style.transform).toContain("scale(0.75)");
  });

  it("keyboard 0 resets zoom", () => {
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={() => {}} index={0} />
    );
    fireEvent.keyDown(window, { key: "+" });
    fireEvent.keyDown(window, { key: "0" });
    const img = document.body.querySelector(".vf-lightbox__img") as HTMLElement;
    expect(img.style.transform).toContain("scale(1)");
  });

  it("renders download link when download=true", () => {
    renderWithTheme(
      <Lightbox
        images={[{ src: "a.jpg", alt: "A", caption: "Photo A" }]}
        open
        onOpenChange={() => {}}
        index={0}
        download
      />
    );
    const link = document.body.querySelector(".vf-lightbox__download");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("download");
  });

  it("renders thumbnails for multiple images", () => {
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={() => {}} index={0} />
    );
    const tabs = document.body.querySelectorAll("[role='tab']");
    expect(tabs.length).toBe(3);
  });

  it("double click toggles zoom", () => {
    renderWithTheme(
      <Lightbox images={IMAGES} open onOpenChange={() => {}} index={0} />
    );
    const img = document.body.querySelector(".vf-lightbox__img") as HTMLElement;
    fireEvent.doubleClick(img);
    expect(img.style.transform).toContain("scale(2)");
    fireEvent.doubleClick(img);
    expect(img.style.transform).toContain("scale(1)");
  });
});

describe("ImageGallery", () => {
  it("renders children", () => {
    const { container } = renderWithTheme(
      <ImageGallery images={IMAGES} />
    );
    expect(container.querySelector(".vf-image-gallery")).toBeTruthy();
  });

  it("opens lightbox on image click", async () => {
    renderWithTheme(<ImageGallery images={IMAGES} />);
    const cells = document.querySelectorAll(".vf-image-gallery__cell");
    fireEvent.click(cells[0]!);
    expect(document.body.querySelector(".vf-lightbox")).toBeTruthy();
  });

  it("fires onImageClick callback", () => {
    const onImageClick = vi.fn();
    renderWithTheme(<ImageGallery images={IMAGES} onImageClick={onImageClick} />);
    const cells = document.querySelectorAll(".vf-image-gallery__cell");
    fireEvent.click(cells[1]!);
    expect(onImageClick).toHaveBeenCalledWith(1);
  });
});
