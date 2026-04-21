import { useState } from "react";
import { Sortable } from "voidframe-ui";

interface Item {
  id: string;
  label: string;
}

const initial: Item[] = [
  { id: "alpha", label: "Alpha" },
  { id: "bravo", label: "Bravo" },
  { id: "charlie", label: "Charlie" },
];

export default function SortableRoute() {
  const [items, setItems] = useState<Item[]>(initial);
  return (
    <>
      <Sortable<Item>
        value={items}
        getKey={(x) => x.id}
        onValueChange={setItems}
        renderItem={(item, _i, { dragHandleProps }) => (
          <div
            style={{ display: "flex", gap: 8, padding: 8, background: "var(--vf-bg-2)", border: "1px solid var(--vf-border-1)" }}
          >
            <span
              {...dragHandleProps}
              data-testid={`handle-${item.id}`}
              style={{ cursor: "grab" }}
            >
              ⋮⋮
            </span>
            <span data-testid={`label-${item.id}`}>{item.label}</span>
          </div>
        )}
      />
      <p data-testid="order">order: {items.map((i) => i.id).join(",")}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
