// AI-console landing demo — a full-page product screen assembled entirely from
// shipped voidframe-ui components (no bespoke widgets). It shows the chat / AI
// tier (Message, AgentTrace, AgentStep, ToolCall, PlanDisplay) composed inside
// the AppShell layout with a status bar and an inspector panel — the kind of
// "agent console" voidframe is built for.

import type { ReactNode } from "react";
import {
  AppShell,
  Text,
  Badge,
  Button,
  Card,
  Stat,
  Input,
  Message,
  AgentTrace,
  AgentStep,
  ToolCall,
  PlanDisplay,
  StatusBar,
} from "../../src";

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      style={{
        display: "block",
        width: "100%",
        textAlign: "start",
        padding: "6px 10px",
        background: active ? "var(--vf-bg-3)" : "transparent",
        border: "1px solid",
        borderColor: active ? "var(--vf-border-2)" : "transparent",
        color: active ? "var(--vf-text-0)" : "var(--vf-text-2)",
        font: "inherit",
        fontSize: "var(--vf-font-sm)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
        {title}
      </Text>
      {children}
    </div>
  );
}

const sidebar = (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 12 }}>
    <Text size="lg" upper spacing={3} color="var(--vf-text-0)">
      ▲ VOIDFRAME
    </Text>
    <Section title="Workspace">
      <NavItem label="Sessions" active />
      <NavItem label="Agents" />
      <NavItem label="Tools" />
      <NavItem label="Datasets" />
    </Section>
    <Section title="Recent runs">
      <NavItem label="deploy-bot · #4821" />
      <NavItem label="triage-agent · #4820" />
      <NavItem label="codegen · #4817" />
    </Section>
  </div>
);

const header = (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 16px",
      width: "100%",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Text size="md" color="var(--vf-text-0)" style={{ fontWeight: 600 }}>
        deploy-bot
      </Text>
      <Badge size="sm" variant="outline">
        claude-opus-4
      </Badge>
      <Badge size="sm" tone="success">
        running
      </Badge>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <Button size="sm" variant="ghost">
        Share
      </Button>
      <Button size="sm" variant="solid">
        New run
      </Button>
    </div>
  </div>
);

const rightPanel = (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 12 }}>
    <Section title="Run metrics">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Stat label="Tokens" value="48.2k" change={12} changeDirection="up" />
        <Stat label="Cost" value="$0.19" />
        <Stat label="Latency" value="2.4s" change={8} changeDirection="down" tone="success" />
        <Stat label="Steps" value="4" />
      </div>
    </Section>
    <Section title="Context">
      <Card style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        <Text size="sm" color="var(--vf-text-1)">repo: voidframe-ui</Text>
        <Text size="sm" color="var(--vf-text-1)">branch: main</Text>
        <Text size="sm" color="var(--vf-text-1)">12 files in scope</Text>
      </Card>
    </Section>
    <Section title="Guardrails">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Badge size="sm" tone="success">read-only fs</Badge>
        <Badge size="sm" tone="warning">network: allowlist</Badge>
        <Badge size="sm">max 8 steps</Badge>
      </div>
    </Section>
  </div>
);

const footer = (
  <StatusBar
    items={[
      { label: "STATUS", value: "running", color: "var(--vf-success)" },
      { label: "MODEL", value: "claude-opus-4" },
      { label: "TOKENS", value: "48,210" },
      { label: "COST", value: "$0.19" },
      { label: "ELAPSED", value: "00:02.4" },
    ]}
  />
);

const planSteps = [
  { id: "1", title: "Read CI failure logs", status: "done" as const },
  { id: "2", title: "Locate the failing assertion", status: "done" as const },
  { id: "3", title: "Patch the date util and re-run tests", status: "active" as const },
  { id: "4", title: "Open a PR with the fix", status: "pending" as const },
];

export default function AiConsole() {
  return (
    <AppShell
      header={header}
      sidebar={sidebar}
      rightPanel={rightPanel}
      footer={footer}
      sidebarWidth={240}
      rightPanelWidth={280}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 16,
          maxWidth: 860,
        }}
      >
        <Message
          role="user"
          author={{ name: "you" }}
          content="CI is red on main — the date utils test is failing. Find the cause and open a fix."
        />
        <Message
          role="assistant"
          author={{ name: "deploy-bot" }}
          content="On it. I'll pull the failing logs, isolate the assertion, patch the util, and verify before opening a PR."
        />

        <AgentTrace
          status="running"
          duration={2400}
          tokens={{ input: 31200, output: 17010, total: 48210 }}
          cost="$0.19"
          steps={
            <>
              <AgentStep
                number={1}
                title="Inspect CI logs"
                status="complete"
                duration={420}
                toolCalls={
                  <ToolCall
                    name="ci.get_logs"
                    status="complete"
                    args={{ run: 4821, job: "test" }}
                    result={{ failing: 1, suite: "utils/date" }}
                    duration={310}
                  />
                }
                output="One failing assertion in addDays() around month boundaries."
              />
              <AgentStep
                number={2}
                title="Reproduce locally"
                status="complete"
                duration={680}
                toolCalls={
                  <ToolCall
                    name="shell.run"
                    status="complete"
                    args={{ cmd: "npm test -- date" }}
                    result={{ failed: 1, passed: 218 }}
                    duration={650}
                  />
                }
              />
              <AgentStep
                number={3}
                title="Patch and re-test"
                status="running"
                toolCalls={
                  <ToolCall
                    name="fs.apply_patch"
                    status="running"
                    args={{ file: "src/utils/date.ts" }}
                  />
                }
              />
            </>
          }
        />

        <Card style={{ padding: 16 }}>
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)" style={{ marginBottom: 8 }}>
            Plan
          </Text>
          <PlanDisplay steps={planSteps} />
        </Card>

        <div style={{ display: "flex", gap: 8 }}>
          <Input
            placeholder="Send a follow-up instruction…"
            aria-label="Send a follow-up instruction"
            style={{ flex: 1 }}
          />
          <Button variant="solid">Send</Button>
        </div>
      </div>
    </AppShell>
  );
}
