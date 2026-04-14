import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MegaMenu } from "../MegaMenu";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("MegaMenu", () => {
  it("opens on trigger click and shows sections", async () => {
    renderWithTheme(
      <MegaMenu>
        <MegaMenu.Trigger>Products</MegaMenu.Trigger>
        <MegaMenu.Content columns={2}>
          <MegaMenu.Section title="Infrastructure">
            <MegaMenu.Link href="/compute">Compute</MegaMenu.Link>
          </MegaMenu.Section>
          <MegaMenu.Section title="Data">
            <MegaMenu.Link href="/storage">Storage</MegaMenu.Link>
          </MegaMenu.Section>
        </MegaMenu.Content>
      </MegaMenu>
    );
    await userEvent.click(screen.getByRole("button", { name: "Products" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Compute/ })).toBeInTheDocument();
  });

  it("link description renders alongside label", async () => {
    renderWithTheme(
      <MegaMenu defaultOpen>
        <MegaMenu.Trigger>Products</MegaMenu.Trigger>
        <MegaMenu.Content>
          <MegaMenu.Section>
            <MegaMenu.Link href="/compute" description="Containers, VMs, functions">
              Compute
            </MegaMenu.Link>
          </MegaMenu.Section>
        </MegaMenu.Content>
      </MegaMenu>
    );
    expect(screen.getByText("Containers, VMs, functions")).toBeInTheDocument();
  });

  it("Escape closes the open menu", async () => {
    renderWithTheme(
      <MegaMenu defaultOpen>
        <MegaMenu.Trigger>Products</MegaMenu.Trigger>
        <MegaMenu.Content>
          <MegaMenu.Section>
            <MegaMenu.Link href="/a">A</MegaMenu.Link>
          </MegaMenu.Section>
        </MegaMenu.Content>
      </MegaMenu>
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
