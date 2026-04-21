import { useState } from "react";
import { Wizard } from "voidframe";

type StepId = "account" | "billing" | "review";

export default function WizardRoute() {
  // Track each step's text input independently. `canAdvance` gates the Next
  // button: a step is only advanceable once its input has non-whitespace
  // text, so specs can verify enable/disable transitions.
  const [values, setValues] = useState<Record<StepId, string>>({
    account: "",
    billing: "",
    review: "",
  });
  const [done, setDone] = useState(false);

  const setStepValue = (id: StepId, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  return (
    <>
      <Wizard
        defaultValue="account"
        onComplete={() => setDone(true)}
        canAdvance={(id) => values[id as StepId].trim().length > 0}
      >
        <Wizard.Step id="account" label="Account">
          <input
            data-testid="input-account"
            aria-label="Account field"
            value={values.account}
            onChange={(e) => setStepValue("account", e.target.value)}
          />
        </Wizard.Step>
        <Wizard.Step id="billing" label="Billing">
          <input
            data-testid="input-billing"
            aria-label="Billing field"
            value={values.billing}
            onChange={(e) => setStepValue("billing", e.target.value)}
          />
        </Wizard.Step>
        <Wizard.Step id="review" label="Review">
          <input
            data-testid="input-review"
            aria-label="Review field"
            value={values.review}
            onChange={(e) => setStepValue("review", e.target.value)}
          />
        </Wizard.Step>
        <Wizard.Previous />
        <Wizard.Next />
      </Wizard>
      <span data-testid="done">{done ? "done" : "not-done"}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}
