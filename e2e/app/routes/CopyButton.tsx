import { useState } from "react";
import { CopyButton } from "voidframe-ui";

export default function CopyButtonRoute() {
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  return (
    <>
      <CopyButton
        text="voidframe-clipboard-payload"
        label="Copy token"
        copiedLabel="Copied!"
        copiedDuration={1000}
        onCopy={(t) => setLastCopied(t)}
      />
      <p data-testid="last-copied">{lastCopied ?? "—"}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
