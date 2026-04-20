import { TreeView, type TreeNode } from "voidframe";

const items: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "components", label: "components", hasChildren: true },
      { id: "hooks", label: "hooks" },
    ],
  },
  { id: "package.json", label: "package.json" },
];

export default function TreeViewRoute() {
  return (
    <>
      <TreeView
        items={items}
        defaultExpanded={["src"]}
        loadChildren={async (node) => {
          // Simulate a lazy load — return a couple of leaves deterministically.
          return [
            { id: `${node.id}/a`, label: "a.tsx" },
            { id: `${node.id}/b`, label: "b.tsx" },
          ];
        }}
      />
      <button data-testid="outside">outside</button>
    </>
  );
}
