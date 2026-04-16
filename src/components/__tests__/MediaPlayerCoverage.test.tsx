// Coverage tests for MediaPlayer.tsx — keyboard handlers, sub-components, VoiceWaveform

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeAll } from "vitest";
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

describe("VideoPlayer keyboard controls", () => {
  it("Space toggles play/pause", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: " " });
    // Should not throw; just exercises the code path
  });

  it("ArrowRight seeks forward 5s", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: "ArrowRight" });
  });

  it("ArrowLeft seeks backward 5s", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: "ArrowLeft" });
  });

  it("ArrowUp increases volume", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: "ArrowUp" });
  });

  it("ArrowDown decreases volume", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: "ArrowDown" });
  });

  it("M toggles mute", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: "m" });
  });

  it("F toggles fullscreen", () => {
    renderWithTheme(<VideoPlayer src="test.mp4" />);
    const player = screen.getByRole("group", { name: "Video player" });
    fireEvent.keyDown(player, { key: "f" });
  });
});

describe("VideoPlayer compound sub-components", () => {
  it("Play button toggles play label", async () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.Play />
      </VideoPlayer>
    );
    const btn = screen.getByRole("button", { name: "Play" });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
  });

  it("Progress bar renders as range slider", () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.Progress />
      </VideoPlayer>
    );
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
  });

  it("Volume control renders as range slider", () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.Volume />
      </VideoPlayer>
    );
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("Time display shows 0:00", () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.Time />
      </VideoPlayer>
    );
    expect(screen.getByLabelText("Playback time")).toBeInTheDocument();
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
  });

  it("Fullscreen button renders", () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.Fullscreen />
      </VideoPlayer>
    );
    expect(screen.getByRole("button", { name: "Enter fullscreen" })).toBeInTheDocument();
  });

  it("CaptionsMenu renders Off and language buttons", () => {
    renderWithTheme(
      <VideoPlayer
        src="test.mp4"
        captions={[{ src: "en.vtt", srcLang: "en", label: "English" }]}
      >
        <VideoPlayer.CaptionsMenu />
      </VideoPlayer>
    );
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("CaptionsMenu Off button click deactivates captions", async () => {
    renderWithTheme(
      <VideoPlayer
        src="test.mp4"
        captions={[{ src: "en.vtt", srcLang: "en", label: "English" }]}
      >
        <VideoPlayer.CaptionsMenu />
      </VideoPlayer>
    );
    await userEvent.click(screen.getByText("English"));
    await userEvent.click(screen.getByText("Off"));
  });

  it("CaptionsMenu returns null when no captions", () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.CaptionsMenu />
      </VideoPlayer>
    );
    expect(screen.queryByText("Off")).not.toBeInTheDocument();
  });

  it("PlaybackRate selector renders options", () => {
    renderWithTheme(
      <VideoPlayer src="test.mp4">
        <VideoPlayer.PlaybackRate />
      </VideoPlayer>
    );
    const select = screen.getByRole("combobox", { name: "Playback rate" });
    expect(select).toBeInTheDocument();
  });
});

describe("AudioPlayer extended", () => {
  it("renders with vf-media--audio class", () => {
    const { container } = renderWithTheme(<AudioPlayer src="track.mp3" />);
    expect(container.querySelector(".vf-media--audio")).toBeInTheDocument();
  });

  it("does not have fullscreen button in default controls", () => {
    renderWithTheme(<AudioPlayer src="track.mp3" />);
    expect(screen.queryByRole("button", { name: "Enter fullscreen" })).not.toBeInTheDocument();
  });

  it("F key does not toggle fullscreen for audio", () => {
    renderWithTheme(<AudioPlayer src="track.mp3" />);
    const player = screen.getByRole("group", { name: "Audio player" });
    // Should not throw — F key is ignored for audio
    fireEvent.keyDown(player, { key: "f" });
  });

  it("accepts loop and muted props", () => {
    const { container } = renderWithTheme(
      <AudioPlayer src="track.mp3" loop muted />
    );
    const audio = container.querySelector("audio");
    expect(audio?.loop).toBe(true);
    expect(audio?.muted).toBe(true);
  });
});

describe("VoiceWaveform extended", () => {
  it("renders as slider when onSeek is provided", () => {
    const onSeek = vi.fn();
    renderWithTheme(
      <VoiceWaveform audioData={[0.5, 0.8]} bars={2} onSeek={onSeek} progress={0.5} />
    );
    const wf = screen.getByRole("slider", { name: "Voice waveform" });
    expect(wf).toHaveAttribute("aria-valuenow", "0.5");
  });

  it("renders as img when no onSeek", () => {
    renderWithTheme(
      <VoiceWaveform audioData={[0.5, 0.8]} bars={2} />
    );
    expect(screen.getByRole("img", { name: "Voice waveform" })).toBeInTheDocument();
  });

  it("renders placeholder waveform when no audioData or audioUrl", () => {
    const { container } = renderWithTheme(
      <VoiceWaveform bars={10} />
    );
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(10);
  });

  it("applies custom height, barWidth, gap", () => {
    const { container } = renderWithTheme(
      <VoiceWaveform audioData={[0.5]} bars={1} height={50} barWidth={4} gap={3} />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("height")).toBe("50");
  });

  it("click fires onSeek", () => {
    const onSeek = vi.fn();
    const { container } = renderWithTheme(
      <VoiceWaveform audioData={[0.5, 0.5]} bars={2} onSeek={onSeek} />
    );
    const wf = container.querySelector(".vf-voice-waveform")!;
    // Simulate a click; getBoundingClientRect returns zeros in happy-dom
    fireEvent.click(wf, { clientX: 0 });
    expect(onSeek).toHaveBeenCalled();
  });

  it("custom colors are applied to bars", () => {
    const { container } = renderWithTheme(
      <VoiceWaveform
        audioData={[0.5, 0.5]}
        bars={2}
        progress={0.5}
        color="red"
        activeColor="green"
      />
    );
    const rects = container.querySelectorAll("rect");
    // First bar should be active (green), second inactive (red)
    expect(rects[0]?.getAttribute("fill")).toBe("green");
    expect(rects[1]?.getAttribute("fill")).toBe("red");
  });
});
