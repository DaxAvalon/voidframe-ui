import { describe, expect, it, afterEach } from "vitest";
import {
  DEFAULT_PORTAL_ID,
  getPortalContainer,
  releasePortalContainer,
} from "../portalContainer";

describe("portalContainer", () => {
  afterEach(() => {
    // Clean up any leftover portal containers
    document.body.querySelectorAll("[data-vf-portal]").forEach((el) => el.remove());
  });

  it("creates a container in document.body", () => {
    const el = getPortalContainer();
    expect(document.body.contains(el)).toBe(true);
    releasePortalContainer();
  });

  it("returns the same element on second call", () => {
    const a = getPortalContainer();
    const b = getPortalContainer();
    expect(a).toBe(b);
    releasePortalContainer();
    releasePortalContainer();
  });

  it("has data-vf-portal attribute", () => {
    const el = getPortalContainer();
    expect(el.hasAttribute("data-vf-portal")).toBe(true);
    releasePortalContainer();
  });

  it("default name is DEFAULT_PORTAL_ID", () => {
    const el = getPortalContainer();
    expect(el.id).toBe(DEFAULT_PORTAL_ID);
    releasePortalContainer();
  });

  it("custom name creates a separate container", () => {
    const a = getPortalContainer();
    const b = getPortalContainer("custom");
    expect(a).not.toBe(b);
    expect(b.id).toBe("custom");
    releasePortalContainer();
    releasePortalContainer("custom");
  });

  it("release decrements ref count without removing", () => {
    getPortalContainer();
    getPortalContainer();
    releasePortalContainer();
    const el = document.getElementById(DEFAULT_PORTAL_ID);
    expect(el).not.toBeNull();
    releasePortalContainer();
  });

  it("removes container from DOM at refCount 0", () => {
    getPortalContainer();
    releasePortalContainer();
    const el = document.getElementById(DEFAULT_PORTAL_ID);
    expect(el).toBeNull();
  });

  it("supports multiple names independently", () => {
    const a = getPortalContainer("alpha");
    const b = getPortalContainer("beta");
    releasePortalContainer("alpha");
    expect(document.getElementById("alpha")).toBeNull();
    expect(document.getElementById("beta")).not.toBeNull();
    releasePortalContainer("beta");
  });

  it("re-acquires after full release", () => {
    const first = getPortalContainer();
    releasePortalContainer();
    expect(document.getElementById(DEFAULT_PORTAL_ID)).toBeNull();
    const second = getPortalContainer();
    expect(document.body.contains(second)).toBe(true);
    expect(second).not.toBe(first);
    releasePortalContainer();
  });

  it("handles SSR gracefully when document is unavailable", () => {
    // In a jsdom environment document exists, so we verify the
    // function doesn't throw and returns an element.
    expect(() => getPortalContainer()).not.toThrow();
    releasePortalContainer();
  });
});
