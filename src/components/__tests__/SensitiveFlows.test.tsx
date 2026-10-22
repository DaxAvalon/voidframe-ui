// ConfirmDialogV2 arming (type-to-confirm, reason, acknowledge, async),
// SecretReveal, DecisionBar and DecisionCard.
import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ConfirmDialogV2 } from "../Dialog";
import { SecretReveal } from "../SecretReveal";
import { DecisionBar, DecisionCard } from "../DecisionBar";

describe("ConfirmDialogV2 arming", () => {
  it("requireText disables confirm until the exact text is typed", async () => {
    const onConfirm = vi.fn();
    renderWithTheme(<ConfirmDialogV2 defaultOpen requireText="prod-db" onConfirm={onConfirm} confirmLabel="Delete" />);
    const confirm = screen.getByRole("button", { name: "Delete" });
    expect(confirm).toBeDisabled();
    const input = screen.getByTestId("vf-confirm-require-input");
    await userEvent.type(input, "prod-d");
    expect(confirm).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(input, "b");
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(undefined);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("reason is passed to onConfirm; required reason and acknowledgement gate the button", async () => {
    const onConfirm = vi.fn();
    renderWithTheme(
      <ConfirmDialogV2 defaultOpen reason={{ label: "Why?", required: true }} acknowledge="I understand this is permanent." onConfirm={onConfirm} />
    );
    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByTestId("vf-confirm-reason-input"), "Duplicate record");
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getByTestId("vf-confirm-ack-input"));
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith("Duplicate record");
  });

  it("closeOnConfirm=false keeps the dialog open while an async confirm runs and on rejection", async () => {
    let reject!: (e: Error) => void;
    const onConfirm = vi.fn(() => new Promise<void>((_, rej) => { reject = rej; }));
    renderWithTheme(<ConfirmDialogV2 defaultOpen closeOnConfirm={false} onConfirm={onConfirm} />);
    const confirm = screen.getByRole("button", { name: "Confirm" });
    await userEvent.click(confirm);
    expect(confirm).toHaveAttribute("aria-busy", "true");
    expect(confirm).toBeDisabled();
    reject(new Error("Server said no"));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Server said no"));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(confirm).toBeEnabled();
  });

  it("closeOnConfirm=false closes once an async confirm resolves", async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const onOpenChange = vi.fn();
    renderWithTheme(<ConfirmDialogV2 defaultOpen closeOnConfirm={false} onConfirm={onConfirm} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("SecretReveal", () => {
  it("masks by default, reveals on request, copies, and acknowledging removes the value for good", async () => {
    const onAck = vi.fn();
    const { container, rerender } = renderWithTheme(<SecretReveal value="sk-live-1234" label="API token" onAcknowledge={onAck} />);
    const out = container.querySelector("output")!;
    expect(out).toHaveAttribute("data-revealed", "false");
    expect(out.textContent).not.toContain("sk-live");
    expect(out.textContent).toMatch(/^•+$/);
    await userEvent.click(screen.getByRole("button", { name: "Reveal" }));
    expect(out).toHaveTextContent("sk-live-1234");
    expect(screen.getByRole("button", { name: "Hide" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "I have saved it" }));
    expect(onAck).toHaveBeenCalledTimes(1);
    expect(container.querySelector("output")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("shown once");
    expect(container.textContent).not.toContain("sk-live-1234");
    // A re-render with the same value does not bring it back.
    rerender(<SecretReveal value="sk-live-1234" label="API token" onAcknowledge={onAck} />);
    expect(container.querySelector("output")).toBeNull();
  });
});

describe("DecisionBar and DecisionCard", () => {
  const actions = [
    { id: "approve", label: "Approve", tone: "success" as const },
    { id: "decline", label: "Decline", tone: "danger" as const, confirm: { title: "Decline request", reason: { label: "Reason", required: true } } },
    { id: "escalate", label: "Escalate" },
  ];

  it("decides directly or through a confirm dialog that collects a reason", async () => {
    const onDecide = vi.fn();
    renderWithTheme(<DecisionBar actions={actions} onDecide={onDecide} />);
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecide).toHaveBeenCalledWith("approve", undefined);
    await userEvent.click(screen.getByRole("button", { name: "Decline" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("Decline request");
    const confirm = screen.getByTestId("vf-confirm-confirm-button");
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByTestId("vf-confirm-reason-input"), "Out of budget");
    await userEvent.click(confirm);
    await waitFor(() => expect(onDecide).toHaveBeenCalledWith("decline", "Out of budget"));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("blocked disables every action and says why", () => {
    renderWithTheme(<DecisionBar actions={actions} onDecide={() => {}} blocked="Waiting for a second reviewer." />);
    expect(screen.getByRole("status")).toHaveTextContent("second reviewer");
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
    expect(screen.getByRole("group", { name: "Decision" })).toHaveAttribute("data-blocked", "true");
  });

  it("DecisionCard frames requester, expiry, details and the bar", () => {
    renderWithTheme(
      <DecisionCard title="Grant admin to Sam" requester="Sam" requestedAt="today" expiresAt={new Date("2030-01-01T00:00:00Z")} status={<span>Pending</span>} decision={{ actions, onDecide: () => {} }}>
        <p>Role change on the production project.</p>
      </DecisionCard>
    );
    const card = screen.getByRole("article", { name: "Grant admin to Sam" });
    expect(screen.getByRole("heading", { level: 3, name: "Grant admin to Sam" })).toBeInTheDocument();
    expect(card.querySelector("time")).toHaveAttribute("dateTime", "2030-01-01T00:00:00.000Z");
    expect(card).toHaveTextContent("Requested by");
    expect(card).toHaveTextContent("Role change");
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});
