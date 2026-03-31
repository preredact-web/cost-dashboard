#!/usr/bin/env node
// Validates a budget dashboard applyUpdates() payload.
// Usage: node validate-payload.js <payload.json>
// Or:    node validate-payload.js '{"action":"update",...}'

const fs = require('fs');

const VALID_CATEGORIES = ['essentials', 'non-essential-fixed', 'usage'];
const VALID_ACTIONS = ['update', 'chat'];
const VALID_COL_TYPES = ['text', 'number'];

const arg = process.argv[2];
if (!arg) { console.error('Usage: node validate-payload.js <file.json | json-string>'); process.exit(1); }

let input;
try {
  input = fs.existsSync(arg) ? fs.readFileSync(arg, 'utf8') : arg;
} catch { input = arg; }

let data;
try { data = JSON.parse(input); } catch { console.error('FAIL: Invalid JSON'); process.exit(1); }

const errors = [];
const warn = msg => errors.push(msg);

if (data.action && !VALID_ACTIONS.includes(data.action)) warn(`Invalid action "${data.action}" — must be "update" or "chat"`);
if (data.cashOnHand !== undefined && data.cashOnHand !== null && typeof data.cashOnHand !== 'number') warn('cashOnHand must be a number or null');

(data.costUpdates || []).forEach((u, i) => {
  if (!u.id) warn(`costUpdates[${i}]: missing "id"`);
  if (u.newCost === undefined) warn(`costUpdates[${i}]: missing "newCost"`);
});

(data.addCosts || []).forEach((c, i) => {
  if (!c.name) warn(`addCosts[${i}]: missing "name"`);
  if (c.category && !VALID_CATEGORIES.includes(c.category)) warn(`addCosts[${i}]: invalid category "${c.category}"`);
});

(data.removeCosts || []).forEach((id, i) => { if (typeof id !== 'string') warn(`removeCosts[${i}]: must be a string ID`); });

(data.addCostColumns || []).forEach((col, i) => {
  if (!col.label) warn(`addCostColumns[${i}]: missing "label"`);
  if (col.type && !VALID_COL_TYPES.includes(col.type)) warn(`addCostColumns[${i}]: type must be "text" or "number"`);
});

(data.addRevColumns || []).forEach((col, i) => {
  if (!col.label) warn(`addRevColumns[${i}]: missing "label"`);
  if (col.type && !VALID_COL_TYPES.includes(col.type)) warn(`addRevColumns[${i}]: type must be "text" or "number"`);
});

(data.setCellValues || []).forEach((v, i) => {
  if (!v.rowId) warn(`setCellValues[${i}]: missing "rowId"`);
  if (!v.columnId) warn(`setCellValues[${i}]: missing "columnId"`);
  if (v.value === undefined) warn(`setCellValues[${i}]: missing "value"`);
});

(data.addRevenue || []).forEach((r, i) => {
  if (!r.scenario) warn(`addRevenue[${i}]: missing "scenario"`);
});

(data.revenueUpdates || []).forEach((u, i) => {
  if (!u.id) warn(`revenueUpdates[${i}]: missing "id"`);
});

if (errors.length) {
  console.error(`FAIL: ${errors.length} issue(s) found:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('PASS: Payload is valid');
  process.exit(0);
}
