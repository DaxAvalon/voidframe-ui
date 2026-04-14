#!/usr/bin/env bash
# Enable Voidframe's git hooks in this clone.
# Idempotent — safe to run repeatedly.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ Not inside a git repository."
  exit 1
fi

cd "$REPO_ROOT"

git config core.hooksPath .githooks

# Ensure all hook files are executable (git requires it).
find .githooks -maxdepth 1 -type f -exec chmod +x {} +

echo "✅ Git hooks installed."
echo "   core.hooksPath → .githooks"
echo "   Pre-push will run tests in Docker before every push."
echo "   Override for emergencies with: VF_SKIP_HOOKS=1 git push"
