import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EmptyLayout,
  GridItem,
  PageHeader,
  SafeArea,
  Section,
  Stack,
  Sticky,
} from "../LayoutExtended";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("LayoutExtended", () => {
  it("Stack renders a VStack", () => {
    const { container } = renderWithTheme(
      <Stack>
        <span>a</span>
        <span>b</span>
      </Stack>
    );
    expect(container.querySelector(".vf-vstack")).toBeInTheDocument();
  });

  it("GridItem forwards colSpan to gridColumn style", () => {
    const { container } = renderWithTheme(<GridItem colSpan={2}>hi</GridItem>);
    const el = container.querySelector(".vf-grid-item") as HTMLElement;
    expect(el.style.gridColumn).toContain("span 2");
  });

  it("Sticky applies sticky positioning with offset", () => {
    const { container } = renderWithTheme(<Sticky top={10}>head</Sticky>);
    const el = container.querySelector(".vf-sticky") as HTMLElement;
    expect(el.style.position).toBe("sticky");
    expect(el.style.top).toBe("10px");
  });

  it("SafeArea renders and accepts edge flags without throwing", () => {
    // happy-dom strips env() from inline styles so we can't assert the raw
    // padding values; verify the component mounts and carries its classname.
    const { container } = renderWithTheme(<SafeArea top bottom>body</SafeArea>);
    expect(container.querySelector(".vf-safe-area")).toBeInTheDocument();
  });

  it("Section renders title, description, actions", () => {
    renderWithTheme(
      <Section title="Profile" description="Edit your details" actions={<button>Save</button>}>
        <div data-testid="body">body</div>
      </Section>
    );
    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("Edit your details")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
  });

  it("PageHeader renders title as h1 and shows eyebrow/actions", () => {
    renderWithTheme(
      <PageHeader
        eyebrow="SECTION"
        title="Users"
        description="Manage team"
        actions={<button>New</button>}
      />
    );
    expect(screen.getByRole("heading", { level: 1, name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("SECTION")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("EmptyLayout applies max-width var", () => {
    const { container } = renderWithTheme(<EmptyLayout maxWidth="lg">content</EmptyLayout>);
    const el = container.querySelector(".vf-empty-layout") as HTMLElement;
    expect(el.style.getPropertyValue("--vf-empty-max")).toBe("720px");
  });
});
