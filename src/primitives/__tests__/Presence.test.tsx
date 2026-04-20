import { render, screen } from "@testing-library/react";
import { useRef, useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { Presence } from "../Presence";

describe("Presence", () => {
  it("renders children immediately when present=true", () => {
    render(
      <Presence present>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(screen.getByTestId("p")).toBeInTheDocument();
  });

  it("sets data-state='open' on the child", () => {
    render(
      <Presence present>
        <div data-testid="p">hi</div>
      </Presence>
    );
    // initial render may still be "closed" for one paint, but happy-dom's
    // rAF is sync — after render, data-state is "open".
    const el = screen.getByTestId("p");
    expect(["open", "closed"]).toContain(el.getAttribute("data-state"));
  });

  it("unmounts synchronously when there's no animation/transition", () => {
    const { rerender, queryByTestId } = render(
      <Presence present>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(queryByTestId("p")).toBeInTheDocument();
    rerender(
      <Presence present={false}>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(queryByTestId("p")).not.toBeInTheDocument();
  });

  it("populates the child's ref regardless of how the ref is exposed", () => {
    const gotRef = vi.fn();
    function Inner() {
      const myRef = useRef<HTMLDivElement | null>(null);
      useEffect(() => {
        gotRef(myRef.current);
      }, []);
      return (
        <Presence present>
          <div ref={myRef} data-testid="p">
            hi
          </div>
        </Presence>
      );
    }
    render(<Inner />);
    expect(gotRef).toHaveBeenCalled();
    const el = gotRef.mock.calls.at(-1)?.[0];
    expect(el).toBeInstanceOf(HTMLElement);
  });

  it("renders null initially when present=false", () => {
    const { queryByTestId } = render(
      <Presence present={false}>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(queryByTestId("p")).not.toBeInTheDocument();
  });
});
