import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Progress, Stat, Table, type TableColumn } from "../Data";
import { renderWithTheme } from "../../../test/renderWithTheme";

interface Row {
  name: string;
  score: number;
}

describe("Table", () => {
  const columns: TableColumn<Row>[] = [
    { key: "name", header: "NAME", width: "1fr" },
    { key: "score", header: "SCORE", width: "60px", bold: true },
  ];
  const data: Row[] = [
    { name: "Alice", score: 94 },
    { name: "Bob", score: 78 },
  ];

  it("renders headers", () => {
    renderWithTheme(<Table columns={columns} data={data} />);
    expect(screen.getByText("NAME")).toBeInTheDocument();
    expect(screen.getByText("SCORE")).toBeInTheDocument();
  });

  it("renders row values", () => {
    renderWithTheme(<Table columns={columns} data={data} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("94")).toBeInTheDocument();
  });

  it("invokes render function when given", () => {
    const cols: TableColumn<Row>[] = [
      {
        key: "name",
        header: "NAME",
        render: (r) => <span data-testid={`n-${r.score}`}>{r.name}</span>,
      },
    ];
    renderWithTheme(<Table columns={cols} data={data} />);
    expect(screen.getByTestId("n-94")).toHaveTextContent("Alice");
  });

  it("applies per-row color function", () => {
    const cols: TableColumn<Row>[] = [
      { key: "score", header: "S", color: (r) => (r.score > 80 ? "#0f0" : "#f00") },
    ];
    renderWithTheme(<Table columns={cols} data={data} />);
    expect(screen.getByText("94")).toHaveStyle({ color: "#0f0" });
    expect(screen.getByText("78")).toHaveStyle({ color: "#f00" });
  });

  it("accepts typed row interfaces without index signature (type-only check)", () => {
    interface Typed { id: string; }
    const c: TableColumn<Typed>[] = [{ key: "id", header: "ID" }];
    renderWithTheme(<Table<Typed> columns={c} data={[{ id: "x" }]} />);
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});

describe("Stat", () => {
  it("renders label and value", () => {
    renderWithTheme(<Stat label="USERS" value="12,847" />);
    expect(screen.getByText("USERS")).toBeInTheDocument();
    expect(screen.getByText("12,847")).toBeInTheDocument();
  });

  it("renders sublabel when given", () => {
    renderWithTheme(<Stat label="X" value={1} sub="last hour" />);
    expect(screen.getByText("last hour")).toBeInTheDocument();
  });
});

describe("Progress", () => {
  // Structure when no label/showValue: root > track > fill
  const fillOf = (root: HTMLElement): HTMLElement => {
    const track = root.firstChild as HTMLElement;
    return track.firstChild as HTMLElement;
  };

  it("caps fill at 100%", () => {
    const { root } = renderWithTheme(<Progress value={150} />);
    expect(fillOf(root()).style.width).toBe("100%");
  });

  it("shows rounded percentage when showValue", () => {
    renderWithTheme(<Progress value={45} showValue label="X" />);
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("honors custom max", () => {
    const { root } = renderWithTheme(<Progress value={25} max={50} />);
    expect(fillOf(root()).style.width).toBe("50%");
  });
});
