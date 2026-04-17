// ═══════════════════════════════════════════════════════════════
// formValidation — schema library adapters for useForm
// Duck-typed adapters for Zod, Yup, Valibot, and custom validators.
// ═══════════════════════════════════════════════════════════════

export type FormValidator<T> = (values: T) => Record<string, string> | null;

/**
 * Adapt a Zod schema to voidframe's FormValidator interface.
 * Duck-types on `safeParse` — no Zod import required.
 */
export function zodAdapter<T>(schema: {
  safeParse: (data: T) => {
    success: boolean;
    error?: { issues: Array<{ path: (string | number)[]; message: string }> };
  };
}): FormValidator<T> {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return null;
    const errors: Record<string, string> = {};
    for (const issue of result.error?.issues ?? []) {
      const key = issue.path.join(".");
      errors[key] = issue.message;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Adapt a Yup schema to voidframe's FormValidator interface.
 * Duck-types on `validateSync` — no Yup import required.
 */
export function yupAdapter<T>(schema: {
  validateSync: (data: T, options?: { abortEarly?: boolean }) => T;
}): FormValidator<T> {
  return (values: T) => {
    try {
      schema.validateSync(values, { abortEarly: false });
      return null;
    } catch (err: unknown) {
      const errors: Record<string, string> = {};
      const validationError = err as {
        inner?: Array<{ path?: string; message: string }>;
      };
      if (validationError.inner) {
        for (const inner of validationError.inner) {
          if (inner.path) {
            errors[inner.path] = inner.message;
          }
        }
      }
      return Object.keys(errors).length > 0 ? errors : null;
    }
  };
}

/**
 * Adapt a Valibot schema to voidframe's FormValidator interface.
 * Takes the schema object and the safeParse function separately
 * (Valibot uses a functional API).
 */
export function valibotAdapter<T>(
  schema: unknown,
  safeParse: (
    schema: unknown,
    data: T
  ) => {
    success: boolean;
    issues?: Array<{ path?: Array<{ key: string }>; message: string }>;
  }
): FormValidator<T> {
  return (values: T) => {
    const result = safeParse(schema, values);
    if (result.success) return null;
    const errors: Record<string, string> = {};
    for (const issue of result.issues ?? []) {
      const key = issue.path?.map((p) => p.key).join(".") || "unknown";
      errors[key] = issue.message;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Wrap a plain validation function as a FormValidator.
 * Filters out undefined values and returns null when no errors remain.
 */
export function customAdapter<T>(
  validate: (values: T) => Record<string, string | undefined>
): FormValidator<T> {
  return (values: T) => {
    try {
      const raw = validate(values);
      const errors: Record<string, string> = {};
      for (const [key, value] of Object.entries(raw)) {
        if (value !== undefined) {
          errors[key] = value;
        }
      }
      return Object.keys(errors).length > 0 ? errors : null;
    } catch {
      return { _form: "Validation function threw an error" };
    }
  };
}
