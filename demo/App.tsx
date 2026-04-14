/**
 * VOIDFRAME DEMO APP
 *
 * Run with: npx vite serve demo
 * Or copy this into your own project after installing voidframe.
 */
import { useState, type ReactNode } from "react";
import {
  VoidframeProvider,
  useTokens,
  Card,
  Button,
  ButtonGroup,
  Badge,
  Dots,
  Input,
  Textarea,
  Select,
  Toggle,
  Table,
  Stat,
  Progress,
  Tabs,
  Collapsible,
  Modal,
  Toast,
  Kbd,
  Text,
  Label,
  Divider,
  Spacer,
  StatusBar,
  SegmentBar,
  ScrollRow,
} from "../src";

interface SectionProps {
  title: string;
  children?: ReactNode;
}

function Section({ title, children }: SectionProps) {
  const t = useTokens();
  return (
    <div style={{ marginBottom: t.sp11 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: t.sp5,
          marginBottom: t.sp7,
        }}
      >
        <Text size="lg" color={t.text0} upper spacing={3}>
          {title}
        </Text>
        <div style={{ flex: 1, borderTop: `1px solid ${t.border1}` }} />
      </div>
      {children}
    </div>
  );
}

interface TableRow {
  name: string;
  role: string;
  score: number;
  status: "active" | "away" | "offline";
}

function DemoContent() {
  const t = useTokens();
  const [tab, setTab] = useState("overview");
  const [role, setRole] = useState("all");
  const [inputVal, setInputVal] = useState("");
  const [textVal, setTextVal] = useState("");
  const [selectVal, setSelectVal] = useState("opt1");
  const [tog1, setTog1] = useState(false);
  const [tog2, setTog2] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const tableData: TableRow[] = [
    { name: "Alice", role: "Engineer", score: 94, status: "active" },
    { name: "Bob", role: "Designer", score: 78, status: "active" },
    { name: "Charlie", role: "PM", score: 62, status: "away" },
    { name: "Diana", role: "Engineer", score: 88, status: "active" },
    { name: "Eve", role: "QA", score: 45, status: "offline" },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: t.sp11,
          paddingBottom: t.sp9,
          borderBottom: `1px solid ${t.border1}`,
        }}
      >
        <Text
          as="h1"
          size="xxl"
          color={t.text0}
          spacing={4}
          style={{ display: "block", fontWeight: 400 }}
        >
          VOIDFRAME DEMO
        </Text>
        <Spacer size={4} />
        <Text size="sm" color={t.text3} upper spacing={2}>
          Component showcase · All elements · Interactive
        </Text>
      </div>

      {/* Stats */}
      <Section title="Stat Blocks">
        <Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: t.sp8,
            }}
          >
            <Stat
              label="TOTAL USERS"
              value="12,847"
              color={t.green}
              sub="+340 this week"
            />
            <Stat label="ERRORS" value="23" color={t.red} sub="last 24h" />
            <Stat label="UPTIME" value="99.7%" color={t.amber} sub="30-day avg" />
            <Stat label="DEPLOY" value="#847" color={t.blue} sub="12 min ago" />
          </div>
        </Card>
      </Section>

      {/* Status Bar */}
      <Section title="Status Bar">
        <StatusBar
          items={[
            { label: "ENV", value: "PRODUCTION", color: t.green },
            { label: "REGION", value: "US-EAST-1" },
            { label: "LATENCY", value: "42ms", color: t.amber },
            { value: "2 alerts", color: t.red },
          ]}
        />
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <Card>
          <div
            style={{
              display: "flex",
              gap: t.sp4,
              flexWrap: "wrap",
              marginBottom: t.sp6,
            }}
          >
            <Button>DEFAULT</Button>
            <Button variant="accent" accent={t.green}>
              SUCCESS
            </Button>
            <Button variant="accent" accent={t.red}>
              DANGER
            </Button>
            <Button variant="solid" accent={t.amber}>
              SOLID
            </Button>
            <Button variant="ghost">GHOST</Button>
            <Button disabled>DISABLED</Button>
          </div>
          <Label>BUTTON GROUP</Label>
          <Spacer size={4} />
          <ButtonGroup
            options={[
              { key: "all", label: "ALL" },
              { key: "eng", label: "ENGINEERING" },
              { key: "design", label: "DESIGN" },
              { key: "pm", label: "PRODUCT" },
            ]}
            value={role}
            onChange={setRole}
          />
        </Card>
      </Section>

      {/* Badges */}
      <Section title="Badges & Indicators">
        <Card>
          <div
            style={{
              display: "flex",
              gap: t.sp3,
              flexWrap: "wrap",
              marginBottom: t.sp6,
            }}
          >
            <Badge color={t.green}>HEALTHY</Badge>
            <Badge color={t.amber}>DEGRADED</Badge>
            <Badge color={t.red}>DOWN</Badge>
            <Badge color={t.purple}>BETA</Badge>
            <Badge color={t.blue}>v2.4.1</Badge>
            <Badge color={t.cyan}>NEW</Badge>
          </div>
          <div style={{ display: "flex", gap: t.sp8, flexWrap: "wrap" }}>
            <div>
              <Dots count={2} color={t.green} />{" "}
              <Label style={{ marginLeft: 4 }}>LOW</Label>
            </div>
            <div>
              <Dots count={5} color={t.amber} />{" "}
              <Label style={{ marginLeft: 4 }}>MEDIUM</Label>
            </div>
            <div>
              <Dots count={8} color={t.red} />{" "}
              <Label style={{ marginLeft: 4 }}>CRITICAL</Label>
            </div>
          </div>
        </Card>
      </Section>

      {/* Forms */}
      <Section title="Form Controls">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: t.sp6,
          }}
        >
          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: t.sp6,
              }}
            >
              <Input
                label="PROJECT NAME"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="my-project"
              />
              <Textarea
                label="DESCRIPTION"
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                placeholder="Project description..."
              />
              <Select
                label="ENVIRONMENT"
                value={selectVal}
                onChange={setSelectVal}
                options={[
                  { value: "opt1", label: "Production" },
                  { value: "opt2", label: "Staging" },
                  { value: "opt3", label: "Development" },
                ]}
              />
            </div>
          </Card>
          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: t.sp6,
              }}
            >
              <Toggle
                checked={tog1}
                onChange={setTog1}
                label="ENABLE MONITORING"
              />
              <Toggle
                checked={tog2}
                onChange={setTog2}
                label="AUTO-DEPLOY"
                accent={t.amber}
              />
              <Divider />
              <Progress
                value={72}
                label="BUILD PROGRESS"
                showValue
                color={t.green}
              />
              <Progress
                value={45}
                label="TEST COVERAGE"
                showValue
                color={t.amber}
              />
              <Progress
                value={12}
                label="DISK USAGE"
                showValue
                color={t.red}
                height={4}
              />
            </div>
          </Card>
        </div>
      </Section>

      {/* Tabs */}
      <Section title="Tabs">
        <Tabs
          tabs={[
            { key: "overview", label: "OVERVIEW" },
            { key: "metrics", label: "METRICS" },
            { key: "logs", label: "LOGS" },
            { key: "config", label: "CONFIG" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <Spacer size={8} />
        <Card>
          <Text color={t.text2}>
            Active tab:{" "}
            <Text color={t.text0} upper>
              {tab}
            </Text>
          </Text>
        </Card>
      </Section>

      {/* Table */}
      <Section title="Data Table">
        <Card>
          <Table<TableRow>
            columns={[
              { key: "name", header: "NAME", width: "1fr", color: () => t.text0 },
              { key: "role", header: "ROLE", width: "100px", color: () => t.text3 },
              {
                key: "score",
                header: "SCORE",
                width: "60px",
                bold: true,
                color: (r) =>
                  r.score > 80 ? t.green : r.score > 60 ? t.amber : t.red,
              },
              {
                key: "status",
                header: "STATUS",
                width: "90px",
                render: (r) => (
                  <Badge
                    color={
                      r.status === "active"
                        ? t.green
                        : r.status === "away"
                          ? t.amber
                          : t.red
                    }
                  >
                    {r.status.toUpperCase()}
                  </Badge>
                ),
              },
            ]}
            data={tableData}
          />
        </Card>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div
          style={{ display: "flex", flexDirection: "column", gap: t.sp3 }}
        >
          <Toast type="info" message="Deployment queued for review." />
          <Toast type="success" message="Build #847 completed successfully." />
          <Toast type="warning" message="Rate limit approaching threshold." />
          <Toast
            type="danger"
            message="Database connection pool exhausted."
            onDismiss={() => {}}
          />
        </div>
      </Section>

      {/* Collapsible + Modal */}
      <Section title="Collapsible & Modal">
        <div
          style={{ display: "flex", flexDirection: "column", gap: t.sp3 }}
        >
          <Collapsible title="DEPLOYMENT LOGS" accent={t.green}>
            <Text
              size="sm"
              color={t.text2}
              style={{ display: "block", lineHeight: 1.8 }}
            >
              [14:23:01] Building container image...
              <br />
              [14:23:14] Running test suite (247 tests)...
              <br />
              [14:23:28] All tests passed.
              <br />
              [14:23:30] Pushing to registry...
              <br />
              [14:23:45] Deploy complete.
            </Text>
          </Collapsible>
          <Collapsible title="ENVIRONMENT VARIABLES" accent={t.amber}>
            <Text size="sm" color={t.text3}>
              DATABASE_URL, REDIS_URL, API_KEY, and 12 more configured.
            </Text>
          </Collapsible>
        </div>
        <Spacer />
        <Button variant="accent" accent={t.blue} onClick={() => setModalOpen(true)}>
          OPEN MODAL
        </Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="CONFIRM DEPLOYMENT"
        >
          <Text
            size="sm"
            color={t.text2}
            style={{ display: "block", marginBottom: t.sp7 }}
          >
            Deploy build #847 to production? This will affect all users
            immediately.
          </Text>
          <div
            style={{
              display: "flex",
              gap: t.sp3,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={() => setModalOpen(false)}>CANCEL</Button>
            <Button
              variant="solid"
              accent={t.green}
              onClick={() => setModalOpen(false)}
            >
              DEPLOY
            </Button>
          </div>
        </Modal>
      </Section>

      {/* Segment Bar */}
      <Section title="Segment Bar">
        <SegmentBar
          segments={[
            { label: "ALPHA", span: 2, color: t.blue },
            { label: "BETA", span: 4, color: t.amber },
            { label: "RC", span: 1, color: t.purple },
            { label: "STABLE", span: 6, color: t.green },
          ]}
        />
      </Section>

      {/* Scroll Row */}
      <Section title="Scroll Row">
        <ScrollRow>
          {[
            "Deploy #847",
            "Deploy #846",
            "Deploy #845",
            "Deploy #844",
            "Deploy #843",
            "Deploy #842",
          ].map((d, i) => (
            <Card key={i} style={{ minWidth: 160, flexShrink: 0 }}>
              <Text size="sm" color={t.text0}>
                {d}
              </Text>
              <Spacer size={4} />
              <Badge color={i === 0 ? t.green : t.text4}>
                {i === 0 ? "LIVE" : "ROLLED BACK"}
              </Badge>
            </Card>
          ))}
        </ScrollRow>
      </Section>

      {/* Keyboard shortcuts */}
      <Section title="Misc">
        <Card>
          <div
            style={{ display: "flex", gap: t.sp6, alignItems: "center" }}
          >
            <div>
              <Kbd keys="⌘K" />{" "}
              <Label style={{ marginLeft: 4 }}>COMMAND PALETTE</Label>
            </div>
            <div>
              <Kbd keys="Esc" />{" "}
              <Label style={{ marginLeft: 4 }}>CLOSE</Label>
            </div>
            <div>
              <Kbd keys="⌘S" /> <Label style={{ marginLeft: 4 }}>SAVE</Label>
            </div>
            <div>
              <Kbd keys="⌘⇧P" />{" "}
              <Label style={{ marginLeft: 4 }}>DEPLOY</Label>
            </div>
          </div>
        </Card>
      </Section>

      {/* Footer */}
      <Divider />
      <Text
        size="xxs"
        color={t.text5}
        upper
        spacing={t.letterSpacing}
        style={{ display: "block", textAlign: "center" }}
      >
        VOIDFRAME V1.0 · DARK MONOCHROME UI FRAMEWORK
      </Text>
    </div>
  );
}

export default function Demo() {
  return (
    <VoidframeProvider>
      <DemoContent />
    </VoidframeProvider>
  );
}
