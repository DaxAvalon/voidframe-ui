import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Box, Flex, Grid, HStack, VStack, sizingStyle, splitSizing } from "../Layout";
import { Spacer } from "../Text";

const css = (rel: string) => readFileSync(resolve(__dirname, "../../css/components", rel), "utf8");

describe("sizing props", () => {
  it("sizingStyle maps numbers to px and strings verbatim; splitSizing keeps DOM props clean", () => {
    expect(sizingStyle({ w: 240, minW: "20ch", maxW: "100%", h: 32, minH: 0, maxH: "50vh", flex: "1 1 0", position: "relative", overflow: "auto", margin: 8 })).toEqual({
      width: "240px", minWidth: "20ch", maxWidth: "100%", height: "32px", minHeight: "0px", maxHeight: "50vh", flex: "1 1 0", position: "relative", overflow: "auto", margin: "8px",
    });
    const { sizing, rest } = splitSizing({ w: 1, scrollable: true, id: "x", "data-foo": "y" } as never);
    expect(sizing).toEqual({ w: 1, scrollable: true });
    expect(rest).toEqual({ id: "x", "data-foo": "y" });
  });

  it("Box, Flex, HStack, VStack and Grid apply sizing inline and scrollable as a class", () => {
    renderWithTheme(
      <>
        <Box data-testid="box" w={200} minW="10ch" flex={1} position="relative" />
        <Flex data-testid="flex" scrollable minH={0} />
        <HStack data-testid="h" margin={4} justify="space-between" maxH="40vh" />
        <VStack data-testid="v" scrollable />
        <Grid data-testid="g" align="center" justify="start" alignContent="end" h="100%" scrollable />
      </>
    );
    const box = document.querySelector("[data-testid='box']") as HTMLElement;
    expect(box.style.width).toBe("200px");
    expect(box.style.minWidth).toBe("10ch");
    expect(box.style.flex).toMatch(/^1( 1 0%)?$/);
    expect(box.style.position).toBe("relative");
    expect(box).not.toHaveAttribute("w");
    const flex = document.querySelector("[data-testid='flex']") as HTMLElement;
    expect(flex).toHaveClass("vf-scrollable");
    expect(flex.style.minHeight).toBe("0px");
    const h = document.querySelector("[data-testid='h']") as HTMLElement;
    expect(h.style.margin).toBe("4px");
    expect(h.style.justifyContent).toBe("space-between");
    expect(h.style.maxHeight).toBe("40vh");
    expect(document.querySelector("[data-testid='v']")).toHaveClass("vf-scrollable");
    const g = document.querySelector("[data-testid='g']") as HTMLElement;
    expect(g.style.alignItems).toBe("center");
    expect(g.style.justifyItems).toBe("start");
    expect(g.style.alignContent).toBe("end");
    expect(g.style.height).toBe("100%");
    expect(g).toHaveClass("vf-scrollable");
    expect(css("layout.css")).toMatch(/\.vf-scrollable \{\n  min-height: 0;\n  min-width: 0;\n  overflow: auto;/);
  });

  it("Spacer mode='push' adds the push class with auto start margin", () => {
    renderWithTheme(<><Spacer data-testid="fill" /><Spacer data-testid="push" mode="push" /></>);
    expect(document.querySelector("[data-testid='fill']")).not.toHaveClass("vf-spacer--push");
    expect(document.querySelector("[data-testid='push']")).toHaveClass("vf-spacer--push");
    expect(css("text.css")).toMatch(/\.vf-spacer--push \{[^}]*margin-inline-start: auto;/);
  });
});
