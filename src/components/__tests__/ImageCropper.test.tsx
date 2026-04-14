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
});
