"use client";

// shadcn-shaped Tabs. `TabsContent` aliases voidframe's `Tabs.Panel`
// (already aliased internally as `Tabs.Content` since v1.1 Phase B3).

import {
  Tabs as VFTabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
} from "../../components/Interactive";

export const Tabs = VFTabs;
export { TabsList, TabsTrigger };
export const TabsContent = TabsPanel;
