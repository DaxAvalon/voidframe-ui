import { useState } from "react";
import { DataGrid } from "voidframe";

interface Row {
  id: string;
  name: string;
  role: string;
  status: "active" | "inactive";
}

const rows: Row[] = [
  { id: "a", name: "Alice", role: "Admin", status: "active" },
  { id: "b", name: "Bob", role: "Editor", status: "active" },
  { id: "c", name: "Carol", role: "Viewer", status: "inactive" },
  { id: "d", name: "Dan", role: "Editor", status: "active" },
  { id: "e", name: "Eve", role: "Admin", status: "inactive" },
];

export default function DataGridRoute() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  return (
    <>
      <DataGrid<Row>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "role", header: "Role", accessor: (r) => r.role },
          { key: "status", header: "Status", accessor: (r) => r.status },
        ]}
        data={rows}
        rowKey={(r) => r.id}
        rowSelection="multi"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p data-testid="selection">
        selected: {Array.from(selected).sort().join(",") || "—"}
      </p>
      <button data-testid="outside">outside</button>
    </>
  );
}
