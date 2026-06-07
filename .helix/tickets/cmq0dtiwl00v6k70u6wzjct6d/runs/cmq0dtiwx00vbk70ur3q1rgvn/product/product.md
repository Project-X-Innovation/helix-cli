# Product: Control-plane Wake + CLI Pull (Remove Public Ingress) — helix-cli

## Problem Statement

The host agent runner inside the sprite is transitioning from push-based comment delivery (HTTP POST from control plane) to pull-based (runner polls via CLI). The CLI already has `hlx comments list --since`, but output is human-readable text that omits comment IDs. The runner needs structured JSON output including comment IDs to advance its `lastProcessedCommentId` marker and avoid re-processing.

## Product Vision

Enable the runner to pull unprocessed comments programmatically via the CLI with machine-parseable output. This is the CLI's contribution to eliminating the public ingress endpoint and enabling the pull-based delivery model.

## Users

| User | Relationship to change |
|------|----------------------|
| **Host agent runner** (automated) | Calls `hlx comments list --since <marker> --json` to pull unprocessed comments inside the sprite |
| **Developers / operators** | May use `--json` for scripting and debugging comment flows |

## Use Cases

- Runner calls `hlx comments list --since <timestamp> --json` and receives structured JSON including comment IDs, content, and metadata for programmatic processing.
- Existing human-readable output remains the default for human operators.

## Core Workflow

1. Runner wakes inside the sprite after control-plane restart.
2. Runner calls `hlx comments list --since <last-marker> --json` via the CLI.
3. CLI fetches comments from the API, filters by `--since`, and outputs structured JSON.
4. Runner parses JSON, processes each new comment, and advances its last-processed marker.

## Essential Features (MVP)

1. **`--json` output flag** — `hlx comments list --json` outputs structured JSON array including comment `id`, `content`, `createdAt`, `author`, `isHelixTagged`, and `isAgentAuthored` fields.
2. **Composable with `--since`** — `--json` works alongside the existing `--since` flag for filtered, machine-parseable output.
3. **Non-breaking default** — Human-readable text output remains the default when `--json` is not specified.

## Features Explicitly Out of Scope (MVP)

- Server-side `since` query parameter (client-side filtering is acceptable).
- `--after-id` cursor-based pagination by comment ID.
- JSON output for other CLI commands (only `comments list` is in scope).
- Changes to `hlx comments post` (already functional for runner replies).

## Success Criteria

| # | Criterion | Polarity |
|---|-----------|----------|
| SC-1 | `hlx comments list --json` outputs a valid JSON array with comment IDs and all fields. | Positive |
| SC-2 | `hlx comments list --since <date> --json` filters and outputs only comments after the given date. | Positive |
| SC-3 | Default (no `--json`) output remains human-readable text, unchanged from current behavior. | Negative |

## User Scenarios

[SCN-01] Pull comments as JSON for programmatic processing
- Precondition: Ticket has comments; runner has CLI access with valid API key
- Action: Runner executes `hlx comments list --json` for the ticket
- Expected Outcome: CLI outputs a JSON array containing all comments with id, content, createdAt, author, isHelixTagged, and isAgentAuthored fields

[SCN-02] Pull new comments since a marker
- Precondition: Runner has processed comments up to a known timestamp
- Action: Runner executes `hlx comments list --since <timestamp> --json` for the ticket
- Expected Outcome: CLI outputs a JSON array containing only comments created after the given timestamp, in chronological order

[SCN-03] Default output unchanged for human operators
- Precondition: Operator uses CLI without `--json` flag
- Action: Operator runs `hlx comments list` for a ticket
- Expected Outcome: Output is human-readable text in the existing format — no change in behavior

[SCN-04] Empty result when no new comments
- Precondition: Runner has processed all existing comments
- Action: Runner executes `hlx comments list --since <recent-timestamp> --json`
- Expected Outcome: CLI outputs an empty JSON array `[]`

## Key Design Principles

- **Non-breaking** — Adding `--json` does not alter default behavior.
- **Complete data** — JSON output includes all fields the runner needs, especially comment `id`.
- **Composable** — Flags combine naturally (`--since`, `--json`, `--helix-only`).

## Scope & Constraints

- The CLI is a stateless API client; it has no runner or host-agent code.
- Auth is pre-configured in the sprite via `/app/.helix-env` with `HELIX_API_KEY`.
- No ORM or database dependencies in this repo.
- The runner code that consumes this output lives in helix-global-server's runner directory.

## Future Considerations

- `--after-id` flag for comment-ID-based cursor pagination (more precise than timestamp).
- Server-side `since` query parameter for efficiency with large comment histories.
- JSON output for other CLI commands.

## Open Questions / Risks

| # | Question / Risk | Status |
|---|----------------|--------|
| R1 | Whether client-side `--since` filtering is sufficient at scale or if server-side filtering will be needed. | Accepted for MVP. |
| R2 | Whether comment ordering by `createdAt` is deterministic enough, or if comment-ID ordering is safer for idempotency. | Accepted for MVP — timestamp ordering is functional. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | CLI scope from ticket description | Runner must pull unprocessed comments since marker |
| scout/scout-summary.md (helix-cli) | CLI capabilities assessment | --since exists, human-readable output, --json flag needed |
| scout/reference-map.json (helix-cli) | File inventory and facts | Client-side filtering, no comment ID in output, CommentResponse type has id field |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI pull readiness analysis | --json flag is primary addition; comment IDs needed for cursor |
| diagnosis/apl.json (helix-cli) | Detailed Q&A on CLI pull support | Partial support exists; structured output required for runner consumption |
| repo-guidance.json | Repo intent mapping | helix-cli is a minor target — --json output flag only |
