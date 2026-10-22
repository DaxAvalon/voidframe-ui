// Regression: mounting several <CommandPalette.Item>s must not cause an
// unbounded re-render loop (scoredOrder rebuilt per render → ctx identity
// change → Item effects → register/unregister → force → …).
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { CommandPalette } from "../CommandPalette";

function Counter({ counts }: { counts: { n: number } }) {
  const ref = useRef(0);
  ref.current += 1;
  counts.n = ref.current;
  return null;
}

describe("CommandPalette render loop", () => {
  it("settles after mounting several items with a bounded number of renders", async () => {
    const counts = { n: 0 };
    const onA = vi.fn();
    renderWithTheme(
      <CommandPalette defaultOpen>
        <Counter counts={counts} />
        <CommandPalette.Input placeholder="Search…" />
        <CommandPalette.List>
          <CommandPalette.Group heading="Go">
            <CommandPalette.Item value="alpha" onSelect={onA}>Alpha</CommandPalette.Item>
            <CommandPalette.Item value="beta" onSelect={() => {}}>Beta</CommandPalette.Item>
            <CommandPalette.Item value="gamma" onSelect={() => {}}>Gamma</CommandPalette.Item>
          </CommandPalette.Group>
        </CommandPalette.List>
      </CommandPalette>
    );
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
    // One mount plus a handful of registration/highlight updates.
    expect(counts.n).toBeLessThan(12);
    const settled = counts.n;
    await new Promise((r) => setTimeout(r, 50));
    expect(counts.n).toBe(settled);
  });

  it("filters by query and keywords", async () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="Search…" />
        <CommandPalette.List>
          <CommandPalette.Item value="Settings" keywords={["preferences", "config"]} onSelect={() => {}}>
            Settings
          </CommandPalette.Item>
          <CommandPalette.Item value="Inbox" onSelect={() => {}}>Inbox</CommandPalette.Item>
        </CommandPalette.List>
      </CommandPalette>
    );
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    fireEvent.change(screen.getByPlaceholderText("Search…"), { target: { value: "prefer" } });
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Settings");
    });
  });

  it("selecting an item fires onSelect and closes", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="Search…" />
        <CommandPalette.List>
          <CommandPalette.Item value="one" onSelect={onSelect}>One</CommandPalette.Item>
        </CommandPalette.List>
      </CommandPalette>
    );
    const option = await screen.findByRole("option");
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.body.querySelector(".vf-cmd")).not.toBeInTheDocument());
  });
});
