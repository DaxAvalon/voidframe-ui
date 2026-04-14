# 11 — Components: Interactive & Media

**Goal:** Ship ~25 interactive patterns and media components — carousels, drag-drop, media players, image handling.

**Effort:** 3-4 days.

## Interactive patterns

### I01. Carousel (new)

```tsx
<Carousel
  slides={ReactNode[]}
  autoPlay interval pauseOnHover
  loop
  slidesPerView={1 | number | "auto"}
  gap
  align="start" | "center" | "end"
  onSlideChange
  controls="arrows" | "dots" | "both" | "none"
/>
```

Compound:

```tsx
<Carousel>
  <Carousel.Viewport>
    <Carousel.Slide>...</Carousel.Slide>
    <Carousel.Slide>...</Carousel.Slide>
  </Carousel.Viewport>
  <Carousel.Prev />
  <Carousel.Next />
  <Carousel.Dots />
</Carousel>
```

- Scroll-snap based; keyboard-accessible; pause on hover/focus.
- Multi-slide view with gap.

### I02. CarouselImage (new)

Specialization for image-only carousels with Ken Burns effect optional.

### I03. Lightbox (new)

```tsx
<Lightbox
  open onOpenChange
  images={{ src, alt, caption? }[]}
  index onIndexChange
  thumbnails zoom download
/>
```

- Portal + focus trap + keyboard (arrow keys, Escape).
- Pinch zoom on touch, wheel zoom on desktop.

### I04. ImageGallery (new)

Grid of images → opens Lightbox on click.

```tsx
<ImageGallery images columns gap aspectRatio onImageClick />
```

### I05. Collapsible (upgrade — primitive-backed)

Individual collapsible section (distinct from Accordion which manages multiple).

### I06. Accordion (new)

```tsx
<Accordion type="single" | "multiple" value onValueChange collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Title</Accordion.Trigger>
    <Accordion.Content>Content</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

- `type="single"` (one open) vs `"multiple"` (any).
- Keyboard: arrow up/down navigate, Home/End, Enter/Space activate.

### I07. Swipeable (new)

Wrapper enabling swipe gestures on children.

```tsx
<Swipeable onSwipeLeft onSwipeRight threshold={50}>
  <Card />
</Swipeable>
```

### I08. SwipeActions (new — mobile list item actions)

```tsx
<SwipeActions
  leadingActions={<SwipeActions.Action tone="success">Archive</SwipeActions.Action>}
  trailingActions={<SwipeActions.Action tone="danger">Delete</SwipeActions.Action>}
>
  <ListItem />
</SwipeActions>
```

### I09. Zoomable (new)

Pan/pinch-zoom container.

```tsx
<Zoomable min={0.5} max={4} step={0.1} onChange>
  <img />
</Zoomable>
```

### I10. DragDropContext (new)

```tsx
<DragDropContext onDragStart onDragEnd>
  <Droppable id="list">
    {({ dropRef, isOver }) => (
      <ul ref={dropRef}>
        <Draggable id="item-1">
          {({ dragRef, isDragging }) => <li ref={dragRef}>...</li>}
        </Draggable>
      </ul>
    )}
  </Droppable>
</DragDropContext>
```

- Native HTML5 drag or Pointer Events based. Keyboard fallback: click item → arrow keys reorder → space drop.
- Much lighter than `react-dnd`. For complex cases, consumers use `@dnd-kit/core`.

### I11. Sortable (new — higher-level wrapper)

```tsx
<Sortable
  items value onChange
  renderItem={(item, { dragHandle }) => ReactNode}
  strategy="vertical" | "horizontal" | "grid"
  handle
/>
```

- Built on DragDropContext.
- Keyboard accessible by default.

### I12. ReorderList (alias of Sortable with list semantics).

### I13. Resizable (see Phase 08 L17)

### I14. Splitter (alias of Resizable for two-pane case).

### I15. FocusVisibleScope (primitive alias).

### I16. Marquee (new)

Auto-scrolling ticker.

```tsx
<Marquee speed={50} direction="left" | "right" | "up" | "down" pauseOnHover loop>
  {items}
</Marquee>
```

### I17. Typewriter (new)

Typing animation for text reveal.

```tsx
<Typewriter text="Hello world" speed={50} cursor loop onComplete />
```

### I18. Ticker (new — numeric odometer)

```tsx
<Ticker from={0} to={12456} duration={1000} format={(n) => formatNumber(n)} />
```

---

## Media

### I19. Image (upgrade/new)

```tsx
<Image
  src alt
  width height
  aspectRatio
  fallback={src | <ReactNode>}           // shown on error
  loading="lazy" | "eager"
  placeholder="empty" | "blur" | data-url
  blurDataUrl
  objectFit
  onLoad onError
/>
```

- Blur-up placeholder.
- Fallback on error.
- Lazy loading via native `loading` attr + IntersectionObserver polyfill.

### I20. VideoPlayer (new)

```tsx
<VideoPlayer
  src poster
  controls="custom" | "native" | "none"
  autoPlay loop muted playsInline
  captions={CaptionTrack[]}
  onPlay onPause onTimeUpdate onEnded
/>
```

Compound:

```tsx
<VideoPlayer src>
  <VideoPlayer.Play />
  <VideoPlayer.Progress />
  <VideoPlayer.Volume />
  <VideoPlayer.Time />
  <VideoPlayer.Fullscreen />
  <VideoPlayer.CaptionsMenu />
</VideoPlayer>
```

- Custom controls by default (native is fallback).
- Keyboard: Space play/pause, arrow keys seek/volume, M mute, F fullscreen.
- Captions/subtitles support.

### I21. AudioPlayer (new)

Similar to VideoPlayer but for audio. No fullscreen; emphasis on waveform optional.

### I22. VoiceWaveform (new)

Static or streaming audio waveform visualization (for voice messages, recordings).

```tsx
<VoiceWaveform
  audioUrl | audioData={Float32Array}
  progress={0-1}
  onSeek
  height bars barWidth
/>
```

### I23. IFrame (new — sandboxed embed)

```tsx
<IFrame src title height sandbox loading="lazy" />
```

- Enforces `title` for a11y; default sandbox attrs.

### I24. Pdf (new, optional)

```tsx
<Pdf src page onPageChange zoom />
```

- Wraps `pdf.js` or similar (peer dep). Optional — may defer.

### I25. DocumentPreview (new)

Thumbnail + metadata preview of a document (PDF, image, text).

```tsx
<DocumentPreview src filename size kind onOpen onDownload />
```

---

## Utility Interactive

### I26. Clipboard (new)

Copy-button helper.

```tsx
<Clipboard value="text to copy" onCopy>
  {({ copy, copied }) => <Button onClick={copy}>{copied ? "Copied!" : "Copy"}</Button>}
</Clipboard>
```

Render prop OR default button:

```tsx
<Clipboard value="..." />
```

### I27. ShareButton (new)

Wraps `navigator.share` with fallback to copy-link.

```tsx
<ShareButton url title text />
```

### I28. ScrollIndicator (new)

Small indicator showing scroll progress of page/element.

```tsx
<ScrollIndicator target={ref} position="top" thickness={2} />
```

### I29. ReactionPicker (new — for chat/social)

Emoji or custom reaction picker.

```tsx
<ReactionPicker
  reactions={[{ id: "thumbsup", label: "👍" }, ...]}
  onReact={(id) => void}
  recent
  grid
/>
```

---

## Acceptance Criteria

- [ ] All 29 components implemented.
- [ ] Carousel keyboard accessible, scroll-snap smooth.
- [ ] Lightbox keyboard + touch-zoom.
- [ ] DragDropContext + Sortable work with keyboard.
- [ ] VideoPlayer/AudioPlayer work cross-browser.
- [ ] Image blur-up handles error gracefully.
- [ ] VoiceWaveform handles streaming data.
- [ ] All pass axe audit.
