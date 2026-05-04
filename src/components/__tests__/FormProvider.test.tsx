import { describe, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { useForm } from "../../hooks/useForm";
import { Form, FormErrorSummary, focusFirstInvalid, useFormContext } from "../FormProvider";

function SimpleForm({
  onSubmit,
}: {
  onSubmit?: (values: Record<string, unknown>) => void;
}) {
  const form = useForm({
    initialValues: { email: "", name: "" },
    onSubmit,
  });
  return (
    <Form form={form}>
      <input name="email" {...form.register("email")} />
      <input name="name" {...form.register("name")} />
      <FormErrorSummary />
      <button type="submit">Submit</button>
    </Form>
  );
}

function FormWithErrors() {
  const form = useForm({
    initialValues: { email: "" },
    validate: (values) => {
      if (!values.email) return { email: "Required" };
      return null;
    },
  });
  return (
    <Form form={form}>
      <input name="email" {...form.register("email")} />
      <FormErrorSummary />
      <button type="submit">Submit</button>
    </Form>
  );
}

function ContextConsumer() {
  const form = useFormContext();
  return <span data-testid="dirty">{String(form.isDirty)}</span>;
}

describe("Form + FormProvider", () => {
  it("renders a <form> element", () => {
    const { container } = renderWithTheme(<SimpleForm />);
    expect(container.querySelector("form.vf-form")).toBeTruthy();
  });

  it("handleSubmit fires onSubmit", async () => {
    const onSubmit = vi.fn();
    const { container } = renderWithTheme(
      <SimpleForm onSubmit={onSubmit} />
    );
    const form = container.querySelector("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("FormErrorSummary renders nothing when no errors", () => {
    const { container } = renderWithTheme(<SimpleForm />);
    expect(
      container.querySelector(".vf-form-error-summary")
    ).toBeNull();
  });

  it("FormErrorSummary renders after failed validation", async () => {
    const { container } = renderWithTheme(<FormWithErrors />);
    const form = container.querySelector("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(
      container.querySelector(".vf-form-error-summary")
    ).toBeTruthy();
    expect(container.textContent).toContain("Required");
  });

  it("useFormContext exposes isDirty", () => {
    function Harness() {
      const form = useForm({ initialValues: { x: "" } });
      return (
        <Form form={form}>
          <ContextConsumer />
        </Form>
      );
    }
    const { getByTestId } = renderWithTheme(<Harness />);
    expect(getByTestId("dirty").textContent).toBe("false");
  });
});

describe("focusFirstInvalid", () => {
  it("focuses the first field matching an error key", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const input = document.createElement("input");
    input.name = "email";
    container.appendChild(input);
    const focusSpy = vi.spyOn(input, "focus");
    focusFirstInvalid({ email: "Required", name: undefined }, container);
    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(container);
  });

  it("skips fields with no error message", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const input = document.createElement("input");
    input.name = "email";
    container.appendChild(input);
    const focusSpy = vi.spyOn(input, "focus");
    focusFirstInvalid({ email: undefined }, container);
    expect(focusSpy).not.toHaveBeenCalled();
    document.body.removeChild(container);
  });

  it("does nothing when no matching DOM element exists", () => {
    const container = document.createElement("div");
    // No inputs at all
    focusFirstInvalid({ email: "Required" }, container);
    // Should not throw
  });
});

describe("FormErrorSummary — link click focuses field", () => {
  it("clicking an error link focuses the matching input", async () => {
    function FocusForm() {
      const form = useForm({
        initialValues: { email: "" },
        validate: (values) => {
          if (!values.email) return { email: "Email is required" };
          return null;
        },
      });
      return (
        <Form form={form}>
          <input name="email" {...form.register("email")} />
          <FormErrorSummary />
          <button type="submit">Submit</button>
        </Form>
      );
    }
    const { container } = renderWithTheme(<FocusForm />);
    const form = container.querySelector("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(
      container.querySelector(".vf-form-error-summary")
    ).toBeTruthy();
    const link = container.querySelector(".vf-form-error-summary__link");
    expect(link).toBeTruthy();
    fireEvent.click(link!);
    // The email input should be focused
    const emailInput = container.querySelector("input[name='email']");
    expect(document.activeElement).toBe(emailInput);
  });
});

describe("AsyncData", () => {
  // Imported separately to avoid circular dep risk.
  it("renders loading state", async () => {
    const { AsyncData } = await import("../AsyncData");
    const { container } = renderWithTheme(
      <AsyncData status="loading" loading={<span>Loading…</span>}>
        {() => <span>done</span>}
      </AsyncData>
    );
    expect(container.textContent).toContain("Loading…");
  });

  it("renders success state with data", async () => {
    const { AsyncData } = await import("../AsyncData");
    const { container } = renderWithTheme(
      <AsyncData status="success" data={42}>
        {(n) => <span>Value: {n as number}</span>}
      </AsyncData>
    );
    expect(container.textContent).toContain("Value: 42");
  });

  it("renders error state with retry", async () => {
    const { AsyncData } = await import("../AsyncData");
    const retry = vi.fn();
    const { container } = renderWithTheme(
      <AsyncData
        status="error"
        error={new Error("boom")}
        onRetry={retry}
      >
        {() => null}
      </AsyncData>
    );
    expect(container.textContent).toContain("boom");
    const btn = container.querySelector(".vf-async-data__retry");
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(retry).toHaveBeenCalledOnce();
  });

  it("renders empty state", async () => {
    const { AsyncData } = await import("../AsyncData");
    const { container } = renderWithTheme(
      <AsyncData status="empty">{() => null}</AsyncData>
    );
    expect(container.textContent).toContain("No data");
  });
});
