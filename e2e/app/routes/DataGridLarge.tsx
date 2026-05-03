import { useCallback, useMemo, useState } from "react";
import { DataGrid } from "voidframe-ui";

interface Row {
  id: string;
  name: string;
  role: string;
  status: "active" | "inactive";
  score: number;
}

// 1000-row fixture for the v1.2 memo regression test. Generated
// deterministically so subsequent renders compare apples-to-apples.
const ROWS: Row[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `row-${i}`,
  name: `User ${i.toString().padStart(4, "0")}`,
  role: ["Admin", "Editor", "Viewer"][i % 3] ?? "Viewer",
  status: i % 5 === 0 ? "inactive" : "active",
  score: ((i * 13) % 100) + 1,
}));

export default function DataGridLargeRoute() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [unrelated, setUnrelated] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return ROWS;
    const cmp = (a: Row, b: Row) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      if (av === bv) return 0;
      const less = (av as never) < (bv as never);
      return (less ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
    };
    return [...ROWS].sort(cmp);
  }, [sortKey, sortDir]);

  const toggleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir("asc");
        return key;
      }
      return key;
    });
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }, []);

  return (
    <>
      <button
        data-testid="sort-name"
        onClick={() => toggleSort("name")}
      >
        sort name
      </button>
      <button
        data-testid="sort-score"
        onClick={() => toggleSort("score")}
      >
        sort score
      </button>
      <button
        data-testid="bump-unrelated"
        onClick={() => setUnrelated((n) => n + 1)}
      >
        bump
      </button>
      <p data-testid="unrelated">unrelated: {unrelated}</p>
      <DataGrid<Row>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "role", header: "Role", accessor: (r) => r.role },
          { key: "status", header: "Status", accessor: (r) => r.status },
          { key: "score", header: "Score", accessor: (r) => r.score },
        ]}
        data={sorted}
        rowKey={(r) => r.id}
        rowSelection="multi"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p data-testid="row-count">rows: {sorted.length}</p>
    </>
  );
}
