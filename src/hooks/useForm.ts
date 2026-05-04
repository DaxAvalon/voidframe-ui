"use client";

// Phase 7.5 — useForm
//
// Lightweight form state manager. Tracks values, errors, touched, dirty, and
// a submitting flag. Supports per-field sync/async validators plus a top-level
// validator that sees the whole form.
//
// Intentionally smaller than react-hook-form: no uncontrolled registration,
// no schema adapter indirection. Integrate with <input> via the `register`
// helper or wire controlled components via `getField`.

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";

export type Validator<V> = (value: V, values: Record<string, unknown>) =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export type FormValidator<T> = (values: T) =>
  | Partial<Record<keyof T, string>>
  | Promise<Partial<Record<keyof T, string>>>
  | null
  | undefined;

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  /** Per-field validators. */
  validators?: Partial<Record<keyof T, Validator<T[keyof T]>>>;
  /** Single validator that receives the whole form. */
  validate?: FormValidator<T>;
  /** When to validate a field. Default "blur". */
  validateOn?: "change" | "blur" | "submit";
  /** Called on submit only if validation passes. */
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface FieldBindings<V> {
  name: string;
  value: V;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Scalar value callback — works with VoidFrame form controls that prefer onValueChange over onChange. */
  onValueChange: (value: V) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface FieldHandle<V> {
  value: V;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  setValue: (next: V) => void;
  setTouched: (t?: boolean) => void;
  validate: () => Promise<string | null>;
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (next: Partial<T>) => void;
  setError: <K extends keyof T>(name: K, error: string | null) => void;
  setTouched: <K extends keyof T>(name: K, t?: boolean) => void;
  reset: (next?: Partial<T>) => void;
  register: <K extends keyof T>(name: K) => FieldBindings<T[K]>;
  getField: <K extends keyof T>(name: K) => FieldHandle<T[K]>;
  validateField: <K extends keyof T>(name: K) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (e?: FormEvent) => Promise<void>;
}

function coerceEventValue(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): unknown {
  const el = e.target as HTMLInputElement;
  if (el.type === "checkbox") return el.checked;
  if (el.type === "number" || el.type === "range") {
    return el.value === "" ? "" : Number(el.value);
  }
  return el.value;
}

/**
 * Controlled-or-uncontrolled form-state primitive with validation. Returns
 * `{ values, errors, touched, register, handleSubmit, reset, setFieldValue,
 * setFieldError, trigger }`. Pair with `useFieldArray` for dynamic rows and
 * `FormErrorSummary` for a live error list.
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validators,
    validate,
    validateOn = "blur",
    onSubmit,
  } = options;

  const initialRef = useRef<T>(initialValues);
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedMap] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const runFieldValidator = useCallback(
    async <K extends keyof T>(name: K, value: T[K]): Promise<string | null> => {
      const v = validators?.[name];
      if (!v) return null;
      const result = await v(value as T[keyof T], valuesRef.current);
      return result ?? null;
    },
    [validators]
  );

  const runFormValidator = useCallback(async (): Promise<
    Partial<Record<keyof T, string>>
  > => {
    if (!validate) return {};
    const result = await validate(valuesRef.current);
    return result ?? {};
  }, [validate]);

  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [name]: value }));
      valuesRef.current = { ...valuesRef.current, [name]: value };
      if (validateOn === "change") {
        void runFieldValidator(name, value).then((err) => {
          setErrors((prev) => ({ ...prev, [name]: err ?? undefined }));
        });
      }
    },
    [validateOn, runFieldValidator]
  );

  const setValues = useCallback((next: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...next }));
    valuesRef.current = { ...valuesRef.current, ...next };
  }, []);

  const setError = useCallback(
    <K extends keyof T>(name: K, error: string | null) => {
      setErrors((prev) => ({ ...prev, [name]: error ?? undefined }));
    },
    []
  );

  const setTouched = useCallback(
    <K extends keyof T>(name: K, t: boolean = true) => {
      setTouchedMap((prev) => ({ ...prev, [name]: t }));
    },
    []
  );

  const validateField = useCallback(
    async <K extends keyof T>(name: K): Promise<string | null> => {
      const err = await runFieldValidator(name, valuesRef.current[name]);
      setErrors((prev) => ({ ...prev, [name]: err ?? undefined }));
      return err;
    },
    [runFieldValidator]
  );

  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldErrors: Partial<Record<keyof T, string>> = {};
    const names = Object.keys(validators ?? {}) as Array<keyof T>;
    for (const name of names) {
      const err = await runFieldValidator(name, valuesRef.current[name]);
      if (err) fieldErrors[name] = err;
    }
    const formErrors = await runFormValidator();
    const merged: Partial<Record<keyof T, string>> = { ...fieldErrors, ...formErrors };
    setErrors(merged);
    return Object.keys(merged).length === 0;
  }, [validators, runFieldValidator, runFormValidator]);

  const register = useCallback(
    <K extends keyof T>(name: K): FieldBindings<T[K]> => ({
      name: name as string,
      value: values[name],
      onChange: (e) => {
        const coerced = coerceEventValue(e) as T[K];
        setValue(name, coerced);
      },
      onValueChange: (v) => setValue(name, v as T[K]),
      onBlur: () => {
        setTouched(name, true);
        if (validateOn === "blur") void validateField(name);
      },
    }),
    [values, setValue, setTouched, validateField, validateOn]
  );

  const getField = useCallback(
    <K extends keyof T>(name: K): FieldHandle<T[K]> => ({
      value: values[name],
      error: errors[name] ?? null,
      touched: touched[name] ?? false,
      dirty: values[name] !== initialRef.current[name],
      setValue: (next: T[K]) => setValue(name, next),
      setTouched: (t = true) => setTouched(name, t),
      validate: () => validateField(name),
    }),
    [values, errors, touched, setValue, setTouched, validateField]
  );

  const reset = useCallback((next?: Partial<T>) => {
    const nextValues = { ...initialRef.current, ...(next ?? {}) };
    initialRef.current = nextValues;
    setValuesState(nextValues);
    valuesRef.current = nextValues;
    setErrors({});
    setTouchedMap({});
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      setSubmitting(true);
      // Mark every field touched so error UI shows comprehensively.
      setTouchedMap(
        Object.fromEntries(
          Object.keys(valuesRef.current).map((k) => [k, true])
        ) as Partial<Record<keyof T, boolean>>
      );
      try {
        const valid = await validateForm();
        if (valid && onSubmit) {
          await onSubmit(valuesRef.current);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [validateForm, onSubmit]
  );

  const isDirty = useMemo(
    () =>
      Object.keys(values).some(
        (k) => values[k] !== (initialRef.current as Record<string, unknown>)[k]
      ),
    [values]
  );

  const isValid = useMemo(
    () => Object.values(errors).every((v) => !v),
    [errors]
  );

  const dirty = useMemo(() => {
    const out: Partial<Record<keyof T, boolean>> = {};
    for (const k of Object.keys(values) as Array<keyof T>) {
      if (values[k] !== initialRef.current[k]) out[k] = true;
    }
    return out;
  }, [values]);

  return {
    values,
    errors,
    touched,
    dirty,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    setTouched,
    reset,
    register,
    getField,
    validateField,
    validateForm,
    handleSubmit,
  };
}
