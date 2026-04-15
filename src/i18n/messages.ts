// Phase 17 — Message catalog
//
// Every piece of built-in Voidframe UI text lives here. Locales override
// selected branches; English serves as the unshakeable default.

export type MessageTemplate<Args extends Record<string, unknown> = Record<string, unknown>> =
  | string
  | ((args: Args) => string);

export interface VoidframeMessages {
  pagination: {
    previous: string;
    next: string;
    first: string;
    last: string;
    page: (args: { n: number }) => string;
    pageOf: (args: { current: number; total: number }) => string;
    goToPage: (args: { n: number }) => string;
  };
  table: {
    noData: string;
    loading: string;
    sortAscending: string;
    sortDescending: string;
    clearSort: string;
  };
  fileUpload: {
    dropOrBrowse: string;
    remove: string;
    tooLarge: (args: { maxBytes: number }) => string;
    tooMany: (args: { max: number }) => string;
  };
  form: {
    required: string;
    optional: string;
    invalid: string;
  };
  datePicker: {
    today: string;
    clear: string;
    months: string[]; // 12
    monthsShort: string[]; // 12
    days: string[]; // 7, Sunday first
    daysShort: string[]; // 7
    daysMin: string[]; // 7
  };
  dialog: {
    cancel: string;
    confirm: string;
    ok: string;
  };
  overlay: {
    close: string;
    dismiss: string;
    open: string;
  };
  combobox: {
    noResults: string;
    clear: string;
    placeholder: string;
  };
  empty: {
    noItems: string;
  };
  error: {
    title: string;
    retry: string;
  };
  a11y: {
    menu: string;
    expand: string;
    collapse: string;
    selected: string;
    loading: string;
  };
}

export type PartialMessages = {
  [K in keyof VoidframeMessages]?: Partial<VoidframeMessages[K]>;
};

// ── English default ───────────────────────────────────────

export const enMessages: VoidframeMessages = {
  pagination: {
    previous: "Previous",
    next: "Next",
    first: "First",
    last: "Last",
    page: ({ n }) => `Page ${n}`,
    pageOf: ({ current, total }) => `Page ${current} of ${total}`,
    goToPage: ({ n }) => `Go to page ${n}`,
  },
  table: {
    noData: "No data",
    loading: "Loading…",
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    clearSort: "Clear sort",
  },
  fileUpload: {
    dropOrBrowse: "Drop files here or click to browse",
    remove: "Remove",
    tooLarge: ({ maxBytes }) =>
      `File exceeds the ${formatBytesSimple(maxBytes)} limit.`,
    tooMany: ({ max }) => `You can upload at most ${max} files.`,
  },
  form: {
    required: "Required",
    optional: "Optional",
    invalid: "Invalid value",
  },
  datePicker: {
    today: "Today",
    clear: "Clear",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    monthsShort: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    days: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    daysMin: ["S", "M", "T", "W", "T", "F", "S"],
  },
  dialog: {
    cancel: "Cancel",
    confirm: "Confirm",
    ok: "OK",
  },
  overlay: {
    close: "Close",
    dismiss: "Dismiss",
    open: "Open",
  },
  combobox: {
    noResults: "No results",
    clear: "Clear",
    placeholder: "Select…",
  },
  empty: {
    noItems: "No items",
  },
  error: {
    title: "Something went wrong",
    retry: "Retry",
  },
  a11y: {
    menu: "Menu",
    expand: "Expand",
    collapse: "Collapse",
    selected: "Selected",
    loading: "Loading",
  },
};

function formatBytesSimple(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
  if (n < 1024 * 1024 * 1024) return `${Math.round(n / (1024 * 1024))}MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

// ── Deep merge ────────────────────────────────────────────
//
// Locale packs ship partial overrides; missing keys fall through to the
// English default. Arrays replace wholesale (so month/day order stays
// consistent within a locale).

export function mergeMessages(
  base: VoidframeMessages,
  overrides: PartialMessages | undefined
): VoidframeMessages {
  if (!overrides) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(overrides) as Array<keyof VoidframeMessages>) {
    const override = overrides[key];
    if (!override) continue;
    out[key] = {
      ...(base[key] as Record<string, unknown>),
      ...(override as Record<string, unknown>),
    };
  }
  return out as unknown as VoidframeMessages;
}

// ── Path-based lookup ─────────────────────────────────────

export function resolvePath(
  messages: VoidframeMessages,
  path: string,
  args?: Record<string, unknown>
): string {
  const parts = path.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current === null || current === undefined) return path;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === "function") {
    return (current as (a: Record<string, unknown>) => string)(args ?? {});
  }
  if (typeof current === "string") return current;
  if (Array.isArray(current)) return current.join(", ");
  return path;
}
