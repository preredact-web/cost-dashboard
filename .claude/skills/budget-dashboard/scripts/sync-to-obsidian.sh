#!/bin/bash
# Sync cost dashboard state to Obsidian vault
# Reads DEFAULT_COSTS from index.html and writes a markdown table to the vault note.
# Usage: bash sync-to-obsidian.sh [path-to-index.html]

VAULT="/Users/vinnycherido/Documents/Obsidian Vault"
NOTE="$VAULT/Ops/AI Spending Log.md"
REPO="${1:-/tmp/cost-dashboard/index.html}"
DATE=$(date '+%Y-%m-%d')
TIME=$(date '+%H:%M')

if [ ! -f "$REPO" ]; then
  echo "Error: index.html not found at $REPO"
  echo "Usage: bash sync-to-obsidian.sh /path/to/index.html"
  exit 1
fi

# Extract cost data from DEFAULT_COSTS in index.html
# This reads the hardcoded defaults — localStorage state requires browser access
echo "---
tags: [finance, spending, dashboard]
created: 2026-03-30
updated: $DATE
---

# AI Spending Log

Live dashboard: [cost-dashboard](https://preredact-web.github.io/cost-dashboard/)
Last synced: $DATE $TIME

## Current Services (from source code defaults)

| Service | Cost | Category | Status |
|---------|------|----------|--------|" > "$NOTE.tmp"

# Parse DEFAULT_COSTS array from index.html
grep -A1 "name:" "$REPO" | while IFS= read -r line; do
  :  # placeholder — the awk approach below is more reliable
done

# Use awk to extract structured data
awk '
/var DEFAULT_COSTS/,/\];/ {
  if (match($0, /name: '\''([^'\'']+)'\''/, n) && match($0, /cost: ([0-9.]+)/, c) && match($0, /category: '\''([^'\'']+)'\''/, cat)) {
    drop = "Active"
    if (match($0, /dropping: true/)) drop = "Dropping"
    printf "| %s | $%.2f | %s | %s |\n", n[1], c[1], cat[1], drop
  }
}' "$REPO" >> "$NOTE.tmp"

# Calculate total
TOTAL=$(awk '
/var DEFAULT_COSTS/,/\];/ {
  if (match($0, /cost: ([0-9.]+)/, c)) total += c[1]
}
END { printf "%.2f", total }' "$REPO")

echo "
**Total: \$$TOTAL/month**
" >> "$NOTE.tmp"

# Preserve the Change Log section from the existing note if it exists
if [ -f "$NOTE" ]; then
  sed -n '/^## Change Log/,$p' "$NOTE" >> "$NOTE.tmp"
fi

mv "$NOTE.tmp" "$NOTE"
echo "Synced to: $NOTE"
