# Feature-gap: Nav / Chat / Media / Core / Specialty (25 findings)

### 1. AppShell has no true mobile drawer
**Category:** Nav
**Benchmark:** Mantine AppShell `navbar.breakpoint`, MUI Drawer `variant="temporary"`, Chakra Drawer
**Gap:** Comment promises "mobile: sidebar collapses to a drawer" but the implementation just sets width to 0 — no overlay, no scrim, no auto-close-on-route-change, no swipe-to-open.
**Where to add:** `src/components/AppShell.tsx`
**Priority:** must-have

### 2. AppShell has no resize handle / keyboard toggle
**Category:** Nav
**Benchmark:** shadcn Sidebar (`Ctrl+B`), VS Code workbench
**Gap:** No drag-resize on the sidebar column, no global shortcut (mod+b) for `onSidebarCollapsedChange`, no keyboard hint in toggle button.
**Where to add:** `AppShell.tsx`
**Priority:** nice-to-have

### 3. Sidebar has no Item / Header / Search subcomponents
**Category:** Nav
**Benchmark:** Mantine `NavLink`, Chakra Sidebar, Ant Design Menu, shadcn `SidebarMenuButton`, `SidebarInput`
**Gap:** Only `Brand / Section / Separator / Footer` exist — no `Sidebar.Item` with icon/badge/active/href, no `Sidebar.Header`, no nested/collapsible groups, no built-in search input, no tooltip-on-hover in rail mode.
**Where to add:** `src/components/Sidebar.tsx`
**Priority:** must-have

### 4. Toolbar is width-oblivious
**Category:** Nav
**Benchmark:** Radix Toolbar (roving focus), Ant Design PageHeader overflow, MUI ToggleButtonGroup
**Gap:** Prop surface is only `orientation`. No `Toolbar.Group`/`Separator` subcomponent types surfaced in props, no overflow-to-menu when width shrinks, no sticky variant, and arrow-key roving focus is not documented.
**Where to add:** `src/components/Toolbar.tsx`
**Priority:** must-have

### 5. BreadcrumbMenu lacks overflow collapse
**Category:** Nav
**Benchmark:** Radix Breadcrumb `<Ellipsis>`, Ant Breadcrumb `maxItems`, MUI `maxItems`/`itemsAfterCollapse`
**Gap:** Only `items` + `separator`. No `maxItems` with ellipsis, no dropdown for the collapsed middle crumbs, no per-crumb icon slot.
**Where to add:** `src/components/BreadcrumbMenu.tsx`
**Priority:** nice-to-have

### 6. Wizard has no built-in Stepper UI or progress bar
**Category:** Nav
**Benchmark:** Mantine Stepper, Ant Design Steps, MUI Stepper with `LinearProgress`
**Gap:** `Wizard` renders only the active step + prev/next — no rendered step list, no numeric progress bar from `currentIndex/total`, no `nonLinear` (click-to-jump) gate tied to `canAdvance`, no `Review` summary step, no persist-across-refresh helper. `Stepper` exists separately in `Navigation.tsx` but isn't wired in.
**Where to add:** `src/components/Wizard.tsx`
**Priority:** must-have

### 7. MenuItem has no icon or trailing-content slot
**Category:** Nav
**Benchmark:** Radix Menu examples (icon + label + shortcut), shadcn DropdownMenu, Mantine Menu `leftSection`
**Gap:** `MenuItem` exposes only `disabled / onSelect / shortcut`. No `icon`/`leftSection` prop, no trailing badge/description slot; consumers must hand-render layout.
**Where to add:** `src/components/Menu.tsx`
**Priority:** nice-to-have

### 8. Menu has no scrollable long-list variant
**Category:** Nav
**Benchmark:** Radix Menu `ScrollUpButton`/`ScrollDownButton`, Ant Design Menu `overflowedIndicator`
**Gap:** No `maxHeight`/scroll-into-view for long menus; auto-scroll arrows are absent.
**Where to add:** `Menu.tsx`
**Priority:** nice-to-have

### 9. Chat has no reply-to / thread primitives
**Category:** Chat
**Benchmark:** Slack/Teams reply, Discord threads, Microsoft Fluent
**Gap:** Message supports `reactions`, `pinned`, `edited`, `attachments`, but no `replyTo`/quoted-message subcomponent, no `MessageThread` compound, no read-receipts (`readBy`) slot. `MessageActions.Pin` exists but there is no reply/quote action.
**Where to add:** `src/components/Chat.tsx`
**Priority:** must-have

### 10. No ModelPicker / settings dropdown for agents
**Category:** Chat
**Benchmark:** Vercel AI SDK UI, OpenWebUI, Claude workbench
**Gap:** `ChatModel.tsx` has `SystemPromptEditor`, `ContextWindow`, `CostDisplay`, `TraceViewer` but no `ModelPicker`, no temperature/top-p settings popover, no streaming-stop control wired into a shared session context.
**Where to add:** `src/components/ChatModel.tsx`
**Priority:** must-have

### 11. Composer has no slash-command / emoji integration
**Category:** Composer
**Benchmark:** Slack composer, Discord, LobeChat
**Gap:** `SlashCommandInput` and `MentionInput` exist standalone but the `Composer` has no prop to attach them, no emoji-picker subcomponent, no paste-image handler, no drop-file indicator on the textarea itself.
**Where to add:** `src/components/ChatComposer.tsx`
**Priority:** must-have

### 12. Carousel missing vertical orientation and thumb navigator
**Category:** Carousel
**Benchmark:** Swiper.js, Embla, Keen Slider
**Gap:** Props expose `slides`, `autoPlay`, `pauseOnHover`, `loop`, `slidesPerView` — but no `orientation="vertical"`, no `thumbs`/pair-with-another-carousel prop, no `centered` alignment (only `align` enum), no autoplay-progress indicator.
**Where to add:** `src/components/Carousel.tsx`
**Priority:** nice-to-have

### 13. MediaPlayer lacks PiP, playback rate, chapters, quality
**Category:** Media
**Benchmark:** Vidstack, Plyr, YouTube/Vimeo controls
**Gap:** `VideoPlayer` / `AudioPlayer` expose only basic HTML video props + `captions`. No `playbackRate`, no `pip`, no `chapters`/markers, no `quality` source-switching, no `next/previous` queue, no share-at-timestamp.
**Where to add:** `src/components/MediaPlayer.tsx`
**Priority:** must-have

### 14. Image missing srcset/sizes, loading="lazy" and lightbox glue
**Category:** Image
**Benchmark:** Next/Image, Chakra Image, Mantine Image
**Gap:** Has `placeholder`/`blurDataUrl`/`fallback`/`aspectRatio` but no `srcSet`/`sizes`/`loading`/`fetchPriority` pass-through, and no `onClick` → Lightbox integration prop (`lightbox` boolean).
**Where to add:** `src/components/Image.tsx`
**Priority:** nice-to-have

### 15. Lightbox has no captions, no slideshow, no pinch-zoom link
**Category:** Media
**Benchmark:** yet-another-react-lightbox, PhotoSwipe
**Gap:** Props are `images/open/index/thumbnails/zoom/download`. No caption/description per image shown, no slideshow/autoplay, no swipe-down-to-close gesture, no share button, no fullscreen API hook.
**Where to add:** `src/components/Lightbox.tsx`
**Priority:** nice-to-have

### 16. DragDrop / Sortable missing multi-select and file-drag
**Category:** DragDrop
**Benchmark:** dnd-kit (`useSortableSensors` keyboard), react-dropzone file drop, Notion multi-select drag
**Gap:** `Sortable` has only `items/getKey/renderItem/strategy/handle` — no `multiSelect`, no `activationConstraint` (delayed/long-press), no drop-indicator-between-items prop, and no way to accept external files dropped into a Sortable list (needs FileUpload zone interop).
**Where to add:** `src/components/DragDrop.tsx`
**Priority:** nice-to-have

### 17. Button has no loading / iconLeft+iconRight / async auto-disable
**Category:** Button
**Benchmark:** Mantine Button `loading`/`leftSection`/`rightSection`, Chakra `isLoading`, Ant Design `loading`
**Gap:** Props are only `onClick/disabled/variant/size/active/accent/asChild`. No `loading` spinner, no `iconLeft`/`iconRight` slots, no auto-disable while `onClick` promise is pending, no split-button, no toggle (pressed/aria-pressed) variant.
**Where to add:** `src/components/Button.tsx`
**Priority:** must-have

### 18. Badge has no dismissible / overflow-count behavior
**Category:** Badge
**Benchmark:** Ant Design Badge `count`/`overflowCount`, Chakra Tag `CloseButton`, MUI Chip `onDelete`
**Gap:** Has `dot`/`icon` but no `onDismiss`/close affordance, no `count`+`overflow` (99+) presentation, no pulse/animate-entry, no hash-to-color helper. `Tag` may differ but Badge itself is static.
**Where to add:** `src/components/Badge.tsx`
**Priority:** nice-to-have

### 19. Card lacks hoverable, clickable-as-link, collapsible, actions
**Category:** Card
**Benchmark:** Ant Design Card `hoverable`/`actions`, Chakra Card `asChild`-link, Mantine Card sections
**Gap:** Props are only `title/subtitle/headerRight/padding/asChild`. No `hoverable` elevation, no integrated `href`/link-card, no collapsible header via state, no `Card.Actions` footer compound, no `cover` image slot (like Ant), no skeleton state.
**Where to add:** `src/components/Card.tsx`
**Priority:** nice-to-have

### 20. Skeleton has no list/table/card presets
**Category:** Loading
**Benchmark:** Chakra SkeletonText/Circle/Rectangle, MUI Skeleton `variant="rectangular"`+ helpers, Mantine Skeleton
**Gap:** `Skeleton` accepts `shape` + `lines` but no presets for `list` rows with avatar+title+subtitle or `table` rows with column widths. No `LoadingOverlay` variant for inline blocks. Consumers must hand-compose.
**Where to add:** `src/components/DataExtended.tsx`
**Priority:** nice-to-have

### 21. Avatar has no hash-from-name color generator
**Category:** Avatar
**Benchmark:** Mantine Avatar `color="initials"`, Chakra `getInitialsColor`
**Gap:** Has `status`, `square`, `fallback`, `AvatarGroup.max`, but no deterministic color-from-name helper — `color` must be passed. No online/busy/away/dnd variants beyond whatever `status` enum covers; no `shape="rounded"` between circle and square.
**Where to add:** `src/components/DataExtended.tsx`
**Priority:** nice-to-have

### 22. Icon set has zero brand/social icons
**Category:** Icons
**Benchmark:** lucide-react, Tabler, Simple Icons, Radix Icons has GitHub/Figma/Discord
**Gap:** `src/icons/set.tsx` exports ~75 utility icons (chevrons, file, lock, chart, terminal, cloud, heart, star…) but no `GithubIcon`, `SlackIcon`, `YoutubeIcon`, `LinkedInIcon`, `TwitterIcon`/`XIcon`-brand, `FigmaIcon`, `DiscordIcon`, `GoogleIcon`, `AppleIcon`. Also no `HamburgerIcon` alias, `DotsIcon` variants covered but no `DragHandleIcon`, no `GitBranchIcon`/`GitCommitIcon` despite having a `CommitGraph` component.
**Where to add:** `src/icons/set.tsx`
**Priority:** nice-to-have

### 23. Gestures: no pinch-zoom on content, no swipe-row actions
**Category:** Gesture
**Benchmark:** react-use-gesture pinch, iOS Mail swipe-to-archive, Framer Motion drag
**Gap:** `Zoomable` does +/- controls but no pinch-zoom (two-finger) handler exposed. No swipe-actions-on-a-list-item primitive (left-reveals-actions). No long-press-to-open-menu helper beyond ContextMenu's right-click.
**Where to add:** `src/components/Gestures.tsx`
**Priority:** nice-to-have

### 24. ColorPicker missing eyedropper, contrast checker, color modes
**Category:** Color
**Benchmark:** Chrome DevTools color picker (EyeDropper API), Figma picker, react-colorful
**Gap:** `ColorPicker` has `allowAlpha` + `swatches` but no EyeDropper API trigger, no hex/rgb/hsl input mode toggle, no recent-colors history, no gradient builder. `ColorTools.tsx` has `ColorSwatch` but no `ContrastChecker` (AA/AAA pair).
**Where to add:** `src/components/ColorPicker.tsx`, `ColorTools.tsx`
**Priority:** nice-to-have

### 25. HelpChangelog has no feedback widget (thumbs up/down)
**Category:** Help
**Benchmark:** Productboard/Canny in-app feedback, GitHub Copilot feedback buttons
**Gap:** `Changelog` renders entries and `ContextHelp` shows inline tooltip help, but there is no `FeedbackWidget` primitive (thumbs up/down with an optional comment and `onSubmit(payload)`), despite being a common companion to help/changelog surfaces.
**Where to add:** `src/components/HelpChangelog.tsx`
**Priority:** nice-to-have
