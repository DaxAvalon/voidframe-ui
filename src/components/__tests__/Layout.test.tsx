import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import {
  AspectRatio,
  Box,
  Center,
  Container,
  Flex,
  Grid,
  HStack,
  SplitView,
  Stretch,
  VStack,
} from "../Layout";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Flex", () => {
  it("renders children", () => {
    renderWithTheme(
      <Flex>
        <span>a</span>
        <span>b</span>
      </Flex>
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("applies direction=column class", () => {
    const { root } = renderWithTheme(
      <Flex direction="column">
        <span>x</span>
      </Flex>
    );
    expect(root()).toHaveClass("vf-flex");
    expect(root()).toHaveClass("vf-flex--column");
  });

  it("renders with custom `as` tag", () => {
    renderWithTheme(
      <Flex as="section" data-testid="fx">
        <span>y</span>
      </Flex>
    );
    expect(screen.getByTestId("fx").tagName).toBe("SECTION");
  });
});

describe("HStack / VStack", () => {
  it("HStack uses .vf-hstack, VStack uses .vf-vstack", () => {
    const { root: h } = renderWithTheme(
      <HStack>
        <span>a</span>
      </HStack>
    );
    const { root: v } = renderWithTheme(
      <VStack>
        <span>b</span>
      </VStack>
    );
    expect(h()).toHaveClass("vf-hstack");
    expect(v()).toHaveClass("vf-vstack");
  });

  it("VStack wrap=true applies .vf-flex--wrap (mirroring HStack) and does not leak to DOM", () => {
    const { root } = renderWithTheme(
      <VStack wrap>
        <span>a</span>
      </VStack>
    );
    expect(root()).toHaveClass("vf-flex--wrap");
    // `wrap` is a component-level prop, not an HTML attribute — must not land on the DOM node
    expect(root().hasAttribute("wrap")).toBe(false);
  });
});

describe("Grid", () => {
  it("renders with column number", () => {
    const { root } = renderWithTheme(
      <Grid columns={3}>
        <span>a</span>
      </Grid>
    );
    expect(root().style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("uses minChildWidth with auto-fill", () => {
    const { root } = renderWithTheme(
      <Grid minChildWidth="200px">
        <span>a</span>
      </Grid>
    );
    expect(root().style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(200px, 1fr))"
    );
  });
});

describe("Container", () => {
  it("applies maxWidth", () => {
    const { root } = renderWithTheme(
      <Container maxWidth="800px">
        <span>x</span>
      </Container>
    );
    expect(root().style.maxWidth).toBe("800px");
  });
});

describe("Center", () => {
  it("uses the .vf-center class", () => {
    const { root } = renderWithTheme(
      <Center>
        <span>x</span>
      </Center>
    );
    expect(root()).toHaveClass("vf-center");
  });
});

describe("AspectRatio", () => {
  it("applies padding-bottom for ratio", () => {
    const { root } = renderWithTheme(
      <AspectRatio ratio={2}>
        <span>x</span>
      </AspectRatio>
    );
    // 1 / 2 * 100 = 50
    expect(root().style.paddingBottom).toBe("50%");
  });
});

describe("SplitView", () => {
  it("renders left and right regions", () => {
    renderWithTheme(
      <SplitView left={<span>L</span>} right={<span>R</span>} />
    );
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
  });
});

describe("Stretch", () => {
  it("uses the .vf-stretch class", () => {
    const { root } = renderWithTheme(<Stretch />);
    expect(root()).toHaveClass("vf-stretch");
  });
});

describe("Box", () => {
  it("renders as div by default", () => {
    const { root } = renderWithTheme(<Box>x</Box>);
    expect(root().tagName).toBe("DIV");
  });

  it("applies background color", () => {
    const { root } = renderWithTheme(<Box bg="#111">x</Box>);
    // happy-dom preserves the literal value; jsdom normalizes to rgb().
    expect(root().style.background.toLowerCase()).toMatch(/^(#111|rgb\(17, 17, 17\))$/);
  });

  it("renders with custom `as`", () => {
    renderWithTheme(
      <Box as="section" data-testid="bx">
        x
      </Box>
    );
    expect(screen.getByTestId("bx").tagName).toBe("SECTION");
  });
});
