# Ticket Context

- ticket_id: cmq0bwcp400tkk70uuqu7a3qm
- short_id: BLD-678
- run_id: cmq0bwcpe00tpk70u1c9wcjd3
- run_branch: helix/build/BLD-678-playbook-check-results-ui
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook check results UI

## Description
# Ticket: Playbook check results UI

## Summary
Wire the rule detail page Check button to the async check, show a "checking…" state while the run is in progress, and render the persisted result: a pass/fail status band, a collapsible "How Helix read this rule" interpretation (with queries), and compliant/violating example tables. Disable the Check action for GENERAL orgs.

## Why
The endpoint and ingestion persist check results; this ticket gives users the full loop in the browser: write a rule, check it, watch, and see where it holds or breaks.

## Decisions Already Made
- The check is asynchronous; the UI triggers it, then polls the check endpoint until terminal.
- Results display has three parts: (1) the rule echoed, (2) collapsible interpretation + queries (collapsed by default), (3) evidence: status band + counts + example tables.
- Violating examples are expanded by default; compliant examples collapsed by default.
- For GENERAL orgs the Check button is disabled with a tooltip; all other rule features remain functional.

## Do Not Re-Decide
- Do not change server endpoints or the result shape.
- Do not implement design-language flair here (separate ticket) beyond functional, accessible default styling.
- Do not add a live org-wide "rules being checked" ticker (future).

## Non-Negotiable Invariants
- The Check action must call POST .../check, then poll GET .../checks/:checkId until a terminal status (PASS|FAIL|ERROR). It must show a loading state for the entire run duration.
- The example tables must render exactly the fields present in the result examples; columns are dynamic per check. Do not hardcode a column set.
- For status=ERROR the UI must show the error message and a Re-check action, and must not show an evidence table.
- For a GENERAL org the Check button must be disabled with an explanatory tooltip and must issue no request.

## In Scope
- Client only: wire the start-check mutation + a polling hook for check status/result; "checking…" state with an optional "view progress" link to the run; result rendering (status band PASS/FAIL/ERROR, compliance count/rate, collapsible interpretation + queries, violating table expanded, compliant table collapsed); Re-check; GENERAL-org disabled state. Latest terminal check is shown when revisiting a rule.

## Out of Scope
- Server, CLI, schema.
- Flair / design language.
- Org-wide monitoring ticker.

## Required Behavior
- Clicking Check on a NetSuite-org rule starts the check, shows "checking…", and on completion renders the result. Re-check repeats it.
- The latest result is shown when revisiting a rule that has a terminal check.

## Failure Behavior
- ERROR result: show the message + Re-check, no evidence table.
- Polling/network failure: show a retry affordance; do not silently spin forever.
- GENERAL org: disabled Check + tooltip; no request issued.

## Batch / Cardinality Rules
- The detail page checks exactly one rule. It displays that rule's latest check; a history view, if shown, lists only that rule's checks.

## Persistence / Artifact Rules
- The UI is read-only over server state; it persists nothing beyond triggering checks.

## Acceptance Criteria
- Full loop works in the browser on a NetSuite org: write rule -> check -> checking… -> evidence with examples.
- Interpretation is collapsed by default; violating examples expanded; compliant collapsed.
- ERROR shows message + Re-check, no evidence table.
- GENERAL org: Check disabled with tooltip, no request.
- Negative: must not hardcode example columns; must not poll forever on failure; must not issue a check request for GENERAL orgs.

## Attachments
- (none)
