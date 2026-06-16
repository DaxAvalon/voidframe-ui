import { Text, Button, Card } from "voidframe-ui";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Card style={{ padding: 24, minWidth: 360 }}>
        <Text size="xl" upper spacing={3} color="var(--vf-text-0)">
          Voidframe
        </Text>
        <Text size="sm" color="var(--vf-text-3)">
          Your Next.js app is running. Edit app/page.tsx to begin.
        </Text>
        <div style={{ marginTop: 16 }}>
          <Button variant="solid">Get started</Button>
        </div>
      </Card>
    </main>
  );
}
