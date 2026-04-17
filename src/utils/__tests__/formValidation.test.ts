import { describe, expect, it } from "vitest";
import {
  zodAdapter,
  yupAdapter,
  valibotAdapter,
  customAdapter,
} from "../formValidation";

// ── zodAdapter ────────────────────────────────────────────────

describe("zodAdapter", () => {
  it("returns null for valid data", () => {
    const schema = {
      safeParse: () => ({ success: true as const }),
    };
    const validate = zodAdapter(schema);
    expect(validate({ name: "Alice" })).toBeNull();
  });

  it("returns errors for a single field", () => {
    const schema = {
      safeParse: () => ({
        success: false as const,
        error: { issues: [{ path: ["name"], message: "Required" }] },
      }),
    };
    const validate = zodAdapter(schema);
    expect(validate({})).toEqual({ name: "Required" });
  });

  it("returns errors for multiple fields", () => {
    const schema = {
      safeParse: () => ({
        success: false as const,
        error: {
          issues: [
            { path: ["name"], message: "Required" },
            { path: ["email"], message: "Invalid email" },
          ],
        },
      }),
    };
    const validate = zodAdapter(schema);
    expect(validate({})).toEqual({
      name: "Required",
      email: "Invalid email",
    });
  });

  it("joins nested paths with dots", () => {
    const schema = {
      safeParse: () => ({
        success: false as const,
        error: {
          issues: [{ path: ["address", "city"], message: "Required" }],
        },
      }),
    };
    const validate = zodAdapter(schema);
    expect(validate({})).toEqual({ "address.city": "Required" });
  });

  it("handles array index paths", () => {
    const schema = {
      safeParse: () => ({
        success: false as const,
        error: {
          issues: [{ path: ["items", 0, "name"], message: "Required" }],
        },
      }),
    };
    const validate = zodAdapter(schema);
    expect(validate({})).toEqual({ "items.0.name": "Required" });
  });

  it("preserves custom error messages", () => {
    const schema = {
      safeParse: () => ({
        success: false as const,
        error: {
          issues: [{ path: ["age"], message: "Must be at least 18" }],
        },
      }),
    };
    const validate = zodAdapter(schema);
    expect(validate({})).toEqual({ age: "Must be at least 18" });
  });

  it("returns null when error has empty issues array", () => {
    const schema = {
      safeParse: () => ({
        success: false as const,
        error: { issues: [] },
      }),
    };
    const validate = zodAdapter(schema);
    expect(validate({})).toBeNull();
  });
});

// ── yupAdapter ────────────────────────────────────────────────

describe("yupAdapter", () => {
  it("returns null for valid data", () => {
    const schema = {
      validateSync: (data: unknown) => data,
    };
    const validate = yupAdapter(schema);
    expect(validate({ name: "Alice" })).toBeNull();
  });

  it("returns errors for a single field", () => {
    const schema = {
      validateSync: () => {
        const err = new Error("Validation failed") as Error & {
          inner: Array<{ path: string; message: string }>;
        };
        err.inner = [{ path: "name", message: "Required" }];
        throw err;
      },
    };
    const validate = yupAdapter(schema);
    expect(validate({})).toEqual({ name: "Required" });
  });

  it("returns errors for multiple fields", () => {
    const schema = {
      validateSync: () => {
        const err = new Error("Validation failed") as Error & {
          inner: Array<{ path: string; message: string }>;
        };
        err.inner = [
          { path: "name", message: "Required" },
          { path: "email", message: "Invalid" },
        ];
        throw err;
      },
    };
    const validate = yupAdapter(schema);
    expect(validate({})).toEqual({ name: "Required", email: "Invalid" });
  });

  it("handles nested error paths", () => {
    const schema = {
      validateSync: () => {
        const err = new Error("Validation failed") as Error & {
          inner: Array<{ path: string; message: string }>;
        };
        err.inner = [{ path: "address.zip", message: "Invalid zip" }];
        throw err;
      },
    };
    const validate = yupAdapter(schema);
    expect(validate({})).toEqual({ "address.zip": "Invalid zip" });
  });

  it("catches ValidationError and maps inner array", () => {
    const schema = {
      validateSync: () => {
        const err = new Error("ValidationError") as Error & {
          inner: Array<{ path: string; message: string }>;
        };
        err.inner = [
          { path: "a", message: "err a" },
          { path: "b", message: "err b" },
        ];
        throw err;
      },
    };
    const validate = yupAdapter(schema);
    const result = validate({});
    expect(result).toEqual({ a: "err a", b: "err b" });
  });
});

// ── valibotAdapter ────────────────────────────────────────────

describe("valibotAdapter", () => {
  it("returns null for valid data", () => {
    const schema = {};
    const safeParse = () => ({ success: true as const });
    const validate = valibotAdapter(schema, safeParse);
    expect(validate({ name: "Alice" })).toBeNull();
  });

  it("returns errors for invalid data", () => {
    const schema = {};
    const safeParse = () => ({
      success: false as const,
      issues: [
        { path: [{ key: "name" }], message: "Required" },
      ],
    });
    const validate = valibotAdapter(schema, safeParse);
    expect(validate({})).toEqual({ name: "Required" });
  });

  it("uses 'unknown' key when path is missing", () => {
    const schema = {};
    const safeParse = () => ({
      success: false as const,
      issues: [{ message: "Bad input" }],
    });
    const validate = valibotAdapter(schema, safeParse);
    expect(validate({})).toEqual({ unknown: "Bad input" });
  });
});

// ── customAdapter ─────────────────────────────────────────────

describe("customAdapter", () => {
  it("returns null when validate returns empty object", () => {
    const validate = customAdapter(() => ({}));
    expect(validate({})).toBeNull();
  });

  it("maps field errors correctly", () => {
    const validate = customAdapter(() => ({
      name: "Required",
      email: "Invalid",
    }));
    expect(validate({})).toEqual({ name: "Required", email: "Invalid" });
  });

  it("filters out undefined values", () => {
    const validate = customAdapter(() => ({
      name: undefined,
      email: "Invalid",
    }));
    expect(validate({})).toEqual({ email: "Invalid" });
  });

  it("returns form error when validate throws", () => {
    const validate = customAdapter(() => {
      throw new Error("Boom");
    });
    expect(validate({})).toEqual({
      _form: "Validation function threw an error",
    });
  });

  it("returns null when all values are undefined", () => {
    const validate = customAdapter(() => ({
      name: undefined,
      email: undefined,
    }));
    expect(validate({})).toBeNull();
  });
});
