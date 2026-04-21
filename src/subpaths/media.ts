// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Carousel } from "voidframe-ui/media"`
// and drop every non-Media component from their bundle.
//
// Source of truth: docs/taxonomy.ts Media category.

export * from "../components/Carousel";
export * from "../components/Lightbox";
export * from "../components/Image";
export * from "../components/MediaPlayer";
export * from "../components/Embed";
export * from "../components/RichEmbed";
export * from "../components/ImageDiff";
