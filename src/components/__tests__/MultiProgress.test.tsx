import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiProgress, type MultiProgressItem } from "../MultiProgress";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const baseItems: MultiProgressItem[] = [
  { key: "a", label: "Upload", value: 50 },
  { key: "b", label: "Download", value: 75 },
  { key: "c", label: "Process", value: 100, status: "success" },
];

describe("MultiProgress", () => {
  it("renders all items", () => {
    renderWithTheme(<MultiProgress items={baseItems} />);
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.getByText("Process")).toBeInTheDocument();
  });

  it("labels display correctly", () => {
    renderWithTheme(<MultiProgress items={baseItems} />);
    expect(screen.getAllByText(/Upload|Download|Process/)).toHaveLength(3);
  });

  it("bar width matches value as percentage", () => {
    const { container } = renderWithTheme(
      <MultiProgress items={[{ key: "a", label: "Test", value: 40 }]} />
    );
    const fill = container.querySelector(
      ".vf-multi-progress__fill"
    ) as HTMLElement;
    expect(fill.style.width).toBe("40%");
  });

  it("supports custom max", () => {
    const { container } = renderWithTheme(
      <MultiProgress
        items={[{ key: "a", label: "Test", value: 50, max: 200 }]}
      />
    );
    const fill = container.querySelector(
      ".vf-multi-progress__fill"
    ) as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("shows percentage values by default", () => {
    renderWithTheme(
      <MultiProgress items={[{ key: "a", label: "Test", value: 50 }]} />
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("hides values when showValues={false}", () => {
    renderWithTheme(
      <MultiProgress
        items={[{ key: "a", label: "Test", value: 50 }]}
        showValues={false}
      />
    );
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("renders description", () => {
    renderWithTheme(
      <MultiProgress
        items={[
          { key: "a", label: "Test", value: 50, description: "Halfway there" },
        ]}
      />
    );
    expect(screen.getByText("Halfway there")).toBeInTheDocument();
  });

  it.each(["active", "success", "error", "paused", "pending"] as const)(
    "applies status class %s",
    (status) => {
      const { container } = renderWithTheme(
        <MultiProgress
          items={[{ key: "a", label: "Test", value: 50, status }]}
        />
      );
      expect(
        container.querySelector(`.vf-multi-progress__item--${status}`)
      ).toBeInTheDocument();
    }
  );

  it("success status shows checkmark icon", () => {
    renderWithTheme(
      <MultiProgress
        items={[{ key: "a", label: "Test", value: 100, status: "success" }]}
      />
    );
    expect(screen.getByLabelText("success")).toHaveTextContent("\u2713");
  });

  it("error status shows X icon", () => {
    renderWithTheme(
      <MultiProgress
        items={[{ key: "a", label: "Test", value: 30, status: "error" }]}
      />
    );
    expect(screen.getByLabelText("error")).toHaveTextContent("\u2717");
  });

  it.each(["default", "success", "danger", "warning", "info"] as const)(
    "applies tone class %s",
    (tone) => {
      const { container } = renderWithTheme(
        <MultiProgress
          items={[{ key: "a", label: "Test", value: 50, tone }]}
        />
      );
      expect(
        container.querySelector(`.vf-multi-progress__item--${tone}`)
      ).toBeInTheDocument();
    }
  );

  it("striped class on active items when striped=true", () => {
    const { container } = renderWithTheme(
      <MultiProgress
        items={[{ key: "a", label: "Test", value: 50, status: "active" }]}
        striped
      />
    );
    expect(
      container.querySelector(".vf-multi-progress__fill--striped")
    ).toBeInTheDocument();
  });

  it("onCancel shows cancel button and fires with key", async () => {
    const onCancel = vi.fn();
    renderWithTheme(
      <MultiProgress
        items={[{ key: "abc", label: "Upload", value: 50 }]}
        onCancel={onCancel}
      />
    );
    const cancelBtn = screen.getByRole("button", { name: "Cancel Upload" });
    expect(cancelBtn).toBeInTheDocument();
    await userEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledWith("abc");
  });

  it("applies compact class", () => {
    const { container } = renderWithTheme(
      <MultiProgress items={baseItems} compact />
    );
    expect(
      container.querySelector(".vf-multi-progress--compact")
    ).toBeInTheDocument();
  });

  it("animated={false} applies static class", () => {
    const { container } = renderWithTheme(
      <MultiProgress items={baseItems} animated={false} />
    );
    expect(
      container.querySelector(".vf-multi-progress--static")
    ).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { container } = renderWithTheme(
      <MultiProgress items={baseItems} size={size} />
    );
    expect(
      container.querySelector(`.vf-multi-progress--${size}`)
    ).toBeInTheDocument();
  });

  it("renders empty items without error", () => {
    const { container } = renderWithTheme(<MultiProgress items={[]} />);
    expect(
      container.querySelector(".vf-multi-progress")
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll(".vf-multi-progress__item")
    ).toHaveLength(0);
  });

  it("clamps value above max and below 0", () => {
    const { container } = renderWithTheme(
      <MultiProgress
        items={[
          { key: "over", label: "Over", value: 200, max: 100 },
          { key: "under", label: "Under", value: -10 },
        ]}
      />
    );
    const fills = container.querySelectorAll(".vf-multi-progress__fill");
    expect((fills[0] as HTMLElement).style.width).toBe("100%");
    expect((fills[1] as HTMLElement).style.width).toBe("0%");
  });

  it("has role=progressbar and aria-valuenow for a11y", async () => {
    const { container } = renderWithTheme(
      <MultiProgress
        items={[{ key: "a", label: "Upload", value: 42 }]}
      />
    );
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    await expectNoA11yViolations(container);
  });
});
