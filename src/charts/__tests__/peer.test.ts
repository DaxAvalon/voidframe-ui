import { describe, expect, it } from "vitest";
import { loadPeer, MissingPeerDependencyError } from "../peer";

describe("loadPeer", () => {
  it("returns the loaded module on success", async () => {
    const result = await loadPeer("anything", "<test>", async () => ({
      default: "ok",
    }));
    expect(result).toEqual({ default: "ok" });
  });

  it("wraps loader rejections in a MissingPeerDependencyError with a clear message", async () => {
    let caught: unknown;
    try {
      await loadPeer("d3-force", "<NetworkGraph>", async () => {
        throw new Error("Cannot find module 'd3-force'");
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(MissingPeerDependencyError);
    expect((caught as MissingPeerDependencyError).message).toContain(
      "d3-force"
    );
    expect((caught as MissingPeerDependencyError).message).toContain(
      "<NetworkGraph>"
    );
    expect((caught as MissingPeerDependencyError).message).toContain(
      "npm install d3-force"
    );
  });
});
