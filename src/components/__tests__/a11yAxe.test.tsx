// Phase 5 invariant: major interactive components pass axe-core with zero
// serious/critical violations. Covers gaps not already exercised elsewhere.

import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { expectNoA11yViolations } from "../../../test/axe";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  Alert,
  ConfirmDialog,
  Drawer,
  Dropdown,
  Popover,
} from "../Overlay";
import { Collapsible, Modal, Tabs, Toast } from "../Interactive";
import {
  Breadcrumb,
  NavItem,
  Pagination,
  Stepper,
} from "../Navigation";
import {
  Checkbox,
  NumberInput,
  Radio,
  RadioGroup,
  Slider,
} from "../FormExtended";
import { Input, Select, Textarea, Toggle } from "../Form";
import { Progress, Stat, Table } from "../Data";

describe("axe: interactive / feedback", () => {
  it("Tabs with role=tablist + role=tab", async () => {
    const { container } = renderWithTheme(
      <Tabs value="a" onValueChange={() => {}}>
        <Tabs.List aria-label="sections">
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
          <Tabs.Trigger value="b">Beta</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="a" keepMounted>alpha content</Tabs.Panel>
        <Tabs.Panel value="b" keepMounted>beta content</Tabs.Panel>
      </Tabs>
    );
    await expectNoA11yViolations(container);
  });

  it("Collapsible closed", async () => {
    const { container } = renderWithTheme(
      <Collapsible title="SECTION">body</Collapsible>
    );
    await expectNoA11yViolations(container);
  });

  it("Collapsible open", async () => {
    const { container } = renderWithTheme(
      <Collapsible title="SECTION" defaultOpen>
        body
      </Collapsible>
    );
    await expectNoA11yViolations(container);
  });

  it("Toast (info)", async () => {
    const { container } = renderWithTheme(<Toast message="Saved" />);
    await expectNoA11yViolations(container);
  });

  it("Toast (danger)", async () => {
    const { container } = renderWithTheme(
      <Toast message="Failed" type="danger" onDismiss={() => {}} />
    );
    await expectNoA11yViolations(container);
  });
});

describe("axe: overlays (open state, portal-rendered)", () => {
  it("Modal with title and body", async () => {
    render(
      <Modal open onDismiss={() => {}} title="Confirm">
        <p>Sure?</p>
        <button>Yes</button>
      </Modal>
    );
    await expectNoA11yViolations(document.body);
  });

  it("Drawer with title and body", async () => {
    render(
      <Drawer open onDismiss={() => {}} title="Settings">
        <p>Settings content</p>
      </Drawer>
    );
    await expectNoA11yViolations(document.body);
  });

  it("ConfirmDialog", async () => {
    render(
      <ConfirmDialog
        open
        title="Delete item"
        message="This cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    await expectNoA11yViolations(document.body);
  });

  it("Alert (danger)", async () => {
    const { container } = renderWithTheme(
      <Alert type="danger" title="ERROR">
        Something broke
      </Alert>
    );
    await expectNoA11yViolations(container);
  });

  it("Alert (info)", async () => {
    const { container } = renderWithTheme(<Alert>inline notice</Alert>);
    await expectNoA11yViolations(container);
  });

  it("Dropdown (closed)", async () => {
    const { container } = renderWithTheme(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[
          { label: "Item 1", onClick: () => {} },
          { divider: true, label: "" },
          { label: "Item 2", onClick: () => {} },
        ]}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("Popover (closed)", async () => {
    const { container } = renderWithTheme(
      <Popover trigger={<button>Open</button>}>content</Popover>
    );
    await expectNoA11yViolations(container);
  });
});

describe("axe: navigation", () => {
  it("Breadcrumb", async () => {
    const { container } = renderWithTheme(
      <Breadcrumb
        items={[{ label: "Home" }, { label: "Users" }, { label: "Alice" }]}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("Pagination", async () => {
    const { container } = renderWithTheme(
      <Pagination value={2} totalPages={5} onValueChange={() => {}} />
    );
    await expectNoA11yViolations(container);
  });

  it("Stepper", async () => {
    const { container } = renderWithTheme(
      <Stepper steps={["Alpha", "Beta", "Gamma"]} current={1} />
    );
    await expectNoA11yViolations(container);
  });

  it("NavItem (active)", async () => {
    const { container } = renderWithTheme(<NavItem active>Users</NavItem>);
    await expectNoA11yViolations(container);
  });
});

describe("axe: form controls", () => {
  it("Input with label", async () => {
    const { container } = renderWithTheme(
      <Input label="NAME" value="" onChange={() => {}} />
    );
    await expectNoA11yViolations(container);
  });

  it("Textarea with label", async () => {
    const { container } = renderWithTheme(
      <Textarea label="NOTES" value="" onChange={() => {}} />
    );
    await expectNoA11yViolations(container);
  });

  it("Select with label", async () => {
    const { container } = renderWithTheme(
      <Select
        label="ENV"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value="a"
        onValueChange={() => {}}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("Toggle with label", async () => {
    const { container } = renderWithTheme(
      <Toggle label="DARK MODE" defaultChecked={false} />
    );
    await expectNoA11yViolations(container);
  });

  it("Checkbox with label", async () => {
    const { container } = renderWithTheme(
      <Checkbox label="AGREE" defaultChecked={false} />
    );
    await expectNoA11yViolations(container);
  });

  it("Radio with label", async () => {
    const { container } = renderWithTheme(
      <Radio checked={false} onValueChange={() => {}} label="PICK ME" />
    );
    await expectNoA11yViolations(container);
  });

  it("RadioGroup with label", async () => {
    const { container } = renderWithTheme(
      <RadioGroup
        label="TIER"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        defaultValue="a"
      />
    );
    await expectNoA11yViolations(container);
  });

  it("Slider with label", async () => {
    const { container } = renderWithTheme(
      <Slider value={50} onValueChange={() => {}} label="VOLUME" />
    );
    await expectNoA11yViolations(container);
  });

  it("NumberInput with label", async () => {
    const { container } = renderWithTheme(
      <NumberInput value={5} onValueChange={() => {}} label="QUANTITY" />
    );
    await expectNoA11yViolations(container);
  });
});

describe("axe: data display", () => {
  it("Table", async () => {
    const { container } = renderWithTheme(
      <Table
        columns={[
          { key: "name", header: "NAME", width: "1fr" },
          { key: "score", header: "SCORE", width: "60px" },
        ]}
        data={[
          { name: "Alice", score: 94 },
          { name: "Bob", score: 78 },
        ]}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("Stat", async () => {
    const { container } = renderWithTheme(
      <Stat label="USERS" value="12,847" sub="+340 this week" />
    );
    await expectNoA11yViolations(container);
  });

  it("Progress with label", async () => {
    const { container } = renderWithTheme(
      <Progress value={72} label="BUILD PROGRESS" showValue />
    );
    await expectNoA11yViolations(container);
  });

  it("Combobox closed", async () => {
    const { Combobox } = await import("../Combobox");
    const { container } = renderWithTheme(
      <Combobox
        label="Country"
        options={[
          { value: "us", label: "United States" },
          { value: "uk", label: "United Kingdom" },
        ]}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("Accordion", async () => {
    const { Accordion } = await import("../Accordion");
    const { container } = renderWithTheme(
      <Accordion>
        <Accordion.Item value="a">
          <Accordion.Trigger>Section A</Accordion.Trigger>
          <Accordion.Content>Content A</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
    await expectNoA11yViolations(container);
  });
});
