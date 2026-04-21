import {
  Card,
  StatusBar,
  Badge,
  NotificationBadge,
  StatusIndicator,
  LiveIndicator,
  Kbd,
  Progress,
  MultiProgress,
  Avatar,
  AvatarGroup,
  Alert,
  AlertV2,
  BannerAlert,
  Callout,
  Quote,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
  Button,
} from "voidframe";

// Tier C display sweep. Every mostly-passive display component is rendered
// in a single route so the axe sweep can exercise all four themes without
// per-component boilerplate. Each category section carries a
// `data-testid="section-<name>"` marker so render-smoke tests can assert
// presence.
export default function DisplaySweepRoute() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section data-testid="section-cards">
        <h2>CARDS</h2>
        <Card title="CARD TITLE" subtitle="CARD SUBTITLE" actions={<Button>ACTION</Button>}>
          <p>Card body content goes here — prose, metrics, whatever.</p>
        </Card>
        <StatusBar
          items={[
            { label: "BRANCH", value: "main" },
            { label: "LINE", value: "42:7" },
            { label: "STATUS", value: "OK" },
          ]}
        />
      </section>

      <section data-testid="section-status">
        <h2>STATUS</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Badge tone="success">READY</Badge>
          <Badge tone="danger" variant="outline">ERROR</Badge>
          <Badge tone="warning" variant="subtle">WARN</Badge>
          <Badge tone="info" dot>INFO</Badge>
          <NotificationBadge count={3}>
            <Button>INBOX</Button>
          </NotificationBadge>
          <NotificationBadge count={120} max={99}>
            <Button>MAIL</Button>
          </NotificationBadge>
          <StatusIndicator status="online" label="ONLINE" />
          <StatusIndicator status="offline" label="OFFLINE" />
          <StatusIndicator status="busy" label="BUSY" />
          <LiveIndicator kind="live" label="LIVE FEED" />
          <LiveIndicator kind="typing" label="TYPING" animated={false} />
          <Kbd keys="Cmd+K" />
          <Kbd>ESC</Kbd>
        </div>
      </section>

      <section data-testid="section-progress">
        <h2>PROGRESS</h2>
        <Progress value={42} label="UPLOAD" showValue tone="info" />
        <Progress value={100} label="DONE" tone="success" showValue />
        <Progress variant="indeterminate" label="LOADING" />
        <MultiProgress
          items={[
            { key: "a", label: "BUILD", value: 100, status: "success", tone: "success" },
            { key: "b", label: "TEST", value: 60, status: "active", tone: "info" },
            { key: "c", label: "DEPLOY", value: 0, status: "pending" },
          ]}
        />
      </section>

      <section data-testid="section-avatars">
        <h2>AVATARS</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" status="online" />
          <Avatar fallback="?" square />
          <AvatarGroup
            max={3}
            items={[
              { name: "Ada Lovelace" },
              { name: "Grace Hopper" },
              { name: "Alan Turing" },
              { name: "Dennis Ritchie" },
              { name: "Margaret Hamilton" },
            ]}
          />
        </div>
      </section>

      <section data-testid="section-feedback">
        <h2>FEEDBACK</h2>
        <Alert type="info" title="LEGACY ALERT">
          The deprecated inline notice component.
        </Alert>
        <AlertV2 tone="success" title="SAVED" dismissible>
          Your changes were written to disk.
        </AlertV2>
        <AlertV2 tone="danger" title="FAILED">
          The upload could not complete.
        </AlertV2>
        <BannerAlert tone="warning" dismissible data-testid="banner-dismissible">
          Scheduled maintenance tonight at 02:00 UTC.
        </BannerAlert>
        <Callout tone="info" title="HEADS UP">
          Callouts are for editorial emphasis, not runtime events.
        </Callout>
        <Quote source="ADA LOVELACE">
          That brain of mine is something more than merely mortal, as time will show.
        </Quote>
      </section>

      <section data-testid="section-empty">
        <h2>EMPTY</h2>
        <EmptyState
          title="NO RESULTS"
          description="Try adjusting your filters or widening the search range."
          action={<Button>RESET FILTERS</Button>}
        />
      </section>

      <section data-testid="section-skeleton">
        <h2>SKELETON</h2>
        <Skeleton lines={3} />
        <SkeletonText lines={2} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" shape="square" />
          <SkeletonButton />
          <SkeletonButton size="lg" />
        </div>
        <SkeletonCard hasImage hasActions lines={3} />
        <SkeletonTable rows={3} columns={4} />
        <SkeletonForm fields={2} />
      </section>
    </div>
  );
}
