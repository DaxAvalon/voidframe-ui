import { ScrollArea } from "voidframe-ui";

export default function ScrollAreaRoute() {
  return (
    <>
      <ScrollArea height={200} type="always">
        <div data-testid="inner" style={{ height: 800 }}>
          scroll target
        </div>
      </ScrollArea>
      <button data-testid="outside">outside</button>
    </>
  );
}
