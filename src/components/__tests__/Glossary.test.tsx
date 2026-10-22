import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { GlossaryList, GlossaryProvider, Term } from "../Glossary";
import { HelpDrawer } from "../HelpDrawer";

const terms = {
  pfh: { term: "PFH", definition: "Per finished hour of audio.", section: "Billing" },
  "room-tone": { term: "Room tone", definition: "The sound of the room with nobody speaking.", section: "Audio", see: ["noise-floor"] },
  "noise-floor": { term: "Noise floor", definition: "The level of background noise.", section: "Audio" },
};

describe("Term", () => {
  it("renders a focusable dotted term whose definition appears on focus", async () => {
    renderWithTheme(
      <GlossaryProvider terms={terms}>
        <p>
          Paid <Term id="pfh" /> for the book.
        </p>
      </GlossaryProvider>
    );
    const term = screen.getByText("PFH");
    expect(term.tagName).toBe("DFN");
    expect(term).toHaveClass("vf-term");
    expect(term).toHaveAttribute("tabindex", "0");
    fireEvent.focus(term);
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Per finished hour of audio."));
    expect(term).toHaveAttribute("aria-describedby");
  });

  it("falls back to plain text for unknown ids and accepts an inline definition", () => {
    renderWithTheme(
      <GlossaryProvider terms={terms}>
        <Term id="nope">Mystery</Term>
        <Term id="adhoc" definition="Defined inline" as="span">Ad hoc</Term>
      </GlossaryProvider>
    );
    expect(screen.getByText("Mystery")).toHaveAttribute("data-term-missing");
    expect(screen.getByText("Mystery")).not.toHaveAttribute("tabindex");
    expect(screen.getByText("Ad hoc").tagName).toBe("SPAN");
    expect(screen.getByText("Ad hoc")).toHaveAttribute("tabindex", "0");
  });
});

describe("GlossaryList", () => {
  it("groups by section alphabetically, anchors terms and links see-also", () => {
    const onSelect = vi.fn();
    const { container } = renderWithTheme(
      <GlossaryProvider terms={terms}>
        <GlossaryList onSelect={onSelect} />
      </GlossaryProvider>
    );
    const titles = Array.from(container.querySelectorAll(".vf-glossary__title")).map((n) => n.textContent);
    expect(titles).toEqual(["Audio", "Billing"]);
    const dts = Array.from(container.querySelectorAll("dt")).map((n) => n.textContent);
    expect(dts).toEqual(["Noise floor", "Room tone", "PFH"]);
    expect(container.querySelector("#term-pfh")).not.toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Noise floor" }));
    expect(onSelect).toHaveBeenCalledWith("noise-floor");
  });

  it("supports explicit sections and a filter", () => {
    const { container } = renderWithTheme(
      <GlossaryProvider terms={terms}>
        <GlossaryList sections={[{ title: "Core", ids: ["room-tone", "pfh"] }]} filter="room" />
      </GlossaryProvider>
    );
    expect(Array.from(container.querySelectorAll("dt")).map((n) => n.textContent)).toEqual(["Room tone"]);
    renderWithTheme(
      <GlossaryProvider terms={terms}>
        <GlossaryList filter="zzz" empty="Nothing" />
      </GlossaryProvider>
    );
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });
});

describe("HelpDrawer", () => {
  it("renders orientation, workflow steps and the glossary when open", () => {
    renderWithTheme(
      <GlossaryProvider terms={terms}>
        <HelpDrawer
          open
          title="About this screen"
          orientation={<p>Record, then review.</p>}
          workflow={[{ label: "Arm the input" }, { label: "Record", description: "Press the pedal" }, { label: "Review" }]}
          currentStep={1}
          glossary={{ sections: [{ title: "Audio", ids: ["room-tone"] }] }}
        />
      </GlossaryProvider>
    );
    expect(screen.getByRole("heading", { name: "About this screen" })).toBeInTheDocument();
    expect(screen.getByText("Record, then review.")).toBeInTheDocument();
    expect(screen.getByText("Press the pedal")).toBeInTheDocument();
    expect(screen.getByText("Room tone")).toBeInTheDocument();
    expect(screen.queryByText("PFH")).toBeNull();
    expect(screen.getByRole("button", { name: "Close help" })).toBeInTheDocument();
  });
});
