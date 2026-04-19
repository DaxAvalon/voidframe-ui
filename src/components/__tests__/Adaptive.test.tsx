import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Container, Flex, Grid, Table } from "..";
import { Text, type TableColumn } from "..";
import { Modal } from "../Interactive";
import { Drawer } from "../Overlay";
import { Sidebar } from "../Sidebar";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Layout primitives — responsive props accepted", () => {
  it("Flex takes Responsive<direction>", () => {
    const { container } = renderWithTheme(
      <Flex direction={{ base: "column", md: "row" }} gap={{ base: 4, md: 8 }}>
        <div>a</div>
        <div>b</div>
      </Flex>
    );
    expect(container.querySelector(".vf-flex")).toBeInTheDocument();
  });

  it("Grid accepts Responsive<columns>", () => {
    const { container } = renderWithTheme(
      <Grid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 8 }}>
        <div>x</div>
      </Grid>
    );
    expect(container.querySelector(".vf-grid")).toBeInTheDocument();
  });

  it("Container accepts Responsive<maxWidth>", () => {
    const { container } = renderWithTheme(
      <Container maxWidth={{ base: "100%", lg: "1200px" }}>
        inside
      </Container>
    );
    expect(container.querySelector(".vf-container")).toBeInTheDocument();
  });
});

describe("Text — responsive size", () => {
  it("accepts a Responsive<Size> object", () => {
    const { container } = renderWithTheme(
      <Text size={{ base: "sm", md: "lg" }}>hello</Text>
    );
    // Below sm (happy-dom default 1024? see jsdom default). Either way
    // the class should exist and reflect a valid size token.
    const el = container.querySelector(".vf-text") as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.className).toMatch(/vf-text--(sm|md|lg)/);
  });

  it("accepts a 'responsive-xl' preset and resolves to a size class", () => {
    const { container } = renderWithTheme(
      <Text size="responsive-xl">Hero</Text>
    );
    const el = container.querySelector(".vf-text") as HTMLElement;
    expect(el.className).toMatch(/vf-text--(lg|xl|xxl)/);
  });
});

describe("Adaptive Modal / Drawer / Sidebar / Table", () => {
  it("Modal panel tags itself adaptive by default", () => {
    renderWithTheme(
      <Modal open onDismiss={() => {}} title="adaptive default">
        body
      </Modal>
    );
    const panel = document.querySelector(".vf-modal__panel") as HTMLElement;
    expect(panel).toHaveAttribute("data-adaptive", "true");
  });

  it("Modal opt-out removes the adaptive attr", () => {
    renderWithTheme(
      <Modal open onDismiss={() => {}} title="no adapt" adaptive={false}>
        body
      </Modal>
    );
    const panel = document.querySelector(".vf-modal__panel") as HTMLElement;
    expect(panel).not.toHaveAttribute("data-adaptive");
  });

  it("Drawer panel tags adaptive by default", () => {
    renderWithTheme(
      <Drawer open onDismiss={() => {}} title="drw">
        body
      </Drawer>
    );
    const panel = document.querySelector(".vf-drawer__panel") as HTMLElement;
    expect(panel).toHaveAttribute("data-adaptive", "true");
  });

  it("Sidebar tags adaptive by default", () => {
    const { container } = renderWithTheme(<Sidebar>x</Sidebar>);
    const aside = container.querySelector(".vf-sidebar") as HTMLElement;
    expect(aside).toHaveAttribute("data-adaptive", "true");
  });

  it("Table renders per-cell label when adaptive (default)", () => {
    const columns: TableColumn<{ name: string }>[] = [
      { key: "name", header: "NAME" },
    ];
    const { container } = renderWithTheme(
      <Table columns={columns} data={[{ name: "Alice" }]} />
    );
    expect(
      container.querySelector(".vf-table--adaptive")
    ).toBeInTheDocument();
    const label = container.querySelector(".vf-table__cell-label");
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe("NAME");
  });

  it("Table opt-out drops the adaptive label", () => {
    const columns: TableColumn<{ name: string }>[] = [
      { key: "name", header: "NAME" },
    ];
    const { container } = renderWithTheme(
      <Table columns={columns} data={[{ name: "Alice" }]} adaptive={false} />
    );
    expect(
      container.querySelector(".vf-table--adaptive")
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".vf-table__cell-label")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});

describe("Breakpoint tokens ship in VoidframeTokens", () => {
  it("defaultTokens exposes bpSm..bpXxl", async () => {
    const { defaultTokens } = await import("../../tokens");
    expect(defaultTokens.bpSm).toBe(640);
    expect(defaultTokens.bpMd).toBe(768);
    expect(defaultTokens.bpLg).toBe(1024);
    expect(defaultTokens.bpXl).toBe(1280);
    expect(defaultTokens.bpXxl).toBe(1536);
  });
});
