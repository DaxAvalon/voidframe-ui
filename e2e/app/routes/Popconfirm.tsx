import { useState } from "react";
import { Popconfirm, Button } from "voidframe";

export default function PopconfirmRoute() {
  const [confirmCount, setConfirmCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);
  return (
    <>
      <Popconfirm
        title="Delete this file?"
        description="The file will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Keep"
        confirmVariant="danger"
        onConfirm={() => setConfirmCount((c) => c + 1)}
        onCancel={() => setCancelCount((c) => c + 1)}
      >
        <Button data-testid="trigger">Delete</Button>
      </Popconfirm>
      <p data-testid="confirm-count">confirmed: {confirmCount}</p>
      <p data-testid="cancel-count">cancelled: {cancelCount}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
