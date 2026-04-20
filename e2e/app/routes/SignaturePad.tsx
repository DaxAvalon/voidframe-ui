import { useState } from "react";
import { SignaturePad } from "voidframe";

export default function SignaturePadRoute() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  return (
    <>
      <SignaturePad
        label="Sign here"
        width={400}
        height={160}
        onValueChange={(url) => setDataUrl(url)}
      />
      <p data-testid="length">length: {dataUrl?.length ?? 0}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
