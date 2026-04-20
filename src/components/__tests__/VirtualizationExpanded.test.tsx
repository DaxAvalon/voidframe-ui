// Expanded tests for VirtualList, VirtualGrid, and InfiniteScroll

import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { VirtualList, VirtualGrid, InfiniteScroll } from "../Virtualization";

describe("VirtualList", () => {
  const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

  it("renders only visible items (not all 100)", () => {
    const { container } = renderWithTheme(
      <VirtualList
        items={items}
        itemHeight={30}
        style={{ height: 150 }}
        renderItem={(item, idx, style) => (
          <div key={idx} style={style}>{item}</div>
        )}
      />
    );
    // With 150px viewport and 30px items, ~5 visible + overscan = ~8-11 rendered
    const rendered = container.querySelectorAll(".vf-virtual-list div div");
    expect(rendered.length).toBeLessThan(20);
  });

  it("applies horizontal class when horizontal=true", () => {
    const { container } = renderWithTheme(
      <VirtualList
        items={items}
        itemHeight={30}
        horizontal
        style={{ height: 150 }}
        renderItem={(item, idx, style) => (
          <div key={idx} style={style}>{item}</div>
        )}
      />
    );
    expect(container.querySelector(".vf-virtual-list--horizontal")).toBeInTheDocument();
  });

  it("renders empty list without error", () => {
    const { container } = renderWithTheme(
      <VirtualList
        items={[]}
        itemHeight={30}
        style={{ height: 150 }}
        renderItem={(item, idx, style) => (
          <div key={idx} style={style}>{item}</div>
        )}
      />
    );
    expect(container.querySelector(".vf-virtual-list")).toBeInTheDocument();
  });

  it("accepts variable height function", () => {
    renderWithTheme(
      <VirtualList
        items={["short", "tall"]}
        itemHeight={(i) => (i === 0 ? 20 : 60)}
        style={{ height: 100 }}
        renderItem={(item, idx, style) => (
          <div key={idx} style={style}>{item}</div>
        )}
      />
    );
    expect(screen.getByText("short")).toBeInTheDocument();
    expect(screen.getByText("tall")).toBeInTheDocument();
  });
});

describe("VirtualGrid", () => {
  const items = Array.from({ length: 50 }, (_, i) => `Cell ${i}`);

  it("renders a subset of cells", () => {
    const { container } = renderWithTheme(
      <VirtualGrid
        items={items}
        columnCount={5}
        rowHeight={40}
        columnWidth={100}
        style={{ height: 120 }}
        renderCell={(item, idx, style) => (
          <div key={idx} style={style}>{item}</div>
        )}
      />
    );
    expect(container.querySelector(".vf-virtual-grid")).toBeInTheDocument();
    // With 120px viewport, 40px rows = 3 visible rows * 5 cols + overscan
    const rendered = container.querySelectorAll(".vf-virtual-grid div div div");
    expect(rendered.length).toBeLessThan(items.length);
  });
});

describe("InfiniteScroll", () => {
  it("renders children and sentinel", () => {
    const { container } = renderWithTheme(
      <InfiniteScroll hasMore onLoadMore={() => {}}>
        <p>Content</p>
      </InfiniteScroll>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(container.querySelector(".vf-infinite-scroll__sentinel")).toBeInTheDocument();
  });

  it("shows loader when loading", () => {
    renderWithTheme(
      <InfiniteScroll hasMore loading onLoadMore={() => {}}>
        Content
      </InfiniteScroll>
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows custom loader", () => {
    renderWithTheme(
      <InfiniteScroll hasMore loading onLoadMore={() => {}} loader={<span>Custom…</span>}>
        Content
      </InfiniteScroll>
    );
    expect(screen.getByText("Custom…")).toBeInTheDocument();
  });

  it("onLoadMore fires exactly once per intersection batch", () => {
    let ioCallback: IntersectionObserverCallback = () => {};
    class MockIO {
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    }
    const prior = globalThis.IntersectionObserver;
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
    try {
      const onLoadMore = vi.fn();
      renderWithTheme(
        <InfiniteScroll hasMore onLoadMore={onLoadMore}>
          Content
        </InfiniteScroll>
      );
      // Fire intersecting twice — only the first call should trigger.
      const entry = {
        isIntersecting: true,
        intersectionRatio: 1,
      } as IntersectionObserverEntry;
      ioCallback([entry], {} as IntersectionObserver);
      ioCallback([entry], {} as IntersectionObserver);
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.IntersectionObserver = prior;
    }
  });

  it("does not show loader when not loading", () => {
    renderWithTheme(
      <InfiniteScroll hasMore onLoadMore={() => {}}>
        Content
      </InfiniteScroll>
    );
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
});
