import { VoidframeProvider, Text, Button, Card } from "voidframe-ui";

export default function App() {
  return (
    <VoidframeProvider>
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
            Your app is running. Edit src/App.tsx to begin.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Button variant="primary">Get started</Button>
          </div>
        </Card>
      </main>
    </VoidframeProvider>
  );
}
