import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Card } from "../Card";
import { Disclosure } from "../Disclosure";
import { Badge } from "../Badge";

const css = readFileSync(resolve(__dirname, "../../css/components/card.css"), "utf8");

describe("Card title, header and tone", () => {
  it("accepts a rich title and renders it as a heading with titleAs", () => {
    renderWithTheme(
      <Card title={<>Build <Badge>3</Badge></>} subtitle={<em>nightly</em>} titleAs="h2">
        body
      </Card>
    );
    const h = screen.getByRole("heading", { level: 2 });
    expect(h).toHaveClass("vf-card__title");
    expect(h).toHaveTextContent("Build 3");
    expect(screen.getByText("nightly").closest(".vf-card__subtitle")).toBeTruthy();
  });

  it("defaults to the Label (back-compat) and still works collapsible with a node title", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Card title={<span>Logs</span>} collapsible defaultOpen={false} onOpenChange={onOpenChange}>
        <p>content</p>
      </Card>
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(document.querySelector(".vf-label.vf-card__title")).toBeTruthy();
    expect(screen.queryByText("content")).toBeNull();
    await userEvent.click(screen.getByRole("button", { expanded: false }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("header slot replaces the title row; tone tints the card", () => {
    renderWithTheme(
      <Card header={<div data-testid="hdr">custom</div>} title="ignored" tone="danger">
        x
      </Card>
    );
    expect(screen.getByTestId("hdr").closest(".vf-card__header--custom")).toBeTruthy();
    expect(screen.queryByText("ignored")).toBeNull();
    const card = document.querySelector(".vf-card")!;
    expect(card).toHaveClass("vf-card--danger");
    expect(card).toHaveAttribute("data-tone", "danger");
    expect(css).toMatch(/\.vf-card--danger \{ background: color-mix\(in srgb, var\(--vf-danger\) 10%, var\(--vf-bg-2\)\);/);
  });
});

describe("Disclosure", () => {
  it("toggles, unmounts content when closed, exposes region semantics", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Disclosure trigger={<>Advanced <Badge>2</Badge></>} actions={<button>Reset</button>} onOpenChange={onOpenChange} surface="card">
        <p>options</p>
      </Disclosure>
    );
    const root = document.querySelector(".vf-disclosure")!;
    expect(root).toHaveClass("vf-disclosure--card");
    expect(root).toHaveAttribute("data-open", "false");
    const trigger = screen.getByRole("button", { name: /Advanced 2/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("options")).toBeNull();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const region = screen.getByRole("region", { name: /Advanced 2/ });
    expect(region).toHaveTextContent("options");
    expect(trigger).toHaveAttribute("aria-controls", region.id);
  });

  it("controlled open, keepMounted hides instead of unmounting, headingAs wraps the toggle", () => {
    const { rerender } = renderWithTheme(
      <Disclosure trigger="Section" open={false} keepMounted headingAs="h3">
        <p>kept</p>
      </Disclosure>
    );
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    const content = document.querySelector(".vf-disclosure__content") as HTMLElement;
    expect(content).toBeTruthy();
    expect(content.hidden).toBe(true);
    rerender(
      <Disclosure trigger="Section" open keepMounted headingAs="h3">
        <p>kept</p>
      </Disclosure>
    );
    expect((document.querySelector(".vf-disclosure__content") as HTMLElement).hidden).toBe(false);
  });
});
