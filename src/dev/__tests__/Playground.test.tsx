import { describe, expect, it } from "vitest";
import { act, fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Playground } from "../Playground";

describe("Playground", () => {
  const scope = {
    Greeting: ({ name }: { name: string }) => (
      <span data-testid="greet">hello {name}</span>
    ),
  };

  it("renders the initial code block and preview", async () => {
    const { container } = renderWithTheme(
      <Playground
        code={`<Greeting name="alpha" />`}
        scope={scope}
        paneHeight={100}
      />
    );
    expect(container.querySelector(".vf-playground")).toBeTruthy();
    expect(container.querySelector(".vf-playground__preview")).toBeTruthy();
    // react-live renders asynchronously; wait for the preview node.
    await waitFor(() => {
      expect(container.querySelector('[data-testid="greet"]')?.textContent).toBe(
        "hello alpha"
      );
    });
  });

  it("reset button restores the initial preview", async () => {
    const { container, getByRole } = renderWithTheme(
      <Playground code={`<Greeting name="alpha" />`} scope={scope} />
    );
    await waitFor(() => {
      expect(container.querySelector('[data-testid="greet"]')?.textContent).toBe(
        "hello alpha"
      );
    });
    // react-live wraps a textarea inside its LiveEditor (react-simple-code-editor).
    const editable =
      (container.querySelector(".vf-playground__editor textarea") as
        | HTMLTextAreaElement
        | null) ?? null;
    if (editable) {
      await act(async () => {
        fireEvent.change(editable, {
          target: { value: `<Greeting name="beta" />` },
        });
      });
      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="greet"]')?.textContent
        ).toBe("hello beta");
      });
    }
    await act(async () => {
      fireEvent.click(getByRole("button", { name: /reset/i }));
    });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="greet"]')?.textContent).toBe(
        "hello alpha"
      );
    });
  });

  it("renders the error pane on a broken snippet", async () => {
    const { container } = renderWithTheme(
      <Playground code={`<DoesNotExist />`} scope={scope} />
    );
    await waitFor(() => {
      const err = container.querySelector(".vf-playground__error");
      expect(err?.textContent?.length ?? 0).toBeGreaterThan(0);
    });
  });
});
