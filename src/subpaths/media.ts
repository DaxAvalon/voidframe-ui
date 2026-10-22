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
export * from "../components/LivePreview";
export { useUserMedia, userMediaReason } from "../hooks/useUserMedia";
export type { UseUserMediaOptions, UseUserMediaReturn, UserMediaState, UserMediaReason } from "../hooks/useUserMedia";
export { useAudioLevel, rmsDb, peakDb, applyRelease, detectSilence } from "../hooks/useAudioLevel";
export type { UseAudioLevelOptions, UseAudioLevelReturn, AudioLevelState } from "../hooks/useAudioLevel";
export { useMediaRecorder, pickRecorderMimeType } from "../hooks/useMediaRecorder";
export type { UseMediaRecorderOptions, UseMediaRecorderReturn, MediaRecorderState } from "../hooks/useMediaRecorder";
