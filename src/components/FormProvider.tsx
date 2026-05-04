"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  type FormEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { UseFormReturn } from "../hooks/useForm";

type FormValues = Record<string, unknown>;
import { cx } from "../utils/cx";

// ── FormContext ──────────────────────────────────────────────

interface FormContextValue {
  form: UseFormReturn<FormValues>;
}

const FormContext = createContext<FormContextValue | null>(null);

/**
 * Read the nearest `<Form>` context. Throws if not inside a `<Form>`.
 *
 * @remarks The generic type parameter `T` is a convenience cast — TypeScript
 * cannot verify that `T` matches the form's actual `initialValues` shape at
 * compile time. This is the same pattern used by react-hook-form's
 * `useFormContext` and Formik's `useFormikContext`. If `T` doesn't match
 * the real form shape, you'll get runtime type mismatches, not compile errors.
 */
export function useFormContext<
  T extends FormValues = FormValues,
>(): UseFormReturn<T> {
  const ctx = useContext(FormContext);
  if (!ctx)
    throw new Error(
      "useFormContext must be used inside a <Form> component."
    );
  return ctx.form as unknown as UseFormReturn<T>;
}

// ── Form (root component) ───────────────────────────────────

export interface FormProps extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** The useForm return value. */
  form: UseFormReturn<FormValues>;
  children?: ReactNode;
}

/**
 * Form root — wraps children in a `<form>` with the `useForm` context
 * automatically available to any `Field`, `FormErrorSummary`, or
 * consumer hook (`useFormContext`) inside.
 *
 * @example
 * const form = useForm({ initialValues: { email: "" }, onSubmit: ... });
 * <Form form={form}>
 *   <Field><Input {...form.register("email")} /></Field>
 *   <FormErrorSummary />
 *   <Button type="submit">Save</Button>
 * </Form>
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { form, children, className, ...props },
  ref
) {
  const ctx = useMemo<FormContextValue>(() => ({ form }), [form]);
  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      void form.handleSubmit(e);
    },
    [form]
  );
  return (
    <FormContext.Provider value={ctx}>
      <form
        ref={ref}
        noValidate
        onSubmit={onSubmit}
        className={cx("vf-form", className)}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});
Form.displayName = "Form";

// ── FormErrorSummary ────────────────────────────────────────

export interface FormErrorSummaryProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Override the heading. Default "Please fix the following:". */
  heading?: ReactNode;
}

/**
 * Renders a list of current form errors. Reads from `useFormContext`.
 * Only renders when there are errors.
 */
export const FormErrorSummary = forwardRef<
  HTMLDivElement,
  FormErrorSummaryProps
>(function FormErrorSummary(
  { heading = "Please fix the following:", className, ...props },
  ref
) {
  const form = useFormContext();
  const entries = useMemo(
    () =>
      Object.entries(form.errors).filter(
        (e): e is [string, string] => Boolean(e[1])
      ),
    [form.errors]
  );
  if (entries.length === 0) return null;
  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cx("vf-form-error-summary", className)}
      {...props}
    >
      <div className="vf-form-error-summary__heading">{heading}</div>
      <ul className="vf-form-error-summary__list">
        {entries.map(([field, message]) => (
          <li key={field} className="vf-form-error-summary__item">
            <button
              type="button"
              className="vf-form-error-summary__link"
              onClick={() => {
                const el = document.querySelector(
                  `[name="${field}"], #${CSS.escape(field)}`
                );
                if (el instanceof HTMLElement) el.focus();
              }}
            >
              {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});
FormErrorSummary.displayName = "FormErrorSummary";

// ── focusFirstInvalid ───────────────────────────────────────

/**
 * Focus the first DOM element whose `name` or `id` matches a key in
 * the form's current error map.
 */
export function focusFirstInvalid(
  errors: Record<string, string | undefined>,
  container: HTMLElement = document.body
): void {
  for (const field of Object.keys(errors)) {
    if (!errors[field]) continue;
    const el = container.querySelector(
      `[name="${CSS.escape(field)}"], #${CSS.escape(field)}`
    );
    if (el instanceof HTMLElement) {
      el.focus();
      return;
    }
  }
}
