// Tests for VideoPlayer, AudioPlayer, VoiceWaveform

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { VideoPlayer, AudioPlayer, VoiceWaveform } from "../MediaPlayer";

// Mock HTMLMediaElement methods not available in happy-dom
beforeAll(() => {
  for (const proto of [HTMLVideoElement.prototype, HTMLAudioElement.prototype]) {
    if (!proto.play) {
      Object.defineProperty(proto, "play", {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
      });
    }
    if (!proto.pause) {
      Object.defineProperty(proto, "pause", {
        value: vi.fn(),
        writable: true,
      });
    }
  }
});

describe("VideoPlayer", () => {
  it("renders a video element with src", () => {
    const { container } = renderWithTheme(
      <VideoPlayer src="test.mp4" />
    );
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video?.getAttribute("src")).toBe("test.mp4");
  });

  it("renders with native controls", () => {
    const { container } = renderWithTheme(
      <VideoPlayer src="test.mp4" controls="native" />
    );
    const video = container.querySelector("video");
    expect(video?.hasAttribute("controls")).toBe(true);
  });

  it("renders with no controls", () => {
    const { container } = renderWithTheme(
      <VideoPlayer src="test.mp4" controls="none" />
    );
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    // No custom control bar rendered
    expect(container.querySelector(".vf-media__controls")).not.toBeInTheDocument();
  });

  it("renders custom controls by default", () => {
    const { container } = renderWithTheme(
      <VideoPlayer src="test.mp4" />
    );
    // Custom controls shell should be present
    expect(container.querySelector(".vf-media")).toBeInTheDocument();
  });

  it("accepts poster prop", () => {
    const { container } = renderWithTheme(
      <VideoPlayer src="test.mp4" poster="thumb.jpg" />
    );
    const video = container.querySelector("video");
    expect(video?.getAttribute("poster")).toBe("thumb.jpg");
  });
});

describe("AudioPlayer", () => {
  it("renders an audio element with src", () => {
    const { container } = renderWithTheme(
      <AudioPlayer src="track.mp3" />
    );
    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute("src")).toBe("track.mp3");
  });

  it("renders with native controls", () => {
    const { container } = renderWithTheme(
      <AudioPlayer src="track.mp3" controls="native" />
    );
    const audio = container.querySelector("audio");
    expect(audio?.hasAttribute("controls")).toBe(true);
  });
});

describe("VideoPlayer - custom controls", () => {
  it("renders Play button", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("renders Seek slider", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
  });

  it("renders Volume slider", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("renders Time display", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
  });

  it("renders Fullscreen button", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    expect(screen.getByRole("button", { name: "Enter fullscreen" })).toBeInTheDocument();
  });

  it("renders playback rate selector when showPlaybackRate", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" showPlaybackRate />);
    expect(screen.getByRole("combobox", { name: "Playback rate" })).toBeInTheDocument();
  });

  it("renders captions menu when captions provided", () => {
    renderWithTheme(
      <VideoPlayer
        src="test.mp4"
        captions={[{ src: "en.vtt", srcLang: "en", label: "English" }]}
      />
    );
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });
});

describe("AudioPlayer - custom controls", () => {
  it("renders Play button", () => {
    renderWithTheme(<AudioPlayer src="test.mp3" />);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("has Audio player aria label", () => {
    renderWithTheme(<AudioPlayer src="test.mp3" />);
    expect(screen.getByRole("group", { name: "Audio player" })).toBeInTheDocument();
  });
});

describe("VoiceWaveform", () => {
  it("renders SVG waveform bars from audioData", () => {
    const data = [0.1, 0.5, 0.8, 0.3, 0.6];
    const { container } = renderWithTheme(
      <VoiceWaveform audioData={data} bars={5} />
    );
    expect(container.querySelector(".vf-voice-waveform")).toBeInTheDocument();
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(5);
  });

  it("renders with aria-label", () => {
    renderWithTheme(<VoiceWaveform audioData={[0.5]} bars={1} />);
    expect(screen.getByLabelText("Voice waveform")).toBeInTheDocument();
  });
});
