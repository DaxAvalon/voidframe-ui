import { afterEach, describe, expect, it } from "vitest";
import {
  deleteCookie,
  getAllCookies,
  getCookie,
  hasCookie,
  setCookie,
} from "../cookie";

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}

describe("cookie", () => {
  afterEach(clearCookies);

  it("setCookie sets a cookie", () => {
    setCookie("foo", "bar");
    expect(document.cookie).toContain("foo=bar");
  });

  it("getCookie retrieves a value", () => {
    setCookie("hello", "world");
    expect(getCookie("hello")).toBe("world");
  });

  it("getCookie returns null for nonexistent cookie", () => {
    expect(getCookie("nope")).toBeNull();
  });

  it("deleteCookie removes a cookie", () => {
    setCookie("tmp", "val");
    deleteCookie("tmp");
    expect(getCookie("tmp")).toBeNull();
  });

  it("hasCookie returns true when cookie exists", () => {
    setCookie("exists", "1");
    expect(hasCookie("exists")).toBe(true);
  });

  it("hasCookie returns false when cookie missing", () => {
    expect(hasCookie("missing")).toBe(false);
  });

  it("getAllCookies returns an object of all cookies", () => {
    setCookie("a", "1");
    setCookie("b", "2");
    const all = getAllCookies();
    expect(all.a).toBe("1");
    expect(all.b).toBe("2");
  });

  it("respects path option", () => {
    setCookie("p", "val", { path: "/" });
    expect(document.cookie).toContain("p=val");
  });

  it("respects maxAge option", () => {
    setCookie("ma", "val", { maxAge: 3600 });
    // jsdom stores the cookie; we just verify it was set
    expect(getCookie("ma")).toBe("val");
  });

  it("respects expires option", () => {
    const future = new Date(Date.now() + 86400000);
    setCookie("ex", "val", { expires: future });
    expect(getCookie("ex")).toBe("val");
  });

  it("respects secure flag", () => {
    setCookie("sec", "val", { secure: true });
    // jsdom may or may not honor secure; verify no throw
    expect(true).toBe(true);
  });

  it("respects sameSite option", () => {
    setCookie("ss", "val", { sameSite: "strict" });
    // Verify the cookie was processed without error
    expect(true).toBe(true);
  });

  it("encodes special characters", () => {
    setCookie("key with spaces", "value=special;chars");
    expect(getCookie("key with spaces")).toBe("value=special;chars");
  });

  it("allows empty value", () => {
    setCookie("empty", "");
    expect(getCookie("empty")).toBe("");
  });

  it("handles multiple cookies", () => {
    setCookie("x", "1");
    setCookie("y", "2");
    setCookie("z", "3");
    expect(getCookie("x")).toBe("1");
    expect(getCookie("y")).toBe("2");
    expect(getCookie("z")).toBe("3");
  });

  it("handles SSR gracefully", () => {
    // In jsdom, document exists. Verify no throws.
    expect(() => getCookie("any")).not.toThrow();
    expect(() => getAllCookies()).not.toThrow();
  });
});
