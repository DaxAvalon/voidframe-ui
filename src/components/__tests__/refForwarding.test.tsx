// Phase 2 invariant: every exported component forwards its ref.
// One file, one assertion per component, so a regression is a single
// failing test instead of a debugging hunt.

import { createRef, type ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import * as Components from "..";

describe("Components — forwardRef + displayName invariants", () => {
  // (component, sample props, ref element type)
  const cases: Array<[
    string,
    ComponentType<any>,
    Record<string, unknown>,
    typeof HTMLElement,
  ]> = [
    ["Button", Components.Button, { children: "x" }, HTMLButtonElement],
    [
      "ButtonGroup",
      Components.ButtonGroup,
      { options: [{ key: "a", label: "A" }], value: "a", onChange: () => {} },
      HTMLDivElement,
    ],
    ["Badge", Components.Badge, { children: "x" }, HTMLSpanElement],
    ["Dots", Components.Dots, { count: 1 }, HTMLSpanElement],
    ["Card", Components.Card, { children: "x" }, HTMLDivElement],
    ["ScrollRow", Components.ScrollRow, { children: "x" }, HTMLDivElement],
    [
      "StatusBar",
      Components.StatusBar,
      { items: [{ label: "X", value: "Y" }] },
      HTMLDivElement,
    ],
    [
      "SegmentBar",
      Components.SegmentBar,
      { segments: [{ label: "X", span: 1 }] },
      HTMLDivElement,
    ],
    ["Text", Components.Text, { children: "x" }, HTMLElement],
    ["Label", Components.Label, { children: "x" }, HTMLElement],
    ["Divider", Components.Divider, {}, HTMLDivElement],
    ["Spacer", Components.Spacer, {}, HTMLDivElement],
    ["Flex", Components.Flex, { children: "x" }, HTMLElement],
    ["HStack", Components.HStack, { children: "x" }, HTMLDivElement],
    ["VStack", Components.VStack, { children: "x" }, HTMLDivElement],
    ["Grid", Components.Grid, { children: "x" }, HTMLDivElement],
    ["Container", Components.Container, { children: "x" }, HTMLDivElement],
    ["Center", Components.Center, { children: "x" }, HTMLDivElement],
    ["AspectRatio", Components.AspectRatio, { children: "x" }, HTMLDivElement],
    [
      "SplitView",
      Components.SplitView,
      { left: "L", right: "R" },
      HTMLDivElement,
    ],
    ["Stretch", Components.Stretch, {}, HTMLDivElement],
    ["Box", Components.Box, { children: "x" }, HTMLElement],
    ["Input", Components.Input, { value: "", onChange: () => {} }, HTMLInputElement],
    [
      "Textarea",
      Components.Textarea,
      { value: "", onChange: () => {} },
      HTMLTextAreaElement,
    ],
    [
      "Select",
      Components.Select,
      { options: [{ value: "a", label: "A" }], value: "a", onChange: () => {} },
      HTMLSelectElement,
    ],
    ["Toggle", Components.Toggle, { defaultChecked: false }, HTMLDivElement],
    ["Checkbox", Components.Checkbox, { defaultChecked: false }, HTMLDivElement],
    ["Radio", Components.Radio, { checked: false, onChange: () => {} }, HTMLDivElement],
    [
      "RadioGroup",
      Components.RadioGroup,
      {
        options: [{ value: "a", label: "A" }],
        defaultValue: "a",
        onChange: () => {},
      },
      HTMLDivElement,
    ],
    ["Slider", Components.Slider, { value: 0, onChange: () => {} }, HTMLDivElement],
    [
      "NumberInput",
      Components.NumberInput,
      { value: 0, onChange: () => {} },
      HTMLDivElement,
    ],
    [
      "SearchInput",
      Components.SearchInput,
      { value: "", onChange: () => {} },
      HTMLDivElement,
    ],
    ["FormField", Components.FormField, { children: "x" }, HTMLDivElement],
    ["DropZone", Components.DropZone, {}, HTMLDivElement],
    [
      "Table",
      Components.Table,
      {
        columns: [{ key: "x", header: "X" }],
        data: [{ x: 1 }],
      },
      HTMLDivElement,
    ],
    ["Stat", Components.Stat, { label: "X", value: "Y" }, HTMLDivElement],
    ["Progress", Components.Progress, { value: 50 }, HTMLDivElement],
    ["Avatar", Components.Avatar, {}, HTMLDivElement],
    ["AvatarGroup", Components.AvatarGroup, { items: [] }, HTMLDivElement],
    ["Tag", Components.Tag, { children: "x" }, HTMLSpanElement],
    [
      "Tooltip",
      Components.Tooltip,
      { content: "tip", children: <button>btn</button> },
      HTMLDivElement,
    ],
    ["Code", Components.Code, { children: "x" }, HTMLElement],
    ["Timeline", Components.Timeline, { events: [{ title: "x" }] }, HTMLDivElement],
    ["Skeleton", Components.Skeleton, {}, HTMLDivElement],
    ["EmptyState", Components.EmptyState, {}, HTMLDivElement],
    ["List", Components.List, { items: ["a"] }, HTMLDivElement],
    [
      "KeyValue",
      Components.KeyValue,
      { items: [{ key: "X", value: "Y" }] },
      HTMLDivElement,
    ],
    ["Spinner", Components.Spinner, {}, HTMLDivElement],
    ["Breadcrumb", Components.Breadcrumb, { items: [{ label: "x" }] }, HTMLElement],
    [
      "Pagination",
      Components.Pagination,
      { page: 1, total: 5, onChange: () => {} },
      HTMLElement,
    ],
    ["Stepper", Components.Stepper, { steps: ["a"], current: 0 }, HTMLDivElement],
    ["NavItem", Components.NavItem, { children: "x" }, HTMLDivElement],
    ["NavGroup", Components.NavGroup, { title: "X" }, HTMLDivElement],
    [
      "Tabs",
      Components.Tabs,
      {
        tabs: [{ key: "a", label: "A" }],
        active: "a",
        onChange: () => {},
      },
      HTMLDivElement,
    ],
    [
      "Collapsible",
      Components.Collapsible,
      { title: "X" },
      HTMLDivElement,
    ],
    ["Toast", Components.Toast, { message: "x" }, HTMLDivElement],
    ["Kbd", Components.Kbd, { keys: "X" }, HTMLElement],
    [
      "Modal",
      Components.Modal,
      { open: true, onClose: () => {}, children: "x" },
      HTMLDivElement,
    ],
    [
      "Drawer",
      Components.Drawer,
      { open: true, onClose: () => {}, children: "x" },
      HTMLDivElement,
    ],
    [
      "Dropdown",
      Components.Dropdown,
      {
        trigger: <button>X</button>,
        items: [{ label: "X" }],
      },
      HTMLDivElement,
    ],
    [
      "Popover",
      Components.Popover,
      { trigger: <button>X</button>, children: "X" },
      HTMLDivElement,
    ],
    ["Alert", Components.Alert, { children: "x" }, HTMLDivElement],
    [
      "ConfirmDialog",
      Components.ConfirmDialog,
      { open: true, onConfirm: () => {}, onCancel: () => {} },
      HTMLDivElement,
    ],
  ];

  it.each(cases)("%s forwards a ref", (_name, Component, props, ElementClass) => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(<Component ref={ref} {...props} />);
    expect(ref.current).toBeInstanceOf(ElementClass);
  });

  it.each(cases)("%s sets displayName", (name, Component) => {
    expect(Component.displayName).toBe(name);
  });
});
