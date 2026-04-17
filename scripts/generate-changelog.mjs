#!/usr/bin/env node

// Generate a changelog from git tags and commits.
//
// Usage:
//   node scripts/generate-changelog.mjs           # stdout
//   node scripts/generate-changelog.mjs --write   # overwrite CHANGELOG.md
//
// Groups commits between version tags (v*) into sections. Commits
// starting with conventional-commit prefixes (feat:, fix:, docs:, etc.)
// are categorised; everything else goes under "Other".

import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

const CATEGORIES = [
  { prefix: "feat", heading: "Features" },
  { prefix: "fix", heading: "Bug Fixes" },
  { prefix: "perf", heading: "Performance" },
  { prefix: "docs", heading: "Documentation" },
  { prefix: "refactor", heading: "Refactoring" },
  { prefix: "test", heading: "Tests" },
  { prefix: "chore", heading: "Chores" },
  { prefix: "ci", heading: "CI/CD" },
  { prefix: "style", heading: "Style" },
];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function getTags() {
  try {
    const raw = git("tag", "-l", "v*", "--sort=-version:refname");
    return raw ? raw.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getCommitsBetween(from, to) {
  const range = from ? `${from}..${to}` : to;
  const raw = git("log", range, "--pretty=format:%s", "--no-merges");
  return raw ? raw.split("\n").filter(Boolean) : [];
}

function getTagDate(tag) {
  return git("log", "-1", "--format=%ai", tag).slice(0, 10);
}

function categorise(messages) {
  const groups = {};
  for (const cat of CATEGORIES) groups[cat.heading] = [];
  groups["Other"] = [];

  for (const msg of messages) {
    let placed = false;
    for (const cat of CATEGORIES) {
      if (msg.startsWith(`${cat.prefix}:`) || msg.startsWith(`${cat.prefix}(`)) {
        groups[cat.heading].push(msg);
        placed = true;
        break;
      }
    }
    if (!placed) groups["Other"].push(msg);
  }
  return groups;
}

function renderSection(title, date, messages) {
  const groups = categorise(messages);
  let out = `## ${title}${date ? ` (${date})` : ""}\n\n`;
  let hasContent = false;
  for (const [heading, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    hasContent = true;
    out += `### ${heading}\n\n`;
    for (const item of items) {
      out += `- ${item}\n`;
    }
    out += "\n";
  }
  if (!hasContent) out += "_No notable changes._\n\n";
  return out;
}

// ── Main ──────────────────────────────────────────────────────

const tags = getTags();
let changelog = "# Changelog\n\nAll notable changes to Voidframe will be recorded here.\n\n";

// Unreleased (HEAD..latest tag or all commits if no tags)
const latestTag = tags[0];
const unreleasedCommits = latestTag
  ? getCommitsBetween(latestTag, "HEAD")
  : getCommitsBetween(null, "HEAD");

if (unreleasedCommits.length > 0) {
  changelog += renderSection("[Unreleased]", null, unreleasedCommits);
}

// Tagged releases
for (let i = 0; i < tags.length; i++) {
  const tag = tags[i];
  const prev = tags[i + 1] ?? null;
  const date = getTagDate(tag);
  const commits = getCommitsBetween(prev, tag);
  changelog += renderSection(tag, date, commits);
}

if (process.argv.includes("--write")) {
  const dest = resolve(process.cwd(), "CHANGELOG.md");
  writeFileSync(dest, changelog, "utf8");
  console.log(`Wrote ${dest}`);
} else {
  process.stdout.write(changelog);
}
