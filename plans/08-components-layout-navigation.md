# 08 — Components: Layout & Navigation

**Goal:** Ship ~30 layout and navigation components forming the structural skeleton for applications.

**Depends on:** Track A (01-06).
**Effort:** 3-4 days.

## Layout

### L01. Box (new — polymorphic primitive)

```tsx
<Box as="section" p={4} bg="bg-2" border="1px solid" borderColor="border-2">
  ...
</Box>
```

- Accepts shorthand style props: `p` / `px` / `py` / `m` / `mx` / `my` (spacing-scale values), `bg`, `color`, `border`, `borderColor`, `width`, `height`, `minHeight`, `flex`, `gap`.
- Polymorphic `as`.
- **Escape-hatch for one-offs without writing CSS.** Not the default building block; prefer semantic components.

### L02. Flex (upgrade)

```tsx
<Flex direction="row" align="center" justify="between" gap={3} wrap />
```

### L03. HStack / VStack (upgrade)

Shorthand for `Flex` with direction + default gap.

### L04. Stack (new)

Vertical stack with consistent `gap`. Semantic alias of `VStack`; exported as both.

### L05. Grid (upgrade)

```tsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4} rows={"auto"} />
```

- `columns` can be number, template string, or responsive object.

### L06. GridItem (new)

```tsx
<GridItem colSpan={2} rowSpan={1} colStart={1} />
```

### L07. Container (upgrade)

```tsx
<Container maxWidth="lg" centered padding />
```

- `maxWidth`: `sm` | `md` | `lg` | `xl` | `xxl` | `full` | string.

### L08. Center (upgrade)

Flex container that centers children on both axes.

### L09. AspectRatio (upgrade / → primitive)

### L10. Spacer (upgrade)

Grows to fill space in a flex container.

### L11. Divider (upgrade)

```tsx
<Divider orientation="horizontal" label="OR" />
```

- Optional label in middle.

### L12. Separator — alias.

### L13. ScrollArea (new)

Custom scrollbars with Voidframe styling; falls back to native on mobile.

```tsx
<ScrollArea height="300px" type="always" | "hover" | "auto">
  <LongContent />
</ScrollArea>
```

- Thumb is 2px wide; bg-3 background; text-2 thumb.
- Overlay mode (thumbs don't take layout space).

### L14. ScrollRow (upgrade)

Horizontal-scrolling row with scroll snap and scroll-start/end masks.

### L15. StickyHeader / Sticky (new)

```tsx
<Sticky top={0} zIndex="sticky" offset={8}>
  <Header />
</Sticky>
```

- CSS `position: sticky` wrapper with optional offset and z-index token.

### L16. SplitView (upgrade)

```tsx
<SplitView direction="horizontal" defaultSizes={[300, "1fr"]} minSize={200} />
```

### L17. ResizablePanel / ResizableGroup (new)

Group of panels with draggable dividers. Persists sizes to localStorage optionally.

```tsx
<ResizableGroup direction="horizontal" onLayout={(sizes) => void}>
  <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>
    <Main />
  </ResizablePanel>
</ResizableGroup>
```

- Keyboard-accessible handles (arrow keys resize).

### L18. Masonry (new)

CSS grid masonry with JS fallback for browsers without support.

```tsx
<Masonry columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
  {items.map(...)}
</Masonry>
```

### L19. SafeArea (new)

```tsx
<SafeArea top right bottom left>
  ...
</SafeArea>
```

- Applies `padding: env(safe-area-inset-top)` etc. For iOS/Android PWAs.

### L20. AppShell (new — opinionated page-level layout)

```tsx
<AppShell
  header={<AppHeader />}
  sidebar={<AppSidebar />}
  sidebarWidth={240}
  sidebarCollapsible
  rightPanel={<Inspector />}
  footer={<StatusBar />}
>
  <main>...</main>
</AppShell>
```

- Header (fixed top), sidebar (fixed left, collapsible), right panel (collapsible), main content, footer.
- Mobile: sidebar collapses to drawer.

### L21. PageHeader (new)

```tsx
<PageHeader
  title="Users"
  description="Manage team members"
  breadcrumbs={<Breadcrumb />}
  actions={<Button>New</Button>}
  tabs={<Tabs />}
/>
```

- Standard page header composition.

### L22. Section (new)

```tsx
<Section title="Profile" description="...">
  {children}
</Section>
```

- Titled section within a page.

### L23. EmptyLayout / BlankLayout (new)

Full-height centered layout for empty states, onboarding, 404s.

### L24. FormLayout (new)

Specialized AppShell variant for multi-step forms with step indicator + actions footer.

---

## Navigation

### N01. Breadcrumb (upgrade)

```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/users">Users</Breadcrumb.Item>
  <Breadcrumb.Item current>Alice</Breadcrumb.Item>
</Breadcrumb>
```

- Compound; supports custom separator.
- Auto-collapse with ellipsis when overflowing (`maxItems` prop).

### N02. Pagination (upgrade)

```tsx
<Pagination
  page={page} totalPages={total} onChange
  siblingCount={1} boundaryCount={1}
  showFirstLast showPrevNext
  showPageSize pageSize onPageSizeChange pageSizeOptions={[10, 25, 50, 100]}
/>
```

### N03. CursorPagination (new)

```tsx
<CursorPagination hasPrev hasNext onPrev onNext loading />
```

- Simpler prev/next only, for cursor-based APIs.

### N04. Stepper (upgrade)

```tsx
<Stepper current={2} onChange>
  <Stepper.Step label="Account" description="Basic info" />
  <Stepper.Step label="Profile" optional />
  <Stepper.Step label="Confirm" />
</Stepper>
```

- Horizontal/vertical; numbered/dotted variants; clickable steps optional.

### N05. Wizard (new)

State-machine-driven multi-step form.

```tsx
<Wizard steps={[...]} onComplete={data => ...}>
  <Wizard.Step id="account">{...}</Wizard.Step>
  <Wizard.Step id="profile">{...}</Wizard.Step>
  <Wizard.Footer>
    <Wizard.Previous>Back</Wizard.Previous>
    <Wizard.Next>Continue</Wizard.Next>
  </Wizard.Footer>
</Wizard>
```

- Internal state machine; validation hooks per step.

### N06. NavItem (upgrade)

```tsx
<NavItem href="/users" icon={<UsersIcon />} badge={<Badge>12</Badge>} selected>
  Users
</NavItem>
```

- `asChild` for framework router integration: `<NavItem asChild><Link to="/">Home</Link></NavItem>`.
- Selected state via prop or `aria-current`.

### N07. NavGroup (upgrade)

Collapsible grouping of nav items with label.

### N08. Sidebar (new)

Opinionated vertical navigation container.

```tsx
<Sidebar>
  <Sidebar.Brand>VOIDFRAME</Sidebar.Brand>
  <Sidebar.Section label="MAIN">
    <NavItem>...</NavItem>
  </Sidebar.Section>
  <Sidebar.Separator />
  <Sidebar.Section label="SETTINGS">
    ...
  </Sidebar.Section>
  <Sidebar.Footer>
    <UserMenu />
  </Sidebar.Footer>
</Sidebar>
```

### N09. SidebarCollapsible (new)

Sidebar that collapses to icon-only rail on small screens or button toggle.

### N10. NavigationRail (new)

Icon-only vertical nav (mobile-friendly), typically 56px wide.

### N11. TopNav / Navbar (new)

```tsx
<Navbar>
  <Navbar.Brand>VF</Navbar.Brand>
  <Navbar.Links>
    <Navbar.Link href="/">Home</Navbar.Link>
  </Navbar.Links>
  <Navbar.Actions>
    <Button>Sign in</Button>
  </Navbar.Actions>
</Navbar>
```

### N12. TabBar (new — mobile/app-style, distinct from Tabs)

Bottom nav for mobile apps.

```tsx
<TabBar value onChange>
  <TabBar.Item value="home" icon={<HomeIcon />}>Home</TabBar.Item>
  <TabBar.Item value="search" icon={<SearchIcon />}>Search</TabBar.Item>
</TabBar>
```

### N13. Tabs (upgrade — compound)

```tsx
<Tabs defaultValue="a" orientation="horizontal" activation="automatic" | "manual">
  <Tabs.List>
    <Tabs.Trigger value="a">Overview</Tabs.Trigger>
    <Tabs.Trigger value="b">Detail</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="a">A</Tabs.Panel>
  <Tabs.Panel value="b">B</Tabs.Panel>
</Tabs>
```

- Vertical variant (for split-pane layouts).
- Overflow handling: horizontal scroll with edge masks, or condensed "More" menu.

### N14. Menu (new — compound nav menu)

```tsx
<Menu>
  <Menu.Trigger asChild><Button>Menu</Button></Menu.Trigger>
  <Menu.Content>
    <Menu.Item onSelect={...}>Item 1</Menu.Item>
    <Menu.Separator />
    <Menu.CheckboxItem checked onCheckedChange>Show toolbar</Menu.CheckboxItem>
    <Menu.RadioGroup value onChange>
      <Menu.RadioItem value="a">A</Menu.RadioItem>
    </Menu.RadioGroup>
    <Menu.Sub>
      <Menu.SubTrigger>Share</Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.Item>Twitter</Menu.Item>
      </Menu.SubContent>
    </Menu.Sub>
  </Menu.Content>
</Menu>
```

- Radix-style compound menu.
- Supports nested submenus, checkboxes, radios, separators, labels, keyboard + typeahead.

### N15. MenuBar (new)

Top-bar menu (like macOS menu bar: File / Edit / View).

```tsx
<MenuBar>
  <MenuBar.Menu trigger="File">
    <MenuBar.Item shortcut="Cmd+N">New</MenuBar.Item>
    <MenuBar.Item>Open</MenuBar.Item>
  </MenuBar.Menu>
  <MenuBar.Menu trigger="Edit">...</MenuBar.Menu>
</MenuBar>
```

### N16. ContextMenu (new)

Right-click context menu.

```tsx
<ContextMenu>
  <ContextMenu.Trigger asChild>
    <div>Right-click me</div>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item>Copy</ContextMenu.Item>
    <ContextMenu.Item>Paste</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>
```

- Also handles long-press on touch.

### N17. Dropdown (upgrade → Menu alias for simpler cases)

Simplified wrapper: `<Dropdown items={[{ label, onSelect }]} />`.

### N18. MegaMenu (new)

Multi-column dropdown for large nav structures.

```tsx
<MegaMenu>
  <MegaMenu.Trigger>Products</MegaMenu.Trigger>
  <MegaMenu.Content columns={3}>
    <MegaMenu.Section title="Infrastructure">
      <MegaMenu.Link href="/compute">Compute</MegaMenu.Link>
    </MegaMenu.Section>
    ...
  </MegaMenu.Content>
</MegaMenu>
```

### N19. Toolbar (new)

```tsx
<Toolbar>
  <Toolbar.Button>Bold</Toolbar.Button>
  <Toolbar.ToggleGroup type="single" value>
    <Toolbar.ToggleItem value="left">L</Toolbar.ToggleItem>
  </Toolbar.ToggleGroup>
  <Toolbar.Separator />
  <Toolbar.Link href="/">Home</Toolbar.Link>
</Toolbar>
```

- Horizontal tool strip; roving tabindex; used by editors.

### N20. Anchor / ScrollSpy (new)

```tsx
<ScrollSpy>
  <ScrollSpy.List>
    <ScrollSpy.Item target="intro">Introduction</ScrollSpy.Item>
    <ScrollSpy.Item target="usage">Usage</ScrollSpy.Item>
  </ScrollSpy.List>
</ScrollSpy>
<section id="intro">...</section>
<section id="usage">...</section>
```

- Observes scroll position; highlights active item.
- Clicking item scrolls to section smoothly.

### N21. BackToTop (new)

Floating button appearing after scroll threshold.

```tsx
<BackToTop threshold={300} position="bottom-right" />
```

### N22. SkipToContent (new)

```tsx
<SkipToContent href="#main">Skip to main content</SkipToContent>
```

- Visually hidden until focused; jumps to main landmark.

### N23. StatusBar (upgrade)

Bottom bar showing app status / metadata.

```tsx
<StatusBar>
  <StatusBar.Item label="BRANCH" value="main" />
  <StatusBar.Item label="LINE" value="42:17" />
  <StatusBar.Spacer />
  <StatusBar.Item label="CONN" value="connected" tone="success" />
</StatusBar>
```

### N24. Command / CommandMenu (new — see Phase 10)

Referenced here; implemented in Phase 10 as `<CommandPalette>`.

### N25. Shortcut / Kbd (upgrade)

```tsx
<Kbd>Cmd</Kbd><Kbd>K</Kbd>
<Shortcut keys="mod+k" />   // renders platform-correct keys
```

- `<Shortcut>` is platform-aware (macOS → ⌘, Windows/Linux → Ctrl).

### N26. ShortcutList / ShortcutGuide (new)

Overlay listing all registered keyboard shortcuts — invoked via `?`.

### N27. TreeNav (new)

Tree-style nested navigation (for docs, file explorers).

```tsx
<TreeNav items={navTree} activeId={currentId} onSelect />
```

### N28. UserMenu (new)

```tsx
<UserMenu user={{ name, email, avatar }}>
  <UserMenu.Item>Profile</UserMenu.Item>
  <UserMenu.Item>Settings</UserMenu.Item>
  <UserMenu.Separator />
  <UserMenu.Item>Sign out</UserMenu.Item>
</UserMenu>
```

- Trigger shows avatar + name; dropdown menu on click.

### N29. CommandCenter / QuickActions (new)

Compact action launcher (subset of CommandPalette) typically placed in header.

### N30. BreadcrumbMenu (new)

Breadcrumb with dropdown on each segment to navigate siblings.

---

## Acceptance Criteria

- [ ] All 30 components (layout + nav) implemented.
- [ ] AppShell composes cleanly with Sidebar, TopNav, StatusBar, PageHeader.
- [ ] Menu supports submenus, typeahead, keyboard nav end-to-end.
- [ ] ResizablePanel supports keyboard resize.
- [ ] ScrollArea works cross-browser.
- [ ] Demo app redesigned to use AppShell + Sidebar + PageHeader.
- [ ] All pass axe audit.
