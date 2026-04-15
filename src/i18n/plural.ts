// Phase 17 — pluralization via Intl.PluralRules.

export interface PluralForms {
  /** Required fallback — the "other" form. */
  other: string;
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
}

/**
 * Select the right plural form for `n` against `locale`. Falls back to the
 * `other` form when the resolved rule has no matching form.
 */
export function pluralize(
  n: number,
  locale: string | undefined,
  forms: PluralForms
): string {
  try {
    const rule = new Intl.PluralRules(locale).select(n);
    const form = forms[rule as keyof PluralForms];
    if (form !== undefined) return form;
  } catch {
    /* fall through */
  }
  return forms.other;
}
