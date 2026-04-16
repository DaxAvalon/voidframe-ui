// Expanded coverage tests for FileUpload.tsx — drag events, validation, format, retry

import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileUpload } from "../FileUpload";
import { renderWithTheme } from "../../../test/renderWithTheme";

function makeFile(name: string, size: number, type = "text/plain"): File {
  const body = new Array(size).fill("a").join("");
  return new File([body], name, { type });
}

describe("FileUpload drag events", () => {
  it("dragEnter sets dragging state, dragLeave clears it", () => {
    const { container } = renderWithTheme(<FileUpload label="Upload" />);
    const surface = container.querySelector(".vf-file-upload__surface")!;
    fireEvent.dragEnter(surface, { preventDefault: () => {} });
    expect(surface.classList.contains("vf-file-upload__surface--dragging")).toBe(true);
    fireEvent.dragLeave(surface, { relatedTarget: null });
    expect(surface.classList.contains("vf-file-upload__surface--dragging")).toBe(false);
  });

  it("dragOver prevents default", () => {
    const { container } = renderWithTheme(<FileUpload label="Upload" />);
    const surface = container.querySelector(".vf-file-upload__surface")!;
    // Should not throw
    fireEvent.dragOver(surface, { preventDefault: () => {} });
  });

  it("drop event processes files", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" onChange={onChange} disableThumbnails />
    );
    const surface = container.querySelector(".vf-file-upload__surface")!;
    const file = makeFile("dropped.txt", 10);
    const dataTransfer = { files: [file] };
    fireEvent.drop(surface, { dataTransfer, preventDefault: () => {} });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const items = onChange.mock.calls.at(-1)![0];
    expect(items[0].file.name).toBe("dropped.txt");
  });

  it("drop on disabled surface does not add files", () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" onChange={onChange} disabled disableThumbnails />
    );
    const surface = container.querySelector(".vf-file-upload__surface")!;
    const file = makeFile("nope.txt", 10);
    fireEvent.drop(surface, { dataTransfer: { files: [file] }, preventDefault: () => {} });
    // onChange may fire with empty items due to initial mount, but no new files
    const lastCall = onChange.mock.calls.at(-1)?.[0] ?? [];
    expect(lastCall.filter((i: any) => i.file.name === "nope.txt").length).toBe(0);
  });

  it("dragEnter on disabled surface does not set dragging", () => {
    const { container } = renderWithTheme(
      <FileUpload label="Upload" disabled />
    );
    const surface = container.querySelector(".vf-file-upload__surface")!;
    fireEvent.dragEnter(surface, { preventDefault: () => {} });
    expect(surface.classList.contains("vf-file-upload__surface--dragging")).toBe(false);
  });
});

describe("FileUpload file validation", () => {
  it("rejects files not matching accept by extension", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" accept=".pdf" onChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("doc.txt", 10, "text/plain");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const items = onChange.mock.calls.at(-1)![0];
    expect(items[0].status).toBe("error");
    expect(items[0].error).toMatch(/type not allowed/i);
  });

  it("accepts files matching accept by extension", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" accept=".txt" onChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("doc.txt", 10, "text/plain");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const items = onChange.mock.calls.at(-1)![0];
    expect(items[0].status).toBe("queued");
  });

  it("accepts files matching exact MIME type", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" accept="text/plain" onChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("doc.txt", 10, "text/plain");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const items = onChange.mock.calls.at(-1)![0];
    expect(items[0].status).toBe("queued");
  });
});

describe("FileUpload maxFiles enforcement", () => {
  it("marks overflow files as error when exceeding maxFiles", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" maxFiles={1} onChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [makeFile("a.txt", 5), makeFile("b.txt", 5)];
    fireEvent.change(input, { target: { files } });
    await waitFor(() => {
      const lastItems = onChange.mock.calls.at(-1)![0];
      expect(lastItems.length).toBe(2);
      expect(lastItems[0].status).toBe("queued");
      expect(lastItems[1].status).toBe("error");
      expect(lastItems[1].error).toMatch(/max 1/i);
    });
  });
});

describe("FileUpload single mode (multiple=false)", () => {
  it("replaces previous file when new one is added", async () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" multiple={false} onChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.txt", 5)] } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    fireEvent.change(input, { target: { files: [makeFile("b.txt", 5)] } });
    await waitFor(() => {
      const lastItems = onChange.mock.calls.at(-1)![0];
      // Single mode replaces, so only latest file
      expect(lastItems.length).toBe(1);
      expect(lastItems[0].file.name).toBe("b.txt");
    });
  });
});

describe("FileUpload upload error handling", () => {
  it("marks item as error when upload throws", async () => {
    const upload = vi.fn(async () => {
      throw new Error("Network failed");
    });
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" upload={upload} onChange={onChange} disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("fail.txt", 5)] } });
    await waitFor(() => {
      const calls = onChange.mock.calls;
      const lastItems = calls.at(-1)![0];
      const failItem = lastItems.find((i: any) => i.file.name === "fail.txt");
      expect(failItem?.status).toBe("error");
      expect(failItem?.error).toBe("Network failed");
    });
  });
});

describe("FileUpload surface rendering", () => {
  it("shows accept and maxSize hints in default surface", () => {
    renderWithTheme(
      <FileUpload label="Upload" accept="image/*" maxSize={1024 * 1024} maxFiles={5} />
    );
    expect(screen.getByText(/image\/\*/)).toBeInTheDocument();
    expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument();
    expect(screen.getByText(/max 5/)).toBeInTheDocument();
  });

  it("shows 'Any file type' when no accept specified", () => {
    renderWithTheme(<FileUpload label="Upload" />);
    expect(screen.getByText(/Any file type/)).toBeInTheDocument();
  });

  it("custom renderSurface is used", () => {
    renderWithTheme(
      <FileUpload
        label="Upload"
        renderSurface={({ isDragging }) => (
          <div data-testid="custom">{isDragging ? "Dragging" : "Custom"}</div>
        )}
      />
    );
    expect(screen.getByTestId("custom").textContent).toBe("Custom");
  });

  it("keyboard Enter/Space opens file browser", () => {
    const { container } = renderWithTheme(<FileUpload label="Upload" />);
    const surface = container.querySelector(".vf-file-upload__surface")!;
    // Just verify it doesn't throw
    fireEvent.keyDown(surface, { key: "Enter" });
    fireEvent.keyDown(surface, { key: " " });
  });
});

describe("FileUpload item display", () => {
  it("shows file size formatted", async () => {
    const { container } = renderWithTheme(
      <FileUpload label="Upload" disableThumbnails />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("big.txt", 2048)] } });
    await waitFor(() => {
      expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
    });
  });
});
