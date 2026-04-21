import { Toaster, toast, Button } from "voidframe-ui";

export default function ToastSystemRoute() {
  // Long-ish default duration so assertions about presence have time to
  // run before auto-dismiss removes the toast mid-test.
  const duration = 10_000;
  return (
    <>
      <Toaster position="top-right" max={5} />
      <div style={{ display: "flex", gap: 12 }}>
        <Button
          data-testid="fire-success"
          onClick={() => toast.success({ title: "Saved", duration })}
        >
          Fire success
        </Button>
        <Button
          data-testid="fire-danger"
          onClick={() => toast.danger({ title: "Failed", duration })}
        >
          Fire danger
        </Button>
        <Button
          data-testid="fire-stack"
          onClick={() => {
            toast({ title: "First", tone: "info", duration });
            toast({ title: "Second", tone: "info", duration });
            toast({ title: "Third", tone: "info", duration });
          }}
        >
          Fire 3 stacked
        </Button>
      </div>
      <button data-testid="outside">outside</button>
    </>
  );
}
