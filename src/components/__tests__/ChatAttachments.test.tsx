import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  Attachment,
  AttachmentList,
  ImageAttachment,
  FileAttachment,
  CodeAttachment,
  AudioAttachment,
} from "../ChatAttachments";

describe("Attachment", () => {
  it("renders with default kind='file' and icon", () => {
    const { container } = renderWithTheme(<Attachment name="report.pdf" />);
    expect(container.querySelector("[data-kind='file']")).toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("renders each kind with correct data attribute", () => {
    for (const kind of ["image", "video", "audio", "pdf", "code"] as const) {
      const { container, unmount } = renderWithTheme(
        <Attachment kind={kind} name={`test.${kind}`} />
      );
      expect(container.querySelector(`[data-kind='${kind}']`)).toBeInTheDocument();
      unmount();
    }
  });

  it("shows size when provided", () => {
    renderWithTheme(<Attachment name="file.txt" size="2.4 MB" />);
    expect(screen.getByText("2.4 MB")).toBeInTheDocument();
  });

  it("renders thumbnail instead of icon when provided", () => {
    const { container } = renderWithTheme(
      <Attachment name="photo.jpg" thumbnail={<img src="thumb.jpg" alt="" />} />
    );
    expect(container.querySelector(".vf-attachment__thumb")).toBeInTheDocument();
    expect(container.querySelector(".vf-attachment__icon")).not.toBeInTheDocument();
  });

  it("renders custom icon when provided", () => {
    renderWithTheme(<Attachment name="file.txt" icon="X" />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("fires onOpen callback", async () => {
    const onOpen = vi.fn();
    renderWithTheme(<Attachment name="file.txt" onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: "Open file.txt" }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("fires onDownload callback", async () => {
    const onDownload = vi.fn();
    renderWithTheme(<Attachment name="file.txt" onDownload={onDownload} />);
    await userEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalled();
  });

  it("fires onRemove callback", async () => {
    const onRemove = vi.fn();
    renderWithTheme(<Attachment name="file.txt" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("hides action buttons when readOnly", () => {
    renderWithTheme(
      <Attachment name="file.txt" onDownload={() => {}} onRemove={() => {}} readOnly />
    );
    expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("disables body button when no onOpen", () => {
    const { container } = renderWithTheme(<Attachment name="file.txt" />);
    const body = container.querySelector(".vf-attachment__body") as HTMLButtonElement;
    expect(body.disabled).toBe(true);
  });

  it("renders children in extra slot", () => {
    renderWithTheme(<Attachment name="file.txt"><span>Extra content</span></Attachment>);
    expect(screen.getByText("Extra content")).toBeInTheDocument();
  });
});

describe("AttachmentList", () => {
  it("renders with list role and label", () => {
    renderWithTheme(
      <AttachmentList>
        <div>Child</div>
      </AttachmentList>
    );
    expect(screen.getByRole("list", { name: "Attachments" })).toBeInTheDocument();
  });

  it("applies orientation class", () => {
    const { container } = renderWithTheme(
      <AttachmentList orientation="vertical">
        <div>Child</div>
      </AttachmentList>
    );
    expect(container.querySelector(".vf-attachment-list--vertical")).toBeInTheDocument();
  });

  it("defaults to horizontal orientation", () => {
    const { container } = renderWithTheme(
      <AttachmentList><div>Child</div></AttachmentList>
    );
    expect(container.querySelector(".vf-attachment-list--horizontal")).toBeInTheDocument();
  });
});

describe("ImageAttachment", () => {
  it("renders an image with src and alt", () => {
    const { container } = renderWithTheme(
      <ImageAttachment src="photo.jpg" alt="A photo" />
    );
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.src).toContain("photo.jpg");
    expect(img.alt).toBe("A photo");
  });

  it("fires onOpen", async () => {
    const onOpen = vi.fn();
    renderWithTheme(
      <ImageAttachment src="photo.jpg" alt="A photo" onOpen={onOpen} />
    );
    await userEvent.click(screen.getByRole("button", { name: "A photo" }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("shows remove button when onRemove provided", async () => {
    const onRemove = vi.fn();
    renderWithTheme(
      <ImageAttachment src="photo.jpg" onRemove={onRemove} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("renders name if provided", () => {
    renderWithTheme(
      <ImageAttachment src="photo.jpg" name="vacation.jpg" />
    );
    expect(screen.getByText("vacation.jpg")).toBeInTheDocument();
  });

  it("uses 'Open image' as default aria label", () => {
    renderWithTheme(<ImageAttachment src="photo.jpg" />);
    expect(screen.getByRole("button", { name: "Open image" })).toBeInTheDocument();
  });
});

describe("FileAttachment", () => {
  it("renders with file kind", () => {
    const { container } = renderWithTheme(
      <FileAttachment name="readme.md" />
    );
    expect(container.querySelector("[data-kind='file']")).toBeInTheDocument();
  });

  it("uses extension as icon when provided", () => {
    renderWithTheme(<FileAttachment name="data.csv" extension="csv" />);
    expect(screen.getByText("CSV")).toBeInTheDocument();
  });

  it("uses custom icon over extension", () => {
    renderWithTheme(<FileAttachment name="data.csv" icon="F" />);
    expect(screen.getByText("F")).toBeInTheDocument();
  });
});

describe("CodeAttachment", () => {
  it("renders code preview with filename and language", () => {
    renderWithTheme(
      <CodeAttachment code='console.log("hi");' filename="app.js" language="javascript" />
    );
    expect(screen.getByText("app.js")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("truncates code to specified line count", () => {
    const code = Array.from({ length: 20 }, (_, i) => `line ${i}`).join("\n");
    const { container } = renderWithTheme(
      <CodeAttachment code={code} lines={5} />
    );
    // The truncated code should contain the ellipsis
    const codeEl = container.querySelector("code, pre");
    // The source uses unicode ellipsis character
    expect(codeEl?.textContent).toMatch(/\u2026/);
  });

  it("fires onOpen, onDownload, onRemove callbacks", async () => {
    const onOpen = vi.fn();
    const onDownload = vi.fn();
    const onRemove = vi.fn();
    renderWithTheme(
      <CodeAttachment
        code="x"
        onOpen={onOpen}
        onDownload={onDownload}
        onRemove={onRemove}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Open code" }));
    expect(onOpen).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Download code" }));
    expect(onDownload).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Remove code" }));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe("AudioAttachment", () => {
  it("renders with title and formatted duration", () => {
    renderWithTheme(
      <AudioAttachment src="track.mp3" title="Track 1" duration={125} />
    );
    expect(screen.getByText("Track 1")).toBeInTheDocument();
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("fires onDownload and onRemove callbacks", async () => {
    const onDownload = vi.fn();
    const onRemove = vi.fn();
    renderWithTheme(
      <AudioAttachment src="track.mp3" onDownload={onDownload} onRemove={onRemove} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Download audio" }));
    expect(onDownload).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Remove audio" }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("hides header when no title, duration, or actions", () => {
    const { container } = renderWithTheme(
      <AudioAttachment src="track.mp3" />
    );
    expect(container.querySelector(".vf-audio-attachment__header")).not.toBeInTheDocument();
  });
});
