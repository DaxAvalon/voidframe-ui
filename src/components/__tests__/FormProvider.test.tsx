import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { useForm } from "../../hooks/useForm";
import { Form, FormErrorSummary, useFormContext } from "../FormProvider";

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
    fireEvent.submit(form);
    // Wait for async handleSubmit.
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
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
    fireEvent.submit(form);
    await vi.waitFor(() =>
      expect(
        container.querySelector(".vf-form-error-summary")
      ).toBeTruthy()
    );
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
