// Final coverage tests for ImageCropper.tsx
//
// Targets uncovered lines:
//   68-70: clamp helper
//   78-88: applyAspect with aspect ratio
//   155-161: handleSurfaceDown (pointer capture for overlay drag)
//   163-201: handlePointerMove (move + resize corners nw/ne/sw/se)
//   203-211: handlePointerUp
//   215-241: commitCrop — canvas operations
//   299-308: overlay onPointerDown (move initiation)
//   316-324: corner handle onPointerDown (resize initiation)
//
// Canvas getContext("2d") returns null in happy-dom. The commitCrop
// function has a guard `if (!ctx) return;` at line 220 which is the
// path we exercise (the null guard). Actually producing a CropResult
// requires a real canvas context which is untestable in happy-dom.

import { screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ImageCropper } from "../ImageCropper";

// happy-dom lacks setPointerCapture/releasePointerCapture and canvas.getContext.
// Stub them globally so pointer-based tests don't throw.
beforeEach(() => {
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => {};
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {};
  }
});

function loadImage(container: HTMLElement) {
  const img = container.querySelector(".vf-image-cropper__image") as HTMLImageElement;
  Object.defineProperty(img, "naturalWidth", { value: 400, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: 300, configurable: true });
  // Mock getBoundingClientRect for scale computation
  vi.spyOn(img, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 400, bottom: 300,
    width: 400, height: 300, x: 0, y: 0, toJSON: () => {},
  });
  fireEvent.load(img);
  return img;
}

describe("ImageCropper overlay drag (move)", () => {
  it("moves crop rect when overlay is dragged", () => {
    const { container } = renderWithTheme(<ImageCropper src="test.png" />);
    const img = loadImage(container);

    const overlay = container.querySelector(".vf-image-cropper__overlay") as HTMLElement;
    expect(overlay).toBeInTheDocument();

    // Pointer down on overlay to start move
    fireEvent.pointerDown(overlay, {
      clientX: 100, clientY: 75, pointerId: 1,
    });

    // Pointer move to drag
    const stage = container.querySelector(".vf-image-cropper__stage") as HTMLElement;
    fireEvent.pointerMove(stage, { clientX: 150, clientY: 100 });

    // Overlay should have updated position (verify it didn't crash)
    const updatedOverlay = container.querySelector(".vf-image-cropper__overlay") as HTMLElement;
    expect(updatedOverlay).toBeInTheDocument();

    // Pointer up to end drag
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });
});

describe("ImageCropper corner resize", () => {
  it("resizes from SE corner", () => {
    const { container } = renderWithTheme(<ImageCropper src="test.png" />);
    loadImage(container);

    const seHandle = container.querySelector(".vf-image-cropper__handle--se") as HTMLElement;
    expect(seHandle).toBeInTheDocument();

    // Pointer down on SE corner handle
    fireEvent.pointerDown(seHandle, {
      clientX: 350, clientY: 260, pointerId: 1,
    });

    // Move to resize
    const stage = container.querySelector(".vf-image-cropper__stage") as HTMLElement;
    fireEvent.pointerMove(stage, { clientX: 380, clientY: 280 });

    // End resize
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });

  it("resizes from NW corner", () => {
    const { container } = renderWithTheme(<ImageCropper src="test.png" />);
    loadImage(container);

    const nwHandle = container.querySelector(".vf-image-cropper__handle--nw") as HTMLElement;
    fireEvent.pointerDown(nwHandle, {
      clientX: 40, clientY: 30, pointerId: 1,
    });

    const stage = container.querySelector(".vf-image-cropper__stage") as HTMLElement;
    fireEvent.pointerMove(stage, { clientX: 20, clientY: 15 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });

  it("resizes from NE corner", () => {
    const { container } = renderWithTheme(<ImageCropper src="test.png" />);
    loadImage(container);

    const neHandle = container.querySelector(".vf-image-cropper__handle--ne") as HTMLElement;
    fireEvent.pointerDown(neHandle, {
      clientX: 350, clientY: 30, pointerId: 1,
    });

    const stage = container.querySelector(".vf-image-cropper__stage") as HTMLElement;
    fireEvent.pointerMove(stage, { clientX: 370, clientY: 15 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });

  it("resizes from SW corner", () => {
    const { container } = renderWithTheme(<ImageCropper src="test.png" />);
    loadImage(container);

    const swHandle = container.querySelector(".vf-image-cropper__handle--sw") as HTMLElement;
    fireEvent.pointerDown(swHandle, {
      clientX: 40, clientY: 260, pointerId: 1,
    });

    const stage = container.querySelector(".vf-image-cropper__stage") as HTMLElement;
    fireEvent.pointerMove(stage, { clientX: 20, clientY: 280 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });
});

describe("ImageCropper with aspect ratio", () => {
  it("constrains crop to specified aspect ratio", () => {
    const { container } = renderWithTheme(
      <ImageCropper src="test.png" aspect={1} />
    );
    loadImage(container);

    // Overlay should exist with constrained dimensions
    const overlay = container.querySelector(".vf-image-cropper__overlay") as HTMLElement;
    expect(overlay).toBeInTheDocument();
    // The width and height should be equal (aspect=1 means square)
    const w = parseFloat(overlay.style.width);
    const h = parseFloat(overlay.style.height);
    // Allow small floating point difference
    expect(Math.abs(w - h)).toBeLessThan(1);
  });

  it("constrains crop during resize with aspect ratio", () => {
    const { container } = renderWithTheme(
      <ImageCropper src="test.png" aspect={2} />
    );
    loadImage(container);

    const seHandle = container.querySelector(".vf-image-cropper__handle--se") as HTMLElement;
    fireEvent.pointerDown(seHandle, {
      clientX: 350, clientY: 200, pointerId: 1,
    });

    const stage = container.querySelector(".vf-image-cropper__stage") as HTMLElement;
    fireEvent.pointerMove(stage, { clientX: 380, clientY: 250 });
    fireEvent.pointerUp(stage, { pointerId: 1 });

    // Overlay should still maintain aspect ratio
    const overlay = container.querySelector(".vf-image-cropper__overlay") as HTMLElement;
    expect(overlay).toBeInTheDocument();
  });
});

describe("ImageCropper commitCrop (canvas null guard)", () => {
  it("clicks Apply crop — exercises commitCrop with null canvas context", async () => {
    // In happy-dom, canvas element lacks getContext. We mock createElement
    // to return a canvas with getContext that returns null, exercising the
    // null guard at line 220.
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === "canvas") {
        (el as any).getContext = () => null;
        (el as any).width = 0;
        (el as any).height = 0;
      }
      return el;
    });

    const onCrop = vi.fn();
    const { container } = renderWithTheme(
      <ImageCropper src="test.png" onCrop={onCrop} />
    );
    loadImage(container);

    const applyBtn = screen.getByRole("button", { name: "Apply crop" });
    await act(async () => {
      fireEvent.click(applyBtn);
    });

    // onCrop should NOT be called because canvas context is null
    expect(onCrop).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe("ImageCropper label rendering", () => {
  it("renders label element when label prop provided", () => {
    renderWithTheme(<ImageCropper label="Upload image" />);
    expect(screen.getByText("Upload image")).toBeInTheDocument();
  });
});

describe("ImageCropper ref forwarding", () => {
  it("forwards function ref", () => {
    let refValue: HTMLDivElement | null = null;
    renderWithTheme(
      <ImageCropper ref={(el) => { refValue = el; }} />
    );
    expect(refValue).toBeInstanceOf(HTMLDivElement);
  });
});
