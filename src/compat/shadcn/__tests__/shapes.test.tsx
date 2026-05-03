/**
 * @vitest-environment happy-dom
 *
 * Smoke test for `voidframe-ui/compat-shadcn`. Asserts every documented
 * named export is defined and renders to non-empty DOM (where applicable).
 * The compat layer is purely re-exports; this test exists so accidental
 * removals of one of the underlying source-file exports surface as a test
 * failure rather than a runtime "is not exported" error in consumers.
 */
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import * as compat from "../index";

afterEach(cleanup);

const REQUIRED_NAMES = [
  // Button
  "Button",
  // Card
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardContent",
  "CardFooter",
  // Dialog
  "Dialog",
  "DialogTrigger",
  "DialogContent",
  "DialogHeader",
  "DialogTitle",
  "DialogDescription",
  "DialogBody",
  "DialogFooter",
  "DialogClose",
  // AlertDialog
  "AlertDialog",
  "AlertDialogTrigger",
  "AlertDialogContent",
  "AlertDialogHeader",
  "AlertDialogTitle",
  "AlertDialogDescription",
  "AlertDialogFooter",
  "AlertDialogAction",
  "AlertDialogCancel",
  // Sheet (DrawerV2)
  "Sheet",
  "SheetTrigger",
  "SheetContent",
  "SheetHeader",
  "SheetTitle",
  "SheetDescription",
  "SheetFooter",
  "SheetClose",
  // Popover
  "Popover",
  "PopoverTrigger",
  "PopoverContent",
  // Tooltip
  "Tooltip",
  "TooltipTrigger",
  "TooltipContent",
  "TooltipProvider",
  // DropdownMenu
  "DropdownMenu",
  "DropdownMenuTrigger",
  "DropdownMenuContent",
  "DropdownMenuItem",
  "DropdownMenuCheckboxItem",
  "DropdownMenuRadioGroup",
  "DropdownMenuRadioItem",
  "DropdownMenuSeparator",
  "DropdownMenuLabel",
  "DropdownMenuSub",
  "DropdownMenuSubTrigger",
  "DropdownMenuSubContent",
  // Select
  "Select",
  "SelectTrigger",
  "SelectValue",
  "SelectContent",
  "SelectItem",
  // Tabs
  "Tabs",
  "TabsList",
  "TabsTrigger",
  "TabsContent",
  // Toast
  "Toaster",
  "toast",
  "useToast",
  // Simple passthroughs
  "Input",
  "Textarea",
  "Label",
  "Badge",
  "Checkbox",
  "Switch",
  "Avatar",
  "Separator",
  "ScrollArea",
  "Skeleton",
  "Progress",
  "Slider",
  "Toggle",
  "ToggleGroup",
  "RadioGroup",
  "RadioGroupItem",
];

describe("voidframe-ui/compat-shadcn — all named exports defined", () => {
  it.each(REQUIRED_NAMES)("exports %s", (name) => {
    const value = (compat as Record<string, unknown>)[name];
    expect(value, `compat-shadcn must export ${name}`).toBeDefined();
  });
});

describe("voidframe-ui/compat-shadcn — common shapes render", () => {
  it("Button renders with shadcn variant=default", () => {
    const { Button } = compat;
    const { getByRole } = render(<Button>Click</Button>);
    expect(getByRole("button")).toBeInTheDocument();
  });

  it("Card + CardHeader + CardTitle + CardContent compose", () => {
    const { Card, CardHeader, CardTitle, CardContent } = compat;
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Hello</CardTitle>
        </CardHeader>
        <CardContent>World</CardContent>
      </Card>
    );
    expect(getByText("Hello")).toBeInTheDocument();
    expect(getByText("World")).toBeInTheDocument();
  });

  it("useToast returns a toast function", () => {
    const { useToast } = compat;
    const { toast } = useToast();
    expect(typeof toast).toBe("function");
  });
});
