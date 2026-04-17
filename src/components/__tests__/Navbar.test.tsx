import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Navbar, TabBar } from "../Navbar";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Navbar", () => {
  it("renders nav with brand and links", () => {
    renderWithTheme(
      <Navbar>
        <Navbar.Brand>VF</Navbar.Brand>
        <Navbar.Links>
          <Navbar.Link href="/" active>Home</Navbar.Link>
          <Navbar.Link href="/about">About</Navbar.Link>
        </Navbar.Links>
      </Navbar>
    );
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("renders Actions slot", () => {
    renderWithTheme(
      <Navbar>
        <Navbar.Brand>VF</Navbar.Brand>
        <Navbar.Actions>
          <button>Login</button>
        </Navbar.Actions>
      </Navbar>
    );
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(document.querySelector(".vf-navbar__actions")).toBeInTheDocument();
  });
});

describe("TabBar", () => {
  it("selects the value on click", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TabBar defaultValue="home" onChange={onChange}>
        <TabBar.Item value="home">Home</TabBar.Item>
        <TabBar.Item value="search">Search</TabBar.Item>
      </TabBar>
    );
    await userEvent.click(screen.getByRole("tab", { name: "Search" }));
    expect(onChange).toHaveBeenLastCalledWith("search");
  });

  it("marks selected tab with aria-selected=true", () => {
    renderWithTheme(
      <TabBar value="search">
        <TabBar.Item value="home">Home</TabBar.Item>
        <TabBar.Item value="search">Search</TabBar.Item>
      </TabBar>
    );
    expect(screen.getByRole("tab", { name: "Search" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
