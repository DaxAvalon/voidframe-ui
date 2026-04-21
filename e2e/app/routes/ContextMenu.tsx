import { ContextMenu } from "voidframe-ui";

export default function ContextMenuRoute() {
  // ContextMenu renders raw children inside `content` — it does NOT supply
  // MenuProvider context, so we use plain `role="menuitem"` buttons rather
  // than `Menu.Item`. Clicks bubble to `document` via capture/bubble, which
  // is what closes the menu on item click.
  return (
    <>
      <ContextMenu
        content={
          <>
            <button type="button" role="menuitem" data-testid="item-copy">
              Copy
            </button>
            <button type="button" role="menuitem" data-testid="item-paste">
              Paste
            </button>
          </>
        }
      >
        <div
          data-testid="rightclick-surface"
          style={{
            padding: 24,
            border: "1px dashed currentColor",
            userSelect: "none",
          }}
        >
          Right-click inside this box
        </div>
      </ContextMenu>
      <button data-testid="outside">outside</button>
    </>
  );
}
