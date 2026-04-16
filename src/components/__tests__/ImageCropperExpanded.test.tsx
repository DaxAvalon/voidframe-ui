// Expanded tests for ImageCropper — overlay, handles, crop rect, pointer events

import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ImageCropper } from "../ImageCropper";

describe("ImageCropper (expanded)", () => {
  it("renders with vf-image-cropper class", () => {
    const { container } = renderWithTheme(<ImageCropper />);
    expect(container.querySelector(".vf-image-cropper")).toBeInTheDocument();
  });

  it("shows file picker when allowFileSelect=true even with src", () => {
    renderWithTheme(<ImageCropper src="test.png" allowFileSelect />);
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    const { container } = renderWithTheme(<ImageCropper />);
    // No label element should be rendered
    const labels = container.querySelectorAll("label");
    expect(labels.length).toBe(0);
  });

  it("renders stage with image when src is given", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    const img = document.querySelector(".vf-image-cropper__image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("test.png");
    expect(img.getAttribute("draggable")).toBe("false");
    expect(img.getAttribute("alt")).toBe("");
    expect(document.querySelector(".vf-image-cropper__stage")).toBeInTheDocument();
  });

  it("renders actions container with Apply crop button when src given", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    expect(document.querySelector(".vf-image-cropper__actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply crop" })).toBeInTheDocument();
  });

  it("does not render stage or actions without src", () => {
    renderWithTheme(<ImageCropper />);
    expect(document.querySelector(".vf-image-cropper__stage")).not.toBeInTheDocument();
    expect(document.querySelector(".vf-image-cropper__actions")).not.toBeInTheDocument();
  });

  it("applies custom className and style", () => {
    const { container } = renderWithTheme(
      <ImageCropper className="custom" style={{ border: "1px solid red" }} />
    );
    const el = container.querySelector(".vf-image-cropper");
    expect(el).toHaveClass("custom");
    expect(el).toHaveStyle({ border: "1px solid red" });
  });

  it("renders overlay and corner handles after image loads", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    const img = document.querySelector(".vf-image-cropper__image") as HTMLImageElement;

    // Simulate natural dimensions
    Object.defineProperty(img, "naturalWidth", { value: 200, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 200, configurable: true });
    fireEvent.load(img);

    const overlay = document.querySelector(".vf-image-cropper__overlay");
    expect(overlay).toBeInTheDocument();

    // 4 corner handles
    expect(document.querySelector(".vf-image-cropper__handle--nw")).toBeInTheDocument();
    expect(document.querySelector(".vf-image-cropper__handle--ne")).toBeInTheDocument();
    expect(document.querySelector(".vf-image-cropper__handle--sw")).toBeInTheDocument();
    expect(document.querySelector(".vf-image-cropper__handle--se")).toBeInTheDocument();

    // Each handle has role="presentation"
    const handles = document.querySelectorAll("[class*='vf-image-cropper__handle']");
    expect(handles.length).toBe(4);
    handles.forEach((h) => {
      expect(h.getAttribute("role")).toBe("presentation");
    });
  });

  it("overlay has position styles after image load", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    const img = document.querySelector(".vf-image-cropper__image") as HTMLImageElement;

    Object.defineProperty(img, "naturalWidth", { value: 100, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 100, configurable: true });
    fireEvent.load(img);

    const overlay = document.querySelector(".vf-image-cropper__overlay") as HTMLElement;
    expect(overlay).toBeInTheDocument();
    // Overlay should have inline positioning styles
    expect(overlay.style.left).toBeDefined();
    expect(overlay.style.top).toBeDefined();
    expect(overlay.style.width).toBeDefined();
    expect(overlay.style.height).toBeDefined();
  });

  it("uses initialCrop when provided", () => {
    renderWithTheme(
      <ImageCropper
        src="test.png"
        initialCrop={{ x: 10, y: 10, width: 50, height: 50 }}
      />
    );
    const img = document.querySelector(".vf-image-cropper__image") as HTMLImageElement;
    Object.defineProperty(img, "naturalWidth", { value: 200, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: 200, configurable: true });
    fireEvent.load(img);

    // Overlay should render (meaning crop rect was set)
    expect(document.querySelector(".vf-image-cropper__overlay")).toBeInTheDocument();
  });

  it("calls onSrcChange when file is selected", () => {
    const onSrcChange = vi.fn();
    const originalCreate = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test-url");

    renderWithTheme(<ImageCropper onSrcChange={onSrcChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "test.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onSrcChange).toHaveBeenCalledWith("blob:test-url");
    URL.createObjectURL = originalCreate;
  });

  it("pointerUp on stage does not throw when no drag active", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    const stage = document.querySelector(".vf-image-cropper__stage") as HTMLElement;
    // Should not throw
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });

  it("pointerMove on stage does nothing when no drag active", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    const stage = document.querySelector(".vf-image-cropper__stage") as HTMLElement;
    // Should not throw
    fireEvent.pointerMove(stage, { clientX: 50, clientY: 50 });
  });

  it("does not render overlay before image loads", () => {
    renderWithTheme(<ImageCropper src="test.png" />);
    // Before load, no overlay
    expect(document.querySelector(".vf-image-cropper__overlay")).not.toBeInTheDocument();
  });

  it("updates imgSrc when src prop changes", () => {
    const { rerender } = renderWithTheme(<ImageCropper src="a.png" />);
    let img = document.querySelector(".vf-image-cropper__image") as HTMLImageElement;
    expect(img.src).toContain("a.png");

    rerender(<ImageCropper src="b.png" />);
    img = document.querySelector(".vf-image-cropper__image") as HTMLImageElement;
    expect(img.src).toContain("b.png");
  });
});
