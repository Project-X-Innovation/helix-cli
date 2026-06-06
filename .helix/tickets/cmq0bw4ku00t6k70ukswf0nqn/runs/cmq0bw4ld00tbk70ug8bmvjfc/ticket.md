# Ticket Context

- ticket_id: cmq0bw4ku00t6k70ukswf0nqn
- short_id: BLD-676
- run_id: cmq0bw4ld00tbk70ug8bmvjfc
- run_branch: helix/build/BLD-676-playbook-check-playbook-check-run-mode-and-agent
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook check — PLAYBOOK_CHECK run mode and agent query fragments

## Description
# Ticket: Playbook check — PLAYBOOK_CHECK run mode and agent query fragments

## Summary
Introduce a new run mode, PLAYBOOK_CHECK, that retasks the existing 10-agent Helix pipeline to interpret one plain-language business rule into technical/Helix terms and iteratively validate it against live NetSuite data via the ns-gm CLI, producing a single structured result artifact (status, interpretation, queries, counts, compliant/violating examples). This ticket delivers the mode, the prompt fragments, and the structured output schema only — not the HTTP endpoint or DB ingestion.

## Why
The check is the core value of the Playbook. Rather than build a bespoke agent runner, we reuse the existing sandboxed 10-agent pipeline (which already provisions ns-gm against NetSuite production) by injecting Playbook-specific prompt fragments, exactly as RESEARCH mode and NetSuite mode already swap agent language.

## Decisions Already Made
- The check reuses the existing 10-agent pipeline in the existing Vercel sandbox. Do not build a new agent runner or a new sandbox path.
- A new ticketMode value `PLAYBOOK_CHECK` is added. Prompt fragments are selected by `input.ticketMode === 'PLAYBOOK_CHECK'`, following the existing platform/mode fragment pattern in `sandbox-runtime-assets/workflow-steps/`.
- The agent must iterate: interpret the rule, try SuiteQL via ns-gm, observe results/errors, adjust, and converge. Query errors are signal, not terminal failure.
- The pipeline emits a single structured result conforming to the CheckResult schema below.
- Live checks are NetSuite-only.
- Worst case, all 10 agents run. A reduced step subset is allowed but not required for this ticket.

## Do Not Re-Decide
- Do not add the HTTP check endpoint, run kickoff, or DB ingestion (separate ticket).
- Do not build a query DSL, query builder, or intermediate rule representation. The agent generates SuiteQL directly.
- Do not implement a data-source abstraction for GENERAL orgs.
- Do not modify the PlaybookRule / PlaybookRuleCheck schema.

## Non-Negotiable Invariants
- Playbook fragments must activate only when ticketMode === 'PLAYBOOK_CHECK'. For every other mode the agent prompts must be unchanged. Fragments must be gated and must no-op otherwise.
- The CheckResult artifact must contain exactly: status (PASS|FAIL|ERROR), interpretation (string), queries (string[]), totalRecords (int), compliantCount (int), violatingCount (int), complianceRate (number 0-100), compliantExamples (array of {fields: object, recordId?: string}), violatingExamples (same shape), error (string, present only when status=ERROR).
- status must be PASS only when complianceRate === 100; otherwise FAIL. ERROR is reserved for execution failures, not rule violations.
- SuiteQL execution must go through the ns-gm CLI already provisioned in the sandbox. Do not add a new NetSuite client.
- Raw NetSuite/SuiteQL error text must not appear in the user-facing interpretation; on unrecoverable query failure the artifact status must be ERROR with a friendly message.

## In Scope
- Add `PLAYBOOK_CHECK` to the ticketMode type and thread it through to prompt assembly (orchestrator `workflow-step-chain.ts` and the step executor).
- Add Playbook fragments to `sandbox-runtime-assets/workflow-steps/shared/common.mjs` and the relevant `*/step-config.mjs` buildUserPrompt selectors (at minimum scout, diagnosis, implementation, verification) so the agents: interpret the rule, inspect the NS schema, generate and iterate SuiteQL via ns-gm, categorize records, and emit the CheckResult.
- Define the CheckResult JSON schema as the implementation step's output artifact (written to a known path under the run root) and validate it.
- A clear, explicit system/user prompt for the check that frames the job as translating a fuzzy business rule into validated SuiteQL, treating query errors as signal, inspecting schema before guessing, and never trusting an unexecuted query.

## Out of Scope
- HTTP endpoint, run kickoff from the API, DB ingestion, status/result endpoints, CLI.
- Any client UI.
- Schema changes.

## Required Behavior
- A ticket created with mode PLAYBOOK_CHECK against a NetSuite org runs the pipeline; the agent interprets the rule, iteratively queries live data via ns-gm, and writes a valid CheckResult artifact.
- The interpretation field states, in functional-consultant terms, how the rule was read and which conditions/fields were evaluated.

## Failure Behavior
- If ns-gm is not authenticated / no credentials: the run must emit a CheckResult with status=ERROR and a friendly message; it must not crash the pipeline silently.
- If the org is not NetSuite: PLAYBOOK_CHECK must not attempt queries; emit status=ERROR with the GENERAL-org message.
- If the agent cannot converge on a valid query within its turn budget: emit status=ERROR with a message; do not fabricate results.
- Fail closed: the artifact must always be emitted; a missing artifact is a run failure.

## Batch / Cardinality Rules
- Exactly one rule is checked per run. The CheckResult describes one rule. Do not aggregate multiple rules into one artifact.

## Persistence / Artifact Rules
- The CheckResult artifact path under the run root is the source of truth for the result. It must validate against the schema. No DB writes in this ticket.

## Acceptance Criteria
- A PLAYBOOK_CHECK run against a real NetSuite org produces a schema-valid CheckResult with a coherent interpretation, the SuiteQL queries used, counts, and example records.
- Running any non-PLAYBOOK_CHECK ticket produces agent prompts identical to today (fragments do not leak).
- status=PASS only at 100% compliance; ERROR only on execution failure.
- Negative: the run must not emit raw SuiteQL error text in interpretation; must not run queries for a GENERAL org; must not produce a result for more than one rule.

## Attachments
- (none)
