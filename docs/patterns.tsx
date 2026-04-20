import { type ReactNode } from "react";
import {
  VStack, HStack, Text, Button, Input, Textarea, Toggle, Select,
  Checkbox, Divider, Label, Tabs, Badge, Stat, Progress,
  Avatar, Tag, Spinner, EmptyState, Spacer,
  Comment, CommentList, Result,
} from "../src";
import { Playground } from "../src/dev";
import { playgroundScope } from "./scope";

// ── Code strings ────────────────────────────────────────────

const LOGIN_FORM_CODE = `function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError("All fields required"); return; }
    setError("");
    alert("Login: " + email);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: "0 auto" }}>
      <VStack gap={12}>
        <Text size="xl" style={{ fontWeight: 700 }}>Sign In</Text>
        <Text size="sm" style={{ color: "var(--vf-text-3)" }}>Enter your credentials to continue</Text>
        {error && <Text size="sm" style={{ color: "var(--vf-red)" }}>{error}</Text>}
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Checkbox checked={remember} onValueChange={() => setRemember(!remember)} label="Remember me" />
          <Button variant="ghost" size="sm">Forgot password?</Button>
        </HStack>
        <Button type="submit" style={{ width: "100%" }}>Sign In</Button>
        <Divider />
        <Text size="sm" style={{ textAlign: "center", color: "var(--vf-text-3)" }}>
          Don&apos;t have an account? <Button variant="ghost" size="sm">Sign up</Button>
        </Text>
      </VStack>
    </form>
  );
}
render(<LoginForm />);`;

const SETTINGS_PAGE_CODE = `function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@example.com");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <VStack gap={16} style={{ maxWidth: 480 }}>
      <Text size="xl" style={{ fontWeight: 700 }}>Settings</Text>
      <Tabs value={tab} onValueChange={setTab}>
        <Tabs.List aria-label="Settings sections">
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <VStack gap={12}>
            <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select
              label="Timezone"
              options={[
                { value: "utc", label: "UTC" },
                { value: "est", label: "US Eastern" },
                { value: "pst", label: "US Pacific" },
                { value: "cet", label: "Central European" },
              ]}
              value="utc"
              onValueChange={() => {}}
            />
            <Button>Save Changes</Button>
          </VStack>
        </Tabs.Panel>
        <Tabs.Panel value="notifications">
          <VStack gap={16}>
            <Toggle checked={emailNotifs} onValueChange={setEmailNotifs} label="Email notifications" />
            <Toggle checked={pushNotifs} onValueChange={setPushNotifs} label="Push notifications" />
            <Toggle checked={weeklyDigest} onValueChange={setWeeklyDigest} label="Weekly digest" />
          </VStack>
        </Tabs.Panel>
        <Tabs.Panel value="security">
          <VStack gap={12}>
            <Input label="Current Password" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
            <Input label="New Password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            <Button>Update Password</Button>
          </VStack>
        </Tabs.Panel>
      </Tabs>
    </VStack>
  );
}
render(<SettingsPage />);`;

const DATA_TABLE_CODE = `function DataTablePage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const users = [
    { name: "Alice Chen", email: "alice@acme.co", role: "Admin", status: "active" },
    { name: "Bob Rivera", email: "bob@acme.co", role: "Editor", status: "active" },
    { name: "Carol Wu", email: "carol@acme.co", role: "Viewer", status: "inactive" },
    { name: "Dan Kowalski", email: "dan@acme.co", role: "Editor", status: "active" },
    { name: "Eve Okafor", email: "eve@acme.co", role: "Admin", status: "pending" },
  ];

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter;
    return matchSearch && matchRole;
  });

  const statusTone = { active: "success", inactive: "neutral", pending: "warning" };

  return (
    <VStack gap={12}>
      <Text size="xl" style={{ fontWeight: 700 }}>Team Members</Text>
      <HStack gap={8} style={{ alignItems: "flex-end" }}>
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or email..."
          style={{ flex: 1 }}
        />
        <Select
          label="Role"
          options={[
            { value: "all", label: "All Roles" },
            { value: "admin", label: "Admin" },
            { value: "editor", label: "Editor" },
            { value: "viewer", label: "Viewer" },
          ]}
          value={roleFilter}
          onValueChange={setRoleFilter}
          width={140}
        />
      </HStack>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--vf-fs-1)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--vf-border-1)", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", color: "var(--vf-text-2)", fontWeight: 500 }}>Name</th>
              <th style={{ padding: "8px 12px", color: "var(--vf-text-2)", fontWeight: 500 }}>Email</th>
              <th style={{ padding: "8px 12px", color: "var(--vf-text-2)", fontWeight: 500 }}>Role</th>
              <th style={{ padding: "8px 12px", color: "var(--vf-text-2)", fontWeight: 500 }}>Status</th>
              <th style={{ padding: "8px 12px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email} style={{ borderBottom: "1px solid var(--vf-border-0)" }}>
                <td style={{ padding: "8px 12px", color: "var(--vf-text-0)" }}>{u.name}</td>
                <td style={{ padding: "8px 12px", color: "var(--vf-text-2)" }}>{u.email}</td>
                <td style={{ padding: "8px 12px" }}>{u.role}</td>
                <td style={{ padding: "8px 12px" }}>
                  <Badge tone={statusTone[u.status]} size="sm">{u.status}</Badge>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--vf-text-3)" }}>
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Text size="sm" style={{ color: "var(--vf-text-3)" }}>
        Showing {filtered.length} of {users.length} members
      </Text>
    </VStack>
  );
}
render(<DataTablePage />);`;

const EMPTY_STATE_CODE = `function EmptyStateExamples() {
  return (
    <VStack gap={24}>
      <EmptyState
        icon={<span style={{ fontSize: 32 }}>📦</span>}
        title="No data yet"
        description="There are no records in this collection. Create your first entry to get started."
        action={<Button>Create Record</Button>}
      />
      <Divider />
      <EmptyState
        icon={<span style={{ fontSize: 32 }}>👋</span>}
        title="Welcome aboard!"
        description="You are all set up. Start by exploring the dashboard or importing your existing data."
        action={
          <HStack gap={8}>
            <Button>Explore Dashboard</Button>
            <Button variant="outline">Import Data</Button>
          </HStack>
        }
      />
      <Divider />
      <EmptyState
        icon={<span style={{ fontSize: 32 }}>🔍</span>}
        title="No results found"
        description="Your search did not match any records. Try adjusting your filters or search terms."
        action={<Button variant="outline">Clear Filters</Button>}
      />
    </VStack>
  );
}
render(<EmptyStateExamples />);`;

const ERROR_PAGES_CODE = `function ErrorPageExamples() {
  return (
    <HStack gap={24} style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 280px" }}>
        <Result
          status="success"
          title="Operation Complete"
          description="Your changes have been saved successfully."
          extra={
            <HStack gap={8}>
              <Button>Back to Dashboard</Button>
              <Button variant="outline">View Details</Button>
            </HStack>
          }
        />
      </div>
      <div style={{ flex: "1 1 280px" }}>
        <Result
          status="404"
          title="Page Not Found"
          description="The page you are looking for does not exist or has been moved."
          extra={
            <HStack gap={8}>
              <Button>Go Home</Button>
              <Button variant="outline">Go Back</Button>
            </HStack>
          }
        />
      </div>
    </HStack>
  );
}
render(<ErrorPageExamples />);`;

const STATS_DASHBOARD_CODE = `function StatsDashboard() {
  return (
    <VStack gap={16}>
      <Text size="xl" style={{ fontWeight: 700 }}>Dashboard</Text>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Total Users" value="12,847" change={12.5} />
        <Stat label="Revenue" value="\$48.2K" change={8.1} />
        <Stat label="Active Sessions" value="1,024" change={-3.2} />
        <Stat label="Error Rate" value="0.12%" change={-18.4} tone="success" />
      </div>
      <Divider />
      <VStack gap={8}>
        <Text size="sm" style={{ color: "var(--vf-text-2)", fontWeight: 500 }}>Resource Usage</Text>
        <VStack gap={6}>
          <Progress value={72} max={100} label="CPU" showValue size="sm" />
          <Progress value={58} max={100} label="Memory" showValue size="sm" />
          <Progress value={91} max={100} label="Storage" showValue size="sm" tone="danger" />
          <Progress value={34} max={100} label="Bandwidth" showValue size="sm" tone="success" />
        </VStack>
      </VStack>
      <Divider />
      <HStack gap={8}>
        <Badge tone="success" size="sm">All Systems Operational</Badge>
        <Badge tone="info" size="sm">Last updated: 2 min ago</Badge>
      </HStack>
    </VStack>
  );
}
render(<StatsDashboard />);`;

const COMMENT_THREAD_CODE = `function CommentThread() {
  const [reply, setReply] = useState("");

  return (
    <VStack gap={12} style={{ maxWidth: 520 }}>
      <Text size="xl" style={{ fontWeight: 700 }}>Discussion</Text>
      <CommentList>
        <Comment
          author="Alice"
          datetime="2 hours ago"
          content="I think we should refactor the authentication module before the next release. The current implementation has some edge cases with token refresh."
          actions={
            <HStack gap={8}>
              <Button variant="ghost" size="sm">Reply</Button>
              <Button variant="ghost" size="sm">Like</Button>
            </HStack>
          }
        >
          <Comment
            author="Bob"
            datetime="1 hour ago"
            content="Agreed. I ran into that exact issue last week. Happy to pair on it."
            actions={
              <HStack gap={8}>
                <Button variant="ghost" size="sm">Reply</Button>
                <Button variant="ghost" size="sm">Like</Button>
              </HStack>
            }
          />
          <Comment
            author="Charlie"
            datetime="45 min ago"
            content="I can handle the token refresh logic if someone takes the session management side."
            actions={
              <HStack gap={8}>
                <Button variant="ghost" size="sm">Reply</Button>
                <Button variant="ghost" size="sm">Like</Button>
              </HStack>
            }
          />
        </Comment>
      </CommentList>
      <Divider />
      <HStack gap={8} style={{ alignItems: "flex-end" }}>
        <Input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply..."
          style={{ flex: 1 }}
        />
        <Button disabled={!reply.trim()}>Post</Button>
      </HStack>
    </VStack>
  );
}
render(<CommentThread />);`;

const ONBOARDING_WIZARD_CODE = `function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("starter");

  const steps = ["Account", "Plan", "Confirm"];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <VStack gap={16} style={{ maxWidth: 420, margin: "0 auto" }}>
      <Text size="xl" style={{ fontWeight: 700 }}>Get Started</Text>
      <HStack gap={8} style={{ justifyContent: "center" }}>
        {steps.map((s, i) => (
          <Badge
            key={s}
            tone={i === step ? "info" : i < step ? "success" : "neutral"}
            variant={i === step ? "solid" : "outline"}
            size="sm"
          >
            {i + 1}. {s}
          </Badge>
        ))}
      </HStack>
      <Progress value={progress} max={100} size="sm" />

      {step === 0 && (
        <VStack gap={12}>
          <Text size="sm" style={{ color: "var(--vf-text-2)" }}>Tell us about yourself</Text>
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </VStack>
      )}

      {step === 1 && (
        <VStack gap={12}>
          <Text size="sm" style={{ color: "var(--vf-text-2)" }}>Choose your plan</Text>
          <Select
            label="Plan"
            options={[
              { value: "starter", label: "Starter - Free" },
              { value: "pro", label: "Pro - \$19/mo" },
              { value: "enterprise", label: "Enterprise - \$99/mo" },
            ]}
            value={plan}
            onValueChange={setPlan}
          />
        </VStack>
      )}

      {step === 2 && (
        <VStack gap={8}>
          <Text size="sm" style={{ color: "var(--vf-text-2)" }}>Review your details</Text>
          <div style={{ padding: 12, border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-0)" }}>
            <VStack gap={4}>
              <Text size="sm"><strong>Name:</strong> {name || "—"}</Text>
              <Text size="sm"><strong>Email:</strong> {email || "—"}</Text>
              <Text size="sm"><strong>Plan:</strong> {plan}</Text>
            </VStack>
          </div>
        </VStack>
      )}

      <HStack gap={8} style={{ justifyContent: "space-between" }}>
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button onClick={() => alert("Welcome, " + (name || "friend") + "!")}>Complete Setup</Button>
        )}
      </HStack>
    </VStack>
  );
}
render(<OnboardingWizard />);`;

// ── Pattern manifest ────────────────────────────────────────

export interface Pattern {
  id: string;
  title: string;
  description: string;
  components: string[];
  code: string;
}

export const patterns: Pattern[] = [
  {
    id: "login-form",
    title: "Login Form",
    description: "Authentication form with email/password, remember me, and validation.",
    components: ["Input", "Button", "Checkbox", "VStack", "Text"],
    code: LOGIN_FORM_CODE,
  },
  {
    id: "settings-page",
    title: "Settings Page",
    description: "Tabbed settings with profile, notifications, and security sections.",
    components: ["Tabs", "Input", "Toggle", "Select", "Button", "VStack"],
    code: SETTINGS_PAGE_CODE,
  },
  {
    id: "data-table",
    title: "Data Table Page",
    description: "Searchable data table with filters, actions, and pagination.",
    components: ["Input", "Select", "Button", "Badge", "HStack", "VStack"],
    code: DATA_TABLE_CODE,
  },
  {
    id: "empty-state",
    title: "Empty State",
    description: "Empty state variations for no data, first-time user, and search no results.",
    components: ["EmptyState", "Button", "VStack", "Text"],
    code: EMPTY_STATE_CODE,
  },
  {
    id: "error-pages",
    title: "Error Pages",
    description: "Error result pages: 404, 403, 500, and success confirmation.",
    components: ["Result", "Button", "VStack"],
    code: ERROR_PAGES_CODE,
  },
  {
    id: "stats-dashboard",
    title: "Stats Dashboard",
    description: "KPI dashboard with stat cards, progress indicators, and metrics.",
    components: ["Stat", "Progress", "Badge", "HStack", "VStack", "Text"],
    code: STATS_DASHBOARD_CODE,
  },
  {
    id: "comment-thread",
    title: "Comment Thread",
    description: "Threaded comments with replies, actions, and compose.",
    components: ["Comment", "CommentList", "Input", "Button"],
    code: COMMENT_THREAD_CODE,
  },
  {
    id: "onboarding-wizard",
    title: "Onboarding Wizard",
    description: "Multi-step form with progress indicator and validation.",
    components: ["Input", "Select", "Button", "Progress", "VStack", "Text"],
    code: ONBOARDING_WIZARD_CODE,
  },
];
