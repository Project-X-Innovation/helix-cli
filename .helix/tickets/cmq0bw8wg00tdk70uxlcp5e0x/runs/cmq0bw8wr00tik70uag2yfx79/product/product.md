# Product: Playbook Check — Trigger, Ingestion, and CLI

## Problem Statement

The Playbook feature has CRUD for rules and the `PLAYBOOK_CHECK` run mode registered in the orchestrator, but no way to actually **run a check** against a rule, **persist the result**, or **access it headlessly**. Users cannot trigger compliance checks, view results, or retain check history. The gap blocks the UI from displaying check outcomes and prevents automation workflows from using playbook checks.

## Product Vision

Enable users to trigger an asynchronous compliance check against any active playbook rule, have the result automatically persisted when the run completes, and expose the status and history through both API and CLI. This connects the existing rule definitions to the existing run infrastructure, closing the loop so check results are durable, queryable, and ready for the forthcoming UI.

## Users

| User | Context |
|------|---------|
| NetSuite org administrators | Trigger checks on playbook rules to evaluate compliance of their NetSuite environment against defined standards. |
| DevOps / automation engineers | Use `hlx playbook check` in CI or scripts for headless compliance verification and reporting. |
| Helix platform (internal) | The server itself ingests run artifacts and updates the check record — acting as an automated consumer of run output. |

## Use Cases

1. **Trigger a check** — A user requests a compliance check for a specific playbook rule. The system starts an asynchronous run and immediately returns a check reference so the user is not blocked.
2. **Poll for results** — The user (or CLI) repeatedly queries the check status until it reaches a terminal state, then reads the full result.
3. **View check history** — A user reviews past check results for a rule to track compliance trends over time.
4. **Reject non-NetSuite orgs** — When a user on a GENERAL-platform org attempts a check, the system returns an ERROR check record without starting a run.
5. **Handle run failures gracefully** — When a run fails or produces no valid artifact, the check reaches a terminal ERROR state with the failure reason rather than remaining stuck.

## Core Workflow

1. User calls `POST /playbook/rules/:ruleId/check` (or `hlx playbook check <rule-ref>`).
2. Server verifies the org is NetSuite-platform. If not, returns an ERROR check record immediately.
3. Server creates a `PlaybookRuleCheck` row in RUNNING state, creates a Ticket + SandboxRun pair with mode `PLAYBOOK_CHECK`, starts the run, and returns 202 with the check reference.
4. The orchestrator executes the run. On completion (success or failure), a post-run hook reads the `CheckResult` artifact from blob storage.
5. The hook populates `PlaybookRuleCheck` fields verbatim from the artifact (interpretation, queries, counts, compliance rate, examples) and updates `PlaybookRule.latestCheckId`.
6. On failure or missing artifact, the hook marks the check ERROR with the reason. `latestCheckId` still advances.
7. User polls `GET /playbook/rules/:ruleId/checks/:checkId` until terminal, then reads the result.

## Essential Features (MVP)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Check trigger endpoint** | `POST /playbook/rules/:ruleId/check` — starts an async PLAYBOOK_CHECK run, returns 202 with check reference. |
| 2 | **Check status endpoint** | `GET /playbook/rules/:ruleId/checks/:checkId` — returns current check state, then full result when terminal. |
| 3 | **Check history endpoint** | `GET /playbook/rules/:ruleId/checks` — lists all checks for a rule, newest first. |
| 4 | **Post-run result ingestion** | On PLAYBOOK_CHECK run completion, read the CheckResult artifact and populate PlaybookRuleCheck fields verbatim. |
| 5 | **Schema extension** | Add check-result columns (interpretation, queries, counts, complianceRate, compliantExamples, violatingExamples, error, runId, checkedAt) to PlaybookRuleCheck. |
| 6 | **NetSuite platform guard** | Reject GENERAL orgs with an ERROR check record (not HTTP 403). |
| 7 | **Failure handling** | Run failures or missing artifacts yield terminal ERROR checks; never leave a check stuck or fabricate a result. |
| 8 | **latestCheckId update** | `PlaybookRule.latestCheckId` advances to the newest terminal check (including ERROR checks). |
| 9 | **CLI: trigger + poll** | `hlx playbook check <rule-ref>` — trigger a check, poll until terminal, print interpretation + counts + examples. |
| 10 | **CLI: list history** | `hlx playbook checks <rule-ref>` — list check history for a rule. |

## Features Explicitly Out of Scope (MVP)

| # | Feature | Reason |
|---|---------|--------|
| 1 | CheckResult schema changes | Ticket invariant: ingest verbatim; do not change the schema. |
| 2 | Agent prompts / fragments | Agent behavior is not modified by this ticket. |
| 3 | Client check UI | Ticket explicitly excludes the results UI. |
| 4 | Check scheduling / monitoring | No cron or recurring check capability in this ticket. |
| 5 | Batch checks across rules | One check = one run = one rule. No batching. |
| 6 | Synchronous check mode | The check is always async; do not hold the request open. |

## Success Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | A check on a NetSuite-org rule starts a run, persists a terminal PlaybookRuleCheck, and updates latestCheckId. | End-to-end: trigger check, observe run, verify DB row populated. |
| 2 | A check on a GENERAL-org rule returns ERROR and starts no run. | API call against a GENERAL org returns check with status=ERROR; no Ticket/Run created. |
| 3 | The CLI can trigger and poll a check headlessly and print interpretation, counts, and examples. | Run `hlx playbook check <rule-ref>` and verify terminal output. |
| 4 | A failed run yields a terminal ERROR check with reason. | Simulate run failure; verify check row status=ERROR, error field populated. |
| 5 | One check creates exactly one run for exactly one rule. | Verify Ticket/Run count matches check count 1:1. |
| 6 | Status and counts are never recomputed — they come verbatim from the CheckResult artifact. | Inspect ingestion code path; no transformation or recalculation. |
| 7 | No check is left in a non-terminal state after its run completes or fails. | Verify all completed runs have checks in PASS, FAIL, or ERROR. |
| 8 | Existing playbook CRUD and orchestrator behavior are unaffected. | Existing tests pass; CRUD endpoints unchanged. |

## User Scenarios

[SCN-01] Trigger a compliance check on a NetSuite playbook rule
- Precondition: User belongs to a NetSuite-platform org and has an active playbook rule.
- Action: User triggers a check for the rule (via API or CLI).
- Expected Outcome: The system acknowledges the check with a reference and begins processing asynchronously. The check initially shows as in-progress.

[SCN-02] Poll a running check to completion
- Precondition: A check has been triggered and is in progress.
- Action: User polls the check status endpoint (or CLI polls automatically).
- Expected Outcome: The check transitions to a terminal state (PASS, FAIL, or ERROR) with interpretation, counts, compliance rate, and examples populated.

[SCN-03] View completed check result details
- Precondition: A check has reached a terminal state.
- Action: User retrieves the check by its ID.
- Expected Outcome: The response includes the full result: status, interpretation, queries, compliant/violating counts, compliance rate, and example records.

[SCN-04] List check history for a rule
- Precondition: A rule has had one or more checks run against it.
- Action: User lists checks for the rule (via API or CLI).
- Expected Outcome: All checks for that rule are returned, newest first, each showing status and summary data.

[SCN-05] Reject check trigger for a non-NetSuite org
- Precondition: User belongs to a GENERAL-platform org.
- Action: User attempts to trigger a check on a playbook rule.
- Expected Outcome: The system returns a check record with status ERROR and a message indicating checks are only available for NetSuite organizations. No run is started.

[SCN-06] Handle run failure gracefully
- Precondition: A check has been triggered and its underlying run fails.
- Action: The run fails or produces no valid CheckResult artifact.
- Expected Outcome: The check reaches terminal ERROR state with the failure reason. It does not remain stuck in a running state. The rule's latestCheckId still updates to this check.

[SCN-07] Trigger and poll a check via CLI
- Precondition: User is authenticated with `hlx` and has a valid rule reference.
- Action: User runs `hlx playbook check <rule-ref>`.
- Expected Outcome: The CLI triggers the check, polls until completion, and prints the interpretation, counts, compliance rate, and examples to the console.

[SCN-08] List check history via CLI
- Precondition: User is authenticated with `hlx` and has a rule with check history.
- Action: User runs `hlx playbook checks <rule-ref>`.
- Expected Outcome: The CLI prints a list of past checks for the rule, newest first, showing status and key summary data.

[SCN-09] latestCheckId reflects the most recent terminal check
- Precondition: A rule has had multiple checks, including some that errored.
- Action: User triggers a new check that completes (any terminal state).
- Expected Outcome: The rule's latestCheckId points to this newest terminal check, regardless of whether the result is PASS, FAIL, or ERROR.

[SCN-10] Check cardinality is enforced
- Precondition: User triggers a check on a rule.
- Action: Exactly one check is created.
- Expected Outcome: Exactly one run is started for that one rule. No runs are reused from other checks, and no batching occurs across rules.

## Key Design Principles

- **Async-first**: Checks are always asynchronous. The trigger returns immediately; the client polls for results.
- **Verbatim ingestion**: The CheckResult artifact is the source of truth. Persisted fields are a direct projection — no recomputation, no transformation.
- **Fail closed**: A check is never marked PASS or FAIL without a valid artifact. Missing or malformed artifacts yield ERROR.
- **1:1:1 cardinality**: One check creates exactly one run for exactly one rule. No batching, no reuse.
- **Platform safety**: Non-NetSuite orgs are rejected at the check level with an ERROR record, not an HTTP error code, so the response shape is consistent for all callers.

## Scope & Constraints

- **Repos in scope**: helix-global-server (API + persistence + ingestion), helix-cli (CLI commands).
- **Repo not in scope**: helix-global-client (no UI work in this ticket).
- **Schema constraint**: PlaybookRuleCheck table exists with minimal columns; a migration adds the required check-result fields. All new columns are nullable (row starts in RUNNING before population).
- **Run infrastructure**: Uses the existing `createTicketForOrganization` and `startQueuedRunForTicketInOrganization` paths. Does not create new run modes or modify orchestrator step selection.
- **CLI constraint**: The CLI introduces its first polling pattern. No existing polling behavior to reuse.

## Future Considerations

- **Client UI**: A future ticket will build the check results display using the API endpoints created here.
- **Scheduled checks**: Recurring / cron-based check triggers may be added later.
- **Check comparison**: Side-by-side comparison of check results over time.
- **Bulk / batch checks**: Running checks across multiple rules simultaneously.

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|----------------|--------|
| 1 | **CheckResult artifact location unknown** — No `CheckResult` file reference exists in the server step catalog or source. The agent presumably writes it during PLAYBOOK_CHECK runs, but the filename and step ID are undefined. Implementation must discover or define where to find it. | Blocks the ingestion hook design. Must be resolved during implementation planning. |
| 2 | **Rule-ref resolution in CLI** — No rule-ref resolution endpoint exists on the server. The CLI needs to accept a rule reference (ID or prefix) and resolve it. Approach TBD (direct ID, prefix match from list endpoint, or new lookup). | Affects CLI UX. Low risk — can use existing list endpoint with client-side match. |
| 3 | **Polling defaults for CLI** — No existing polling pattern in the CLI. Interval (e.g., 3-5s) and timeout (e.g., 10min) defaults need to be chosen. | Low risk — reasonable defaults can be set and adjusted later. |
| 4 | **PlaybookRuleCheck.result field** — The existing `result` column (nullable String) may overlap with the new per-field columns. Whether it is kept, repurposed, or deprecated is unclear. | Low risk — can retain for backward compatibility; new fields are the canonical source. |
| 5 | **Ticket synthesis for check runs** — Creating a Ticket+Run pair via `createTicketForOrganization` requires title/description/reporterUserId. These must be synthesized for check-triggered runs. | Low risk — straightforward to generate descriptive values. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `helix-global-server/scout/scout-summary.md` | Understand server-side gaps and existing patterns | PlaybookRuleCheck schema is minimal; three endpoints needed; no post-run ingestion hook exists; platform guard needs custom behavior |
| `helix-global-server/scout/reference-map.json` | Identify all relevant files and unknowns | 17 files mapped; 5 unknowns including CheckResult artifact location and ticket synthesis |
| `helix-global-server/diagnosis/diagnosis-statement.md` | Root cause analysis and success criteria | Feature-wiring ticket with schema gap, no endpoints, no completion hook, no CLI code; CheckResult location is primary unknown |
| `helix-global-server/diagnosis/apl.json` | Detailed Q&A on design decisions | Schema changes, hook point, platform guard behavior, CheckResult location, ticket creation approach |
| `helix-cli/scout/scout-summary.md` | Understand CLI gaps and patterns | Zero playbook code; goals/ pattern is the model; polling is new; hxFetch for API calls |
| `helix-cli/scout/reference-map.json` | CLI file inventory and unknowns | 11 files mapped; rule-ref resolution and polling defaults are open |
| `helix-cli/diagnosis/diagnosis-statement.md` | CLI root cause and success criteria | New command group, first polling pattern, follows goals/ structure |
| `helix-cli/diagnosis/apl.json` | CLI design Q&A | Command structure, polling approach, rule-ref resolution options |
| `repo-guidance.json` | Repo change intent | server=target, cli=target, client=context (out of scope) |
| `ticket.md` | Primary specification | Endpoint definitions, invariants, acceptance criteria, scope boundaries |
