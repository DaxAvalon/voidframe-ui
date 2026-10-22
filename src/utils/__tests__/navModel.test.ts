import { describe, expect, it } from "vitest";
import { createNavModel, type NavNode } from "../navModel";

type Ctx = { role: "admin" | "viewer" };
const tree: NavNode<Ctx>[] = [
  { label: "Home", href: "/", match: "exact" },
  {
    label: "Projects",
    href: "/projects",
    children: [
      { label: "Active", href: "/projects/active" },
      { label: "Archived", href: "/projects/archived", visible: (c) => c.role === "admin" },
    ],
  },
  { label: "Admin", href: "/admin", visible: (c) => c.role === "admin", children: [{ label: "Users", href: "/admin/users" }] },
  { label: "Help", href: "/help", visible: false },
];

describe("createNavModel", () => {
  it("flattens visible nodes with depth, marks the deepest match and its ancestors", () => {
    const m = createNavModel(tree, "/projects/active/42", { ctx: { role: "viewer" } });
    expect(m.items.map((i) => `${i.depth}:${String(i.node.label)}`)).toEqual(["0:Home", "0:Projects", "1:Active"]);
    expect(m.match?.node.label).toBe("Active");
    expect(m.items.find((i) => i.node.label === "Projects")?.ancestorOfActive).toBe(true);
    expect(m.breadcrumbs.map((b) => b.node.label)).toEqual(["Projects", "Active"]);
    expect(m.fallback).toBeNull();
  });

  it("exact match does not claim children; '/' never prefix-matches everything", () => {
    const m = createNavModel(tree, "/anything", { ctx: { role: "admin" } });
    expect(m.match).toBeNull();
    const home = createNavModel(tree, "/", { ctx: { role: "admin" } });
    expect(home.match?.node.label).toBe("Home");
  });

  it("predicates see the context; hidden subtrees are dropped", () => {
    const admin = createNavModel(tree, "/admin/users", { ctx: { role: "admin" } });
    expect(admin.items.map((i) => i.node.label)).toEqual(["Home", "Projects", "Active", "Archived", "Admin", "Users"]);
    expect(admin.match?.node.label).toBe("Users");
    expect(admin.breadcrumbs.map((b) => b.node.label)).toEqual(["Admin", "Users"]);
  });

  it("when the current item is hidden, the visible prefix ancestor is the match and fallback names it", () => {
    const m = createNavModel(tree, "/projects/archived", { ctx: { role: "viewer" } });
    expect(m.match?.node.label).toBe("Projects");
    expect(m.breadcrumbs.map((b) => b.node.label)).toEqual(["Projects"]);
    expect(m.fallback?.node.label).toBe("Projects");
    // Whole subtree hidden: nothing matches, fallback is the first visible route.
    const noAncestor = createNavModel(tree, "/admin/users", { ctx: { role: "viewer" } });
    expect(noAncestor.match).toBeNull();
    expect(noAncestor.fallback?.node.label).toBe("Home");
    // Unknown route: no match, first visible route as fallback.
    expect(createNavModel(tree, "/nowhere", { ctx: { role: "admin" } }).fallback?.node.label).toBe("Home");
  });

  it("ids default to href, then label, and honour an explicit id", () => {
    const m = createNavModel([{ id: "x", label: "X" }, { label: "Y" }, { label: "Z", href: "/z" }], "/z");
    expect(m.items.map((i) => i.id)).toEqual(["x", "/Y", "/z"]);
  });
});
