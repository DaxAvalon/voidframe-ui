import { describe, it, expectTypeOf } from "vitest";
import type {
  ButtonProps,
  TransferProps,
  TransferItem,
  PopconfirmProps,
  SplitButtonProps,
  InlineEditProps,
  NotificationBadgeProps,
  ToggleGroupProps,
  NumberStepperProps,
  AnchorProps,
  CopyButtonProps,
  CascaderProps,
  ConfidenceMeterProps,
} from "../../src/components";
import type { VoidframeTokens } from "../../src/tokens";
import type { Size, Accent, SemanticColor } from "../../src/types";
import type { UseUndoRedoReturn, UseMapReturn, UseSetReturn, UseListReturn } from "../../src/hooks";
import { cx } from "../../src/utils/cx";

describe("Type contracts: components", () => {
  it("ButtonProps has variant union", () => {
    expectTypeOf<ButtonProps>().toHaveProperty("variant");
  });

  it("TransferProps has items and value", () => {
    expectTypeOf<TransferProps>().toHaveProperty("items");
    expectTypeOf<TransferProps>().toHaveProperty("value");
  });

  it("TransferItem has key and label", () => {
    expectTypeOf<TransferItem>().toHaveProperty("key");
    expectTypeOf<TransferItem>().toHaveProperty("label");
  });

  it("PopconfirmProps has title and onConfirm", () => {
    expectTypeOf<PopconfirmProps>().toHaveProperty("title");
    expectTypeOf<PopconfirmProps>().toHaveProperty("onConfirm");
  });

  it("SplitButtonProps has actions and onAction", () => {
    expectTypeOf<SplitButtonProps>().toHaveProperty("actions");
    expectTypeOf<SplitButtonProps>().toHaveProperty("onAction");
  });

  it("InlineEditProps has value and onSave", () => {
    expectTypeOf<InlineEditProps>().toHaveProperty("value");
    expectTypeOf<InlineEditProps>().toHaveProperty("onSave");
  });

  it("NotificationBadgeProps has count and max", () => {
    expectTypeOf<NotificationBadgeProps>().toHaveProperty("count");
    expectTypeOf<NotificationBadgeProps>().toHaveProperty("max");
  });

  it("ToggleGroupProps has items and value", () => {
    expectTypeOf<ToggleGroupProps>().toHaveProperty("items");
    expectTypeOf<ToggleGroupProps>().toHaveProperty("value");
  });

  it("NumberStepperProps has min, max, step", () => {
    expectTypeOf<NumberStepperProps>().toHaveProperty("min");
    expectTypeOf<NumberStepperProps>().toHaveProperty("max");
    expectTypeOf<NumberStepperProps>().toHaveProperty("step");
  });

  it("CascaderProps has options and onValueChange", () => {
    expectTypeOf<CascaderProps>().toHaveProperty("options");
    expectTypeOf<CascaderProps>().toHaveProperty("onValueChange");
  });

  it("ConfidenceMeterProps has value and variant", () => {
    expectTypeOf<ConfidenceMeterProps>().toHaveProperty("value");
    expectTypeOf<ConfidenceMeterProps>().toHaveProperty("variant");
  });
});

describe("Type contracts: tokens", () => {
  it("VoidframeTokens has surface tokens", () => {
    expectTypeOf<VoidframeTokens>().toHaveProperty("bg0");
    expectTypeOf<VoidframeTokens>().toHaveProperty("bg5");
  });

  it("VoidframeTokens has accent tokens", () => {
    expectTypeOf<VoidframeTokens>().toHaveProperty("green");
    expectTypeOf<VoidframeTokens>().toHaveProperty("red");
    expectTypeOf<VoidframeTokens>().toHaveProperty("blue");
  });

  it("VoidframeTokens has opacity tokens", () => {
    expectTypeOf<VoidframeTokens>().toHaveProperty("green5");
    expectTypeOf<VoidframeTokens>().toHaveProperty("green60");
    expectTypeOf<VoidframeTokens>().toHaveProperty("red20");
  });

  it("VoidframeTokens has spacing", () => {
    expectTypeOf<VoidframeTokens>().toHaveProperty("sp1");
    expectTypeOf<VoidframeTokens>().toHaveProperty("sp12");
  });

  it("VoidframeTokens has border widths", () => {
    expectTypeOf<VoidframeTokens>().toHaveProperty("borderWidth0");
    expectTypeOf<VoidframeTokens>().toHaveProperty("borderWidth4");
  });
});

describe("Type contracts: shared types", () => {
  it("Size is a string literal union", () => {
    expectTypeOf<Size>().toBeString();
  });

  it("Accent is a string literal union", () => {
    expectTypeOf<Accent>().toBeString();
  });

  it("SemanticColor is a string literal union", () => {
    expectTypeOf<SemanticColor>().toBeString();
  });
});

describe("Type contracts: hooks", () => {
  it("UseUndoRedoReturn has state and undo/redo", () => {
    expectTypeOf<UseUndoRedoReturn<string>>().toHaveProperty("state");
    expectTypeOf<UseUndoRedoReturn<string>>().toHaveProperty("undo");
    expectTypeOf<UseUndoRedoReturn<string>>().toHaveProperty("redo");
    expectTypeOf<UseUndoRedoReturn<string>>().toHaveProperty("canUndo");
    expectTypeOf<UseUndoRedoReturn<string>>().toHaveProperty("canRedo");
  });

  it("UseMapReturn has map operations", () => {
    expectTypeOf<UseMapReturn<string, number>>().toHaveProperty("map");
    expectTypeOf<UseMapReturn<string, number>>().toHaveProperty("set");
    expectTypeOf<UseMapReturn<string, number>>().toHaveProperty("get");
    expectTypeOf<UseMapReturn<string, number>>().toHaveProperty("remove");
  });

  it("UseSetReturn has set operations", () => {
    expectTypeOf<UseSetReturn<string>>().toHaveProperty("set");
    expectTypeOf<UseSetReturn<string>>().toHaveProperty("add");
    expectTypeOf<UseSetReturn<string>>().toHaveProperty("toggle");
  });

  it("UseListReturn has list operations", () => {
    expectTypeOf<UseListReturn<string>>().toHaveProperty("list");
    expectTypeOf<UseListReturn<string>>().toHaveProperty("push");
    expectTypeOf<UseListReturn<string>>().toHaveProperty("removeAt");
    expectTypeOf<UseListReturn<string>>().toHaveProperty("move");
  });
});

describe("Type contracts: utilities", () => {
  it("cx accepts mixed arguments and returns string", () => {
    expectTypeOf(cx).toBeCallableWith("a", false, null, { active: true });
    expectTypeOf(cx).returns.toBeString();
  });
});
