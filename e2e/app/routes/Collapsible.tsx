import { Collapsible } from "voidframe-ui";

export default function CollapsibleRoute() {
  // Two Collapsibles: the first is closed by default (for toggling assertions),
  // the second is open by default (lets axe/at-rest sweeps exercise the open
  // `role="region"` + `aria-labelledby` wiring without extra user interaction).
  return (
    <>
      <Collapsible title="Details" defaultOpen={false}>
        <p data-testid="body">Hidden content</p>
      </Collapsible>
      <Collapsible title="More info" defaultOpen={true}>
        <p data-testid="body-open">Always visible</p>
      </Collapsible>
      <button data-testid="outside">outside</button>
    </>
  );
}
