import { useState } from "react";
import { ResizableGroup, ResizablePanel, ResizableHandle } from "voidframe";

export default function ResizableRoute() {
  const [sizes, setSizes] = useState<number[]>([30, 70]);
  return (
    <>
      <div style={{ width: 400, height: 200 }}>
        <ResizableGroup
          direction="horizontal"
          defaultSizes={[30, 70]}
          onLayout={setSizes}
        >
          <ResizablePanel data-testid="panel-left">Left</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel data-testid="panel-right">Right</ResizablePanel>
        </ResizableGroup>
      </div>
      <span data-testid="sizes">{sizes.join("/")}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}
