# applyUpdates() Payload Schema

The `applyUpdates(data)` function accepts a JSON object. All fields are optional except `action`.

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `action` | `"update"` or `"chat"` | `"update"` applies changes; `"chat"` is conversation-only (no mutations) |
| `message` | string | Human-readable summary shown in chat (required for good UX) |
| `cashOnHand` | number \| null | Set the cash-on-hand value. `null` = no change |

## Cost Table Mutations

### `costUpdates` — change cost of existing rows
```json
"costUpdates": [
  { "id": "claude-max", "newCost": 900 },
  { "id": "firecrawl", "newCost": 150 }
]
```

### `addCosts` — add new cost rows
```json
"addCosts": [{
  "name": "Perplexity Pro",
  "cost": 20,
  "category": "non-essential-fixed",
  "nextPayment": "May 1, 2026"
}]
```
- `id` is auto-generated from `name` if omitted
- `category` must be: `essentials`, `non-essential-fixed`, or `usage`
- `nextPayment` can be a date string, `"Monthly"`, or `"Usage"`

### `removeCosts` — delete cost rows by ID
```json
"removeCosts": ["zep-cloud", "eleven-labs"]
```

### `dateUpdates` — change payment dates
```json
"dateUpdates": [
  { "id": "claude-max", "nextPayment": "May 15, 2026" }
]
```

### `setDropping` — toggle the "Dropping" badge
```json
"setDropping": [
  { "id": "mini-max", "dropping": true },
  { "id": "zep-cloud", "dropping": false }
]
```

### `renameItems` — rename cost or revenue rows
```json
"renameItems": [
  { "id": "claude-max", "newName": "Claude Max (x5)" }
]
```

## Revenue Table Mutations

### `revenueUpdates` — change loan amount
```json
"revenueUpdates": [
  { "id": "base-case", "loanAmount": 7500000 }
]
```

### `addRevenue` — add new deal scenarios
```json
"addRevenue": [{
  "scenario": "Mega Deal",
  "loanAmount": 200000000
}]
```
- `id` auto-generated from `scenario` if omitted
- Revenue formula: Gross Fee = loanAmount * 0.015, Your Share = Gross Fee * 0.5

### `removeRevenue` — delete revenue rows
```json
"removeRevenue": ["upside"]
```

## Column Mutations

### `addCostColumns` — add columns to the cost table
```json
"addCostColumns": [
  { "label": "Priority", "type": "text" },
  { "label": "Annual Cost", "type": "number" }
]
```
- `id` auto-generated from `label` if omitted
- `type`: `"text"` (left-aligned) or `"number"` (right-aligned, formatted as currency)

### `removeCostColumns` — remove custom columns from cost table
```json
"removeCostColumns": ["priority"]
```
Removes the column AND clears all cell values in that column.

### `addRevColumns` — add columns to revenue table
```json
"addRevColumns": [
  { "label": "Probability", "type": "text" },
  { "label": "Timeline", "type": "text" }
]
```

### `removeRevColumns` — remove custom columns from revenue table
```json
"removeRevColumns": ["probability"]
```

## Cell Value Mutations

### `setCellValues` — set values in custom columns
```json
"setCellValues": [
  { "rowId": "claude-max", "columnId": "priority", "value": "Critical" },
  { "rowId": "firecrawl", "columnId": "priority", "value": "High" },
  { "rowId": "conservative", "columnId": "probability", "value": "80%" }
]
```
- `rowId` is the cost or revenue item's `id`
- `columnId` is the custom column's `id`
- Works for both cost and revenue tables

## Complete Example — Complex Update

```json
{
  "action": "update",
  "message": "Reorganized: dropped Zep/ElevenLabs, added Perplexity, added Priority column, updated cash",
  "cashOnHand": 5000,
  "removeCosts": ["zep-cloud", "eleven-labs"],
  "addCosts": [{ "name": "Perplexity Pro", "cost": 20, "category": "non-essential-fixed", "nextPayment": "Monthly" }],
  "costUpdates": [{ "id": "claude-max", "newCost": 900 }],
  "setDropping": [{ "id": "mini-max", "dropping": false }],
  "addCostColumns": [{ "label": "Priority", "type": "text" }],
  "setCellValues": [
    { "rowId": "claude-max", "columnId": "priority", "value": "Critical" },
    { "rowId": "perplexity-pro", "columnId": "priority", "value": "Low" }
  ],
  "addRevenue": [{ "scenario": "Pipeline Deal", "loanAmount": 25000000 }]
}
```
