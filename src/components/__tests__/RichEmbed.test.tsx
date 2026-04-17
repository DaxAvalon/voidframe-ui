// Tests for LegalText and Mermaid components

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { LegalText, Mermaid } from "../RichEmbed";

describe("LegalText", () => {
  it("renders children with default size", () => {
    const { container } = renderWithTheme(
      <LegalText>Terms of Service</LegalText>
    );
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(container.querySelector(".vf-legal--xs")).toBeInTheDocument();
  });

  it("renders with sm size", () => {
    const { container } = renderWithTheme(
      <LegalText size="sm">Privacy Policy</LegalText>
    );
    expect(container.querySelector(".vf-legal--sm")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = renderWithTheme(
      <LegalText className="custom">text</LegalText>
    );
    expect(container.querySelector(".vf-legal.custom")).toBeInTheDocument();
  });
});

describe("Mermaid", () => {
  it("shows loading state initially with loader", () => {
    const loader = () => new Promise<never>(() => {}); // never resolves
    renderWithTheme(<Mermaid chart="graph TD; A-->B;" loader={loader} />);
    expect(screen.getByText("Loading diagram…")).toBeInTheDocument();
  });

  it("shows error when no loader provided", () => {
    renderWithTheme(<Mermaid chart="graph TD; A-->B;" />);
    expect(screen.getByText(/peer dep not configured/)).toBeInTheDocument();
  });

  it("shows error when loader returns null", async () => {
    const loader = vi.fn().mockResolvedValue(null);
    renderWithTheme(<Mermaid chart="graph TD; A-->B;" loader={loader} />);
    await waitFor(() => {
      expect(screen.getByText(/loader returned null/)).toBeInTheDocument();
    });
  });

  it("renders SVG on successful load", async () => {
    const mockApi = {
      initialize: vi.fn(),
      render: vi.fn().mockResolvedValue({ svg: "<svg><rect/></svg>" }),
    };
    const loader = vi.fn().mockResolvedValue(mockApi);
    const { container } = renderWithTheme(
      <Mermaid chart="graph TD; A-->B;" loader={loader} />
    );
    await waitFor(() => {
      expect(container.querySelector(".vf-mermaid__svg")).toBeInTheDocument();
    });
    expect(mockApi.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "dark", securityLevel: "strict" })
    );
  });

  it("shows error on render failure", async () => {
    const mockApi = {
      initialize: vi.fn(),
      render: vi.fn().mockRejectedValue(new Error("Parse error")),
    };
    const loader = vi.fn().mockResolvedValue(mockApi);
    renderWithTheme(
      <Mermaid chart="invalid chart" loader={loader} />
    );
    await waitFor(() => {
      expect(screen.getByText("Parse error")).toBeInTheDocument();
    });
    // Raw source shown as fallback
    expect(screen.getByText("invalid chart")).toBeInTheDocument();
  });

  it("passes custom theme and securityLevel", async () => {
    const mockApi = {
      initialize: vi.fn(),
      render: vi.fn().mockResolvedValue({ svg: "<svg/>" }),
    };
    const loader = vi.fn().mockResolvedValue(mockApi);
    renderWithTheme(
      <Mermaid chart="x" theme="forest" securityLevel="loose" loader={loader} />
    );
    await waitFor(() => {
      expect(mockApi.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "forest", securityLevel: "loose" })
      );
    });
  });

  it("has role=img and aria-label", () => {
    renderWithTheme(<Mermaid chart="graph TD; A-->B;" />);
    const el = screen.getByRole("img", { name: "Diagram" });
    expect(el).toBeInTheDocument();
  });
});
