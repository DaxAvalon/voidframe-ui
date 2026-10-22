import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { DropTarget, FilePickerButton, IssueList, fileMatchesAccept } from "../FilePicker";
import { DropZone } from "../FormExtended";

function file(name: string, type = "text/csv") {
  return new File(["a,b"], name, { type });
}

describe("FilePickerButton", () => {
  it("opens the hidden input from the button and reports files, then resets the input", () => {
    const onFiles = vi.fn();
    renderWithTheme(<FilePickerButton onFiles={onFiles} accept=".csv" inputProps={{ "data-testid": "input" } as never} />);
    const button = screen.getByRole("button", { name: "Choose file" });
    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.type).toBe("file");
    expect(input.accept).toBe(".csv");
    expect(input.multiple).toBe(false);
    expect(input).toHaveAttribute("aria-hidden", "true");
    const click = vi.spyOn(input, "click");
    fireEvent.click(button);
    expect(click).toHaveBeenCalled();
    fireEvent.change(input, { target: { files: [file("rows.csv")] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "rows.csv" })]);
    expect(input.value).toBe("");
  });

  it("uses the plural default label with multiple and a custom label when given", () => {
    renderWithTheme(<FilePickerButton onFiles={() => undefined} multiple />);
    expect(screen.getByRole("button", { name: "Choose files" })).toBeInTheDocument();
    renderWithTheme(<FilePickerButton onFiles={() => undefined} label="Import CSV" />);
    expect(screen.getByRole("button", { name: "Import CSV" })).toBeInTheDocument();
  });
});

describe("DropTarget", () => {
  it("decorates only, tracks dragging and filters by accept", () => {
    const onFiles = vi.fn();
    const onRejected = vi.fn();
    renderWithTheme(
      <DropTarget onFiles={onFiles} onRejected={onRejected} accept=".csv,image/*" data-testid="t">
        {({ dragging }) => <span>{dragging ? "Release" : "Drop here"}</span>}
      </DropTarget>
    );
    const target = screen.getByTestId("t");
    expect(target).not.toHaveAttribute("role");
    expect(screen.queryByRole("button")).toBeNull();
    fireEvent.dragEnter(target);
    expect(target).toHaveAttribute("data-dragging");
    expect(screen.getByText("Release")).toBeInTheDocument();
    fireEvent.dragLeave(target);
    expect(target).not.toHaveAttribute("data-dragging");
    fireEvent.drop(target, { dataTransfer: { files: [file("a.csv"), file("b.txt", "text/plain"), file("c.png", "image/png")] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.csv" }), expect.objectContaining({ name: "c.png" })]);
    expect(onRejected).toHaveBeenCalledWith([expect.objectContaining({ name: "b.txt" })]);
    expect(fileMatchesAccept(file("x.CSV"), ".csv")).toBe(true);
    expect(fileMatchesAccept(file("x.png", "image/png"), "image/*")).toBe(true);
    expect(fileMatchesAccept(file("x.png", "image/png"), "text/csv")).toBe(false);
    expect(fileMatchesAccept(file("x.png", "image/png"), undefined)).toBe(true);
  });

  it("DropZone interactive={false} drops the button role and hosts a FilePickerButton", () => {
    const onFiles = vi.fn();
    renderWithTheme(
      <DropZone interactive={false} onFiles={onFiles} data-testid="z">
        <FilePickerButton onFiles={onFiles} label="Browse" />
      </DropZone>
    );
    const zone = screen.getByTestId("z");
    expect(zone).not.toHaveAttribute("role");
    expect(zone.querySelector('input[type="file"]:not(.vf-file-picker__input)')).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.drop(zone, { dataTransfer: { files: [file("a.csv")] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.csv" })]);
  });

  it("DropZone renderSurface receives the drag state and open helper", () => {
    renderWithTheme(<DropZone renderSurface={({ dragging }) => <em>{dragging ? "yes" : "no"}</em>} data-testid="z" />);
    expect(screen.getByText("no")).toBeInTheDocument();
    fireEvent.dragOver(screen.getByTestId("z"));
    expect(screen.getByText("yes")).toBeInTheDocument();
  });
});

describe("IssueList", () => {
  const issues = Array.from({ length: 7 }, (_, i) => ({
    label: `Row ${i + 1}`,
    message: `Problem ${i + 1}`,
    tone: (i % 2 ? "warning" : "danger") as "warning" | "danger",
  }));

  it("caps rows, shows the overflow count and expands", () => {
    renderWithTheme(<IssueList issues={issues} max={5} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-tone", "danger");
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("data-tone", "warning");
    fireEvent.click(screen.getByRole("button", { name: "2 more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: "Show fewer" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("renders nothing when empty unless `empty` is given", () => {
    const { container } = renderWithTheme(<IssueList issues={[]} />);
    expect(container.querySelector(".vf-issue-list")).toBeNull();
    renderWithTheme(<IssueList issues={[]} empty="No issues" />);
    expect(screen.getByText("No issues")).toBeInTheDocument();
  });
});
