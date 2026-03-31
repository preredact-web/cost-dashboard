# Data Model

## State Shape

```js
state = {
  cashOnHand: 1300,                // number — displayed in cash banner
  costs: [ /* CostItem[] */ ],     // all cost rows across categories
  revenue: [ /* RevenueItem[] */ ],// all revenue deal scenarios
  customCostColumns: [],           // user-added columns for cost table
  customRevColumns: [],            // user-added columns for revenue table
}
```

## CostItem

```js
{
  id: "claude-max",                    // unique kebab-case identifier
  name: "Claude Max (x3)",             // display name
  cost: 600,                           // monthly cost (number)
  category: "essentials",              // one of: essentials | non-essential-fixed | usage
  nextPayment: "Apr 26, 2026",         // date string, "Monthly", or "Usage"
  dropping: false,                     // shows amber "Dropping" badge if true
  custom: { "priority": "Critical" }   // optional — values for custom columns
}
```

## RevenueItem

```js
{
  id: "base-case",                     // unique kebab-case identifier
  scenario: "Base Case",               // display name
  loanAmount: 5000000,                 // loan amount (number)
  custom: { "probability": "60%" }     // optional — values for custom columns
}
```
Revenue calculations are automatic: `grossFee = loanAmount * 0.015`, `yourShare = grossFee * 0.5`.

## CustomColumn

```js
{
  id: "priority",      // auto-generated from label via makeId()
  label: "Priority",   // column header text
  type: "text"         // "text" (left-aligned) or "number" (right-aligned, currency-formatted)
}
```

## Default Cost IDs

| ID | Name | Category | Cost |
|----|------|----------|------|
| `claude-max` | Claude Max (x3) | essentials | $600 |
| `firecrawl` | Firecrawl | essentials | $100 |
| `whisper-flow` | Whisper Flow | essentials | $90 |
| `browser` | Browser | essentials | $75 |
| `chatgpt-openclaw` | ChatGPT Pro (x1) - OpenClaw | non-essential-fixed | $200 |
| `chatgpt-firehorse` | ChatGPT Pro (x1) - Firehorse | non-essential-fixed | $200 |
| `mini-max` | Mini Max | non-essential-fixed | $200 |
| `zep-cloud` | Zep Cloud | non-essential-fixed | $130 |
| `eleven-labs` | Eleven Labs | non-essential-fixed | $99 |
| `supabase` | Supabase | non-essential-fixed | $75 |
| `hume-ai` | Hume AI | non-essential-fixed | $75 |
| `twilit` | Twilit | non-essential-fixed | $50 |
| `manus` | Manus | non-essential-fixed | $45 |
| `gemini` | Gemini | non-essential-fixed | $40 |
| `openclaw-usage` | OpenClaw (per-use) | usage | $1,167.38 |
| `api-tokens` | Extra usage (API tokens) | usage | $578.86 |
| `vast-ai` | Vast AI (GPU) | usage | $500 |

## Default Revenue IDs

| ID | Scenario | Loan Amount |
|----|----------|-------------|
| `conservative` | Conservative | $4,500,000 |
| `base-case` | Base Case | $5,000,000 |
| `target` | Target | $17,000,000 |
| `upside` | Upside | $100,000,000 |

## Category Rendering Order

1. `essentials` — blue header, labeled "Essentials"
2. `non-essential-fixed` — purple header, labeled "Non-Essentials — Fixed"
3. `usage` — amber header, labeled "Non-Essentials — Usage-Based"

## Runway Calculations (automatic)

- **April Projected Costs** = sum of all `costs[].cost`
- **Funding Gap** = `cashOnHand - totalCosts`
- **Need to Raise** = `max(0, totalCosts - cashOnHand)`

## Persistence

State is saved to `localStorage` key `dash_state` on every render.
Conversations saved to `dash_conversations` and `dash_current_conv`.
Reset button clears all localStorage and reverts to `DEFAULT_COSTS` / `DEFAULT_REVENUE`.
