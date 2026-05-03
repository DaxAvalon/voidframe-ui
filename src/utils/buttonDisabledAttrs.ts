// ═══════════════════════════════════════════════════════════════
// buttonDisabledAttrs — shared disabled-button attribute emitter
// ═══════════════════════════════════════════════════════════════
//
// Voidframe historically emitted only `aria-disabled="true"` on
// disabled buttons and stripped `onClick`. That kept buttons inert
// and focusable (good a11y pattern) but broke:
//   - native form-submission suppression (`<button disabled>` skipped)
//   - the `button:disabled` CSS selector
//   - test assertions like `expect(btn).toHaveAttribute("disabled")`
//
// Emit BOTH the native `disabled` attribute and `aria-disabled` so
// none of the above silently break. The native attr handles the
// platform contract; `aria-disabled` handles assistive tech that
// expects the ARIA pattern.

export interface DisabledAttrs {
  disabled?: true;
  "aria-disabled"?: "true";
}

/**
 * Produce both `disabled` and `aria-disabled` attributes for any
 * button-like component.
 *
 * Usage:
 *   <button
 *     {...buttonDisabledAttrs(isDisabled)}
 *     onClick={isDisabled ? undefined : onClick}
 *   />
 */
export function buttonDisabledAttrs(disabled: boolean | undefined): DisabledAttrs {
  if (!disabled) return {};
  return {
    disabled: true,
    "aria-disabled": "true",
  };
}
