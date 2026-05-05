import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { _resetWarnings } from "../../utils/warn";
import { RadioGroup, FormField } from "../../components/FormExtended";
import { Tabs } from "../../components/Interactive";
import { Select } from "../../components/Form";
import { Combobox } from "../../components/Combobox";

function withWarnSpy(fn: (spy: ReturnType<typeof vi.fn>) => void): void {
  const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
  // Also suppress console.error — React emits duplicate-key warnings
  // via console.error when these tests intentionally pass duplicate values.
  const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    fn(spy as unknown as ReturnType<typeof vi.fn>);
  } finally {
    spy.mockRestore();
    errSpy.mockRestore();
  }
}

describe("runtime misuse warnings", () => {
  beforeEach(() => {
    _resetWarnings();
  });

  it("RadioGroup warns on empty options", () => {
    withWarnSpy((spy) => {
      renderWithTheme(<RadioGroup options={[]} value="a" onValueChange={() => {}} />);
      expect(
        (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.some(
          (c) =>
            typeof c[0] === "string" && (c[0] as string).includes("RadioGroup")
        )
      ).toBe(true);
    });
  });

  it("RadioGroup warns on duplicate option values", () => {
    withWarnSpy((spy) => {
      renderWithTheme(
        <RadioGroup
          options={[
            { value: "a", label: "A" },
            { value: "a", label: "Dup" },
          ]}
          value="a"
          onValueChange={() => {}}
        />
      );
      expect(
        (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.some(
          (c) =>
            typeof c[0] === "string" &&
            (c[0] as string).includes("duplicate option value")
        )
      ).toBe(true);
    });
  });

  it("Tabs.Trigger throws when used outside Tabs", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderWithTheme(<Tabs.Trigger value="a">Orphan</Tabs.Trigger>)
    ).toThrow(/<Tabs\.Trigger> must be used inside <Tabs>/);
    err.mockRestore();
  });

it("Select warns on duplicate option values", () => {
    withWarnSpy((spy) => {
      renderWithTheme(
        <Select
          label="L"
          options={[
            { value: "a", label: "A" },
            { value: "a", label: "Dup" },
          ]}
          value="a"
          onValueChange={() => {}}
        />
      );
      expect(
        (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.some(
          (c) =>
            typeof c[0] === "string" &&
            (c[0] as string).includes("Select") &&
            (c[0] as string).includes("duplicate")
        )
      ).toBe(true);
    });
  });

  it("FormField warns when `required` is set without a label", () => {
    withWarnSpy((spy) => {
      renderWithTheme(
        <FormField required>
          <input />
        </FormField>
      );
      expect(
        (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.some(
          (c) =>
            typeof c[0] === "string" &&
            (c[0] as string).includes("required-without-label") === false &&
            (c[0] as string).includes("FormField")
        )
      ).toBe(true);
    });
  });

  it("Combobox warns on duplicate option values", () => {
    withWarnSpy((spy) => {
      renderWithTheme(
        <Combobox
          options={[
            { value: "x", label: "X" },
            { value: "x", label: "Dup" },
          ]}
        />
      );
      expect(
        (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.some(
          (c) =>
            typeof c[0] === "string" &&
            (c[0] as string).includes("Combobox") &&
            (c[0] as string).includes("duplicate")
        )
      ).toBe(true);
    });
  });
});
