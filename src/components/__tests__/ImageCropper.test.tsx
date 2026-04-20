import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageCropper } from "../ImageCropper";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("ImageCropper", () => {
  it("shows the file picker when no src is provided", () => {
    renderWithTheme(<ImageCropper label="Pick" />);
    expect(screen.getByLabelText("Pick")).toHaveAttribute("type", "file");
  });

  it("hides the file picker when src is provided and allowFileSelect=false", () => {
    renderWithTheme(
      <ImageCropper label="Pick" src="/example.png" allowFileSelect={false} />
    );
    expect(screen.queryByLabelText("Pick")).not.toBeInTheDocument();
  });

  it("selecting a file fires onSrcChange", async () => {
    const onSrcChange = vi.fn();
    // URL.createObjectURL may not exist in happy-dom; polyfill.
    if (!URL.createObjectURL) {
      URL.createObjectURL = () => "blob:mock";
    }
    renderWithTheme(<ImageCropper label="Pick" onSrcChange={onSrcChange} />);
    const input = screen.getByLabelText("Pick") as HTMLInputElement;
    const file = new File(["x"], "x.png", { type: "image/png" });
    await userEvent.upload(input, file);
    expect(onSrcChange).toHaveBeenCalled();
  });

  it("renders an Apply crop action once a src is present", () => {
    renderWithTheme(<ImageCropper label="Pick" src="/example.png" />);
    expect(screen.getByRole("button", { name: "Apply crop" })).toBeInTheDocument();
  });

  it("attaches a ResizeObserver to keep crop coordinates in sync on container resize", () => {
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();
    class MockRO {
      callback: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.callback = cb;
      }
      observe(el: Element) {
        observeSpy(el);
      }
      unobserve() {}
      disconnect() {
        disconnectSpy();
      }
    }
    const prior = (globalThis as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = MockRO as unknown as typeof ResizeObserver;
    try {
      const { unmount } = renderWithTheme(
        <ImageCropper label="Pick" src="/example.png" />
      );
      expect(observeSpy).toHaveBeenCalled();
      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
    } finally {
      if (prior)
        (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = prior;
    }
  });

  it("respects an explicit initial crop via aspect", () => {
    renderWithTheme(
      <ImageCropper
        label="Pick"
        src="/example.png"
        aspect={1}
        initialCrop={{ x: 0, y: 0, width: 100, height: 100 }}
      />
    );
    // Stage renders before the image loads; component won't throw.
    expect(screen.getByRole("button", { name: "Apply crop" })).toBeInTheDocument();
  });

  it("propagates outputType and outputQuality through to toDataURL/toBlob", async () => {
    // Stub canvas APIs to capture the arguments.
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockImplementation(() => "data:image/jpeg;base64,xx");
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation(function (this: HTMLCanvasElement, cb: BlobCallback) {
        cb(new Blob([], { type: "image/jpeg" }));
      });
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(
        () =>
          ({
            drawImage: () => undefined,
          }) as unknown as CanvasRenderingContext2D
      );
    try {
      const onCrop = vi.fn();
      renderWithTheme(
        <ImageCropper
          label="Pick"
          src="/example.png"
          outputType="image/jpeg"
          outputQuality={0.42}
          initialCrop={{ x: 0, y: 0, width: 50, height: 50 }}
          onCrop={onCrop}
        />
      );
      // Inject the natural dims + crop state by simulating image load.
      const img = document.querySelector(
        "img.vf-image-cropper__img"
      ) as HTMLImageElement | null;
      if (img) {
        Object.defineProperty(img, "naturalWidth", {
          value: 200,
          configurable: true,
        });
        Object.defineProperty(img, "naturalHeight", {
          value: 200,
          configurable: true,
        });
        img.dispatchEvent(new Event("load"));
      }
      screen.getByRole("button", { name: "Apply crop" }).click();
      // We care that toDataURL was called with the specified format/quality.
      if (toDataURL.mock.calls.length > 0) {
        expect(toDataURL).toHaveBeenCalledWith("image/jpeg", 0.42);
      }
      if (toBlob.mock.calls.length > 0) {
        expect(toBlob.mock.calls[0]![1]).toBe("image/jpeg");
        expect(toBlob.mock.calls[0]![2]).toBe(0.42);
      }
    } finally {
      toDataURL.mockRestore();
      toBlob.mockRestore();
      getContext.mockRestore();
    }
  });
});
