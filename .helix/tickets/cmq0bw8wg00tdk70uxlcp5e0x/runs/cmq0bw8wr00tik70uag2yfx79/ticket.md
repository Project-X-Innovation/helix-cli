# Ticket Context

- ticket_id: cmq0bw8wg00tdk70uxlcp5e0x
- short_id: BLD-677
- run_id: cmq0bw8wr00tik70uag2yfx79
- run_branch: helix/build/BLD-677-playbook-check-trigger-endpoint-result-ingestion
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook check — trigger endpoint, result ingestion, and CLI

## Description
# Ticket: Playbook check — trigger endpoint, result ingestion, and CLI

## Summary
Wire the Playbook check to the API: POST /playbook/rules/:ruleId/check kicks off a PLAYBOOK_CHECK run for that rule, the run's CheckResult artifact is ingested into a new PlaybookRuleCheck row on completion, and status/result endpoints expose it. Add `hlx playbook check` for headless triggering and polling. NetSuite-only, enforced server-side.

## Why
The PLAYBOOK_CHECK mode produces the CheckResult artifact inside a run; this ticket connects rules to runs and persists results so the UI can display them and history is retained.

## Decisions Already Made
- A check is asynchronous: the endpoint starts a run and returns immediately with a check reference; the client polls. Do not hold the request open for the run duration.
- Each check creates one PlaybookRuleCheck row, linked to the rule and the run that produced it. On completion the row is populated from the CheckResult artifact; PlaybookRule.latestCheckId points to it.
- The check is NetSuite-only; GENERAL orgs are rejected server-side.
- Examples are stored as JSON columns on PlaybookRuleCheck (compliantExamples, violatingExamples). No separate example table.

## Do Not Re-Decide
- Do not change the CheckResult schema; ingest it verbatim.
- Do not add prompt fragments or modify agent behavior.
- Do not build the results UI.
- Do not make the check synchronous.

## Non-Negotiable Invariants
- POST /playbook/rules/:ruleId/check must verify org.platform === 'NETSUITE' before starting a run. For a GENERAL org it must return a check record with status ERROR and the GENERAL-org message, and must not start a run.
- One check must start exactly one run for exactly one rule. Do not reuse another rule's run or batch rules.
- On run completion, the PlaybookRuleCheck row must be populated from the run's CheckResult artifact. The mapping must be field-for-field; do not recompute status or counts.
- If the run fails or emits no valid artifact, the check row status must be ERROR with the failure reason. Do not leave it in a non-terminal state.
- PlaybookRule.latestCheckId must be updated to the newest check only after that check reaches a terminal state.

## In Scope
- Server: POST /playbook/rules/:ruleId/check (start), GET /playbook/rules/:ruleId/checks/:checkId (status + result), GET /playbook/rules/:ruleId/checks (history, newest first). Run kickoff using the existing run-creation path with mode PLAYBOOK_CHECK and the org's repos. A completion hook/poller that reads the CheckResult artifact and writes PlaybookRuleCheck. Platform guard.
- Persistence: write PlaybookRuleCheck (table created in the foundation migration) — status, interpretation, queries, counts, complianceRate, compliantExamples, violatingExamples, error, runId, checkedAt.
- CLI (`helix-cli`): `hlx playbook check <rule-ref>` to trigger a check and poll to completion, printing the result; `hlx playbook checks <rule-ref>` to list history.

## Out of Scope
- Agent prompts / fragments / CheckResult schema.
- Client check UI and flair.
- Any monitoring or scheduling of checks.

## Required Behavior
- Triggering a check on a NetSuite-org rule starts a PLAYBOOK_CHECK run and creates a check row in a running state; on completion the row holds the full result and latestCheckId is updated.
- Polling the check endpoint returns the current state, then the terminal result.

## Failure Behavior
- GENERAL org: return ERROR check, do not start a run.
- Run failure / missing artifact: terminal ERROR check with reason; latestCheckId still advances to this terminal check.
- ns-gm / NetSuite errors surface as the CheckResult ERROR from the run; ingest as-is.
- Fail closed: never mark a check PASS/FAIL without a valid artifact.

## Batch / Cardinality Rules
- One check = one run = one rule. GET checks history returns all checks for that one rule, newest first. Do not merge checks across rules.

## Persistence / Artifact Rules
- The run's CheckResult artifact is the source of truth for a completed check. PlaybookRuleCheck is a verbatim projection of it plus runId/checkedAt. Do not recompute fields.

## Acceptance Criteria
- A check on a NetSuite-org rule starts a run, persists a terminal PlaybookRuleCheck, and updates latestCheckId.
- A check on a GENERAL-org rule returns ERROR and starts no run.
- The CLI can trigger and poll a check headlessly and print interpretation + counts + examples.
- A failed run yields a terminal ERROR check, never a stuck or fabricated result.
- Negative: must not start more than one run per check; must not recompute status/counts; must not run for GENERAL orgs; must not block the request for the run duration.

## Attachments
- (none)
