import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileUpload } from "../FileUpload";
import { renderWithTheme } from "../../../test/renderWithTheme";

function makeFile(name: string, size: number, type = "text/plain"): File {
  const body = new Array(size).fill("a").join("");
  return new File([body], name, { type });
}

describe("FileUpload", () => {
  it("renders the drop surface and accessible label", () => {
    renderWithTheme(<FileUpload label="Upload" />);
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
  });

  it("accepts files via the hidden input", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" onValueChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeFile("hello.txt", 10));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0];
    expect(last[0].file.name).toBe("hello.txt");
  });

  it("rejects files over maxSize", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload
        label="Upload"
        maxSize={5}
        onValueChange={onChange}
        disableThumbnails
      />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeFile("big.txt", 100));
    const last = onChange.mock.calls.at(-1)![0];
    expect(last[0].status).toBe("error");
    expect(last[0].error).toMatch(/max size/i);
  });

  it("rejects files failing the accept filter", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload
        label="Upload"
        accept="image/*"
        onValueChange={onChange}
        disableThumbnails
      />
    );
    // userEvent.upload respects the input's accept attribute and filters
    // mismatched files out before firing change. Use fireEvent.change to
    // bypass and exercise our own matchesAccept() guard.
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("doc.txt", 10, "text/plain");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const last = onChange.mock.calls.at(-1)![0];
    expect(last[0].status).toBe("error");
  });

  it("runs the upload function and transitions to success", async () => {
    const upload = vi.fn(async (_file: File, onProgress: (p: number) => void) => {
      onProgress(0.5);
      onProgress(1);
    });
    const { container } = renderWithTheme(
      <FileUpload label="Upload" upload={upload} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeFile("a.txt", 10));
    await waitFor(() => {
      const list = screen.getByRole("list", { name: "Selected files" });
      expect(within(list).getByText("a.txt")).toBeInTheDocument();
    });
    expect(upload).toHaveBeenCalled();
  });

  it("remove button deletes the item from the list", async () => {
    const { container } = renderWithTheme(
      <FileUpload label="Upload" disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeFile("a.txt", 10));
    const remove = await screen.findByRole("button", { name: "Remove a.txt" });
    await userEvent.click(remove);
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
  });
});
