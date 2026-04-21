import { useState } from "react";
import { ImageCropper, type CropResult } from "voidframe-ui";

// A tiny 200×100 solid-colour SVG, data-URL-encoded so no network hop is
// needed in CI. Big enough for the crop tool to produce a meaningful
// bounding box.
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <rect x="0" y="0" width="200" height="100" fill="#2a2a2a" />
  <rect x="40" y="20" width="120" height="60" fill="#4ade80" />
</svg>`.trim();
const SRC = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`;

export default function ImageCropperRoute() {
  const [result, setResult] = useState<CropResult | null>(null);
  return (
    <>
      <ImageCropper
        src={SRC}
        label="Crop"
        outputType="image/png"
        outputQuality={0.9}
        onCrop={setResult}
      />
      <p data-testid="result">
        {result
          ? `w=${result.crop.width.toFixed(0)} h=${result.crop.height.toFixed(0)}`
          : "—"}
      </p>
      <button data-testid="outside">outside</button>
    </>
  );
}
