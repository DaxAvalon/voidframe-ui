import { Tabs } from "voidframe";

export default function TabsRoute() {
  return (
    <>
      <Tabs defaultValue="overview">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="overview" data-testid="tab-overview">
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="activity" data-testid="tab-activity">
            Activity
          </Tabs.Trigger>
          <Tabs.Trigger value="settings" data-testid="tab-settings">
            Settings
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview" data-testid="panel-overview">
          Overview body
        </Tabs.Panel>
        <Tabs.Panel value="activity" data-testid="panel-activity">
          Activity body
        </Tabs.Panel>
        <Tabs.Panel value="settings" data-testid="panel-settings">
          Settings body
        </Tabs.Panel>
      </Tabs>
      <button data-testid="outside">outside</button>
    </>
  );
}
