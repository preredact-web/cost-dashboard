---
name: budget-dashboard
description: |
  Dynamically update the PreRedact cost dashboard — add/remove rows and columns,
  update costs, modify cash on hand, toggle dropping status, rename items, and
  edit the HTML/CSS/JS source code. Use when: (1) modifying dashboard data via
  natural language, (2) adding custom columns or table structure, (3) generating
  applyUpdates() JSON payloads, (4) editing dashboard source code (styling, layout,
  features). Repo: github.com/preredact-web/cost-dashboard.
  Live: preredact-web.github.io/cost-dashboard/
---

# Budget Dashboard Skill

Single-file HTML financial dashboard at `index.html`. All state lives in a JS `state` object persisted to `localStorage`. Changes flow through `applyUpdates(data)` which accepts a structured JSON payload.

## Architecture

```
index.html (single file)
├── CSS variables (:root) — dark theme with --bg, --surface, --accent, --green, --red, --amber
├── HTML structure — cash banner, runway stats, cost table, revenue table, chat bar
├── JS state management — state object, localStorage persistence
├── applyUpdates(data) — the mutation API (see references/update-payload-schema.md)
└── AI chat → Supabase edge function → Anthropic API → applyUpdates()
```

## Decision Tree

**"Modify data"** (add row, change cost, remove service, update cash):
→ Generate an `applyUpdates()` payload. See [references/update-payload-schema.md](references/update-payload-schema.md)

**"Add/remove columns"** (add Notes column, add Priority column):
→ Use `addCostColumns` / `addRevColumns` in the payload. See [references/update-payload-schema.md](references/update-payload-schema.md)

**"Edit source code"** (change colors, add a chart, modify layout):
→ Edit `index.html` directly. The file is ~760 lines. Key sections:
- Lines 8–105: CSS (all styles in `<style>` block)
- Lines 107–151: HTML structure
- Lines 166–758: JavaScript

**"What's the current state?"**:
→ Read `state` object shape from [references/data-model.md](references/data-model.md)

## Quick Examples

### Add a new cost row
```json
{
  "action": "update",
  "message": "Added Perplexity Pro at $20/month",
  "addCosts": [{
    "name": "Perplexity Pro",
    "cost": 20,
    "category": "non-essential-fixed",
    "nextPayment": "May 1, 2026"
  }]
}
```

### Remove a service
```json
{
  "action": "update",
  "message": "Removed Zep Cloud",
  "removeCosts": ["zep-cloud"]
}
```

### Update cost and cash
```json
{
  "action": "update",
  "message": "Updated Claude Max to $900 and cash to $5,000",
  "cashOnHand": 5000,
  "costUpdates": [{ "id": "claude-max", "newCost": 900 }]
}
```

### Add a custom column with values
```json
{
  "action": "update",
  "message": "Added Priority column",
  "addCostColumns": [{ "label": "Priority", "type": "text" }],
  "setCellValues": [
    { "rowId": "claude-max", "columnId": "priority", "value": "Critical" },
    { "rowId": "firecrawl", "columnId": "priority", "value": "High" }
  ]
}
```

### Add a revenue scenario
```json
{
  "action": "update",
  "message": "Added stretch goal scenario",
  "addRevenue": [{ "scenario": "Stretch Goal", "loanAmount": 50000000 }]
}
```

## Category Keys

Cost rows must use one of these `category` values:
- `essentials` — core tools you can't drop
- `non-essential-fixed` — fixed monthly, could be dropped
- `usage` — variable/usage-based costs

## ID Generation

IDs are auto-generated from names via `makeId()`:
```
"Perplexity Pro" → "perplexity-pro"
"ChatGPT Pro (x1) - OpenClaw" → "chatgpt-pro-x1-openclaw"
```
Rule: lowercase, replace non-alphanumeric with `-`, trim leading/trailing `-`.

When referencing existing items, use their exact `id` from the data model.

## Editing Source Code

The dashboard is a single `index.html` with everything inline. Key patterns:

**CSS customization**: All in `:root` variables (line 9-13). Change `--accent`, `--green`, etc.

**Adding new sections**: Follow the pattern of existing section headers:
```html
<div class="section-header"><h2>Title</h2><div class="line"></div><div class="total">$0</div></div>
```

**Table rendering**: `renderDashboard()` (line 280) rebuilds both tables from `state`. Any structural changes to tables should modify this function.

**Chat/AI integration**: `sendPrompt()` (line 677) sends state + messages to a Supabase edge function. The edge function returns an `applyUpdates()` payload.

## Validation

Run the validation script to check a payload before applying:
```bash
echo '{"action":"update","addCosts":[{"name":"Test","cost":50}]}' | node scripts/validate-payload.js
```

## References

- **[Update payload schema](references/update-payload-schema.md)** — every field `applyUpdates()` accepts, with examples
- **[Data model](references/data-model.md)** — state shape, default data, column types
