# Product Spec — BLD-556: hlx library show --full

## Problem Statement

`hlx library show <ref>` prints only section headings (TOC) from library reports. Users and agents who need to read the full report body — to evaluate claims, check code references, summarize content, or pipe it to downstream tools — must bypass the CLI and call the raw API directly with curl. This defeats the purpose of having a CLI and bypasses CLI-managed auth and rate-limit improvements.

## Product Vision

Give CLI users first-class access to the full text of any library report with a single flag, closing the gap between the CLI's TOC-only view and the web app's full report view.

## Users

- **Helix agents**: Automated agents that evaluate implementation plans, research reports, and proposals from the library as part of workflow steps.
- **Human developers/operators**: Users who read, review, or pipe library report content via the terminal.

## Use Cases

1. An agent needs to verify claims in a research report before acting on its recommendations.
2. A developer wants to review a full implementation plan from the terminal without opening the web app.
3. An agent pipes the full body of a library item into another tool or model for downstream processing.
4. A user checks that a specific section of a proposal matches the current state of the codebase.

## Core Workflow

```
# Current behavior (unchanged):
hlx library show <ref>          # Prints TOC with slug annotations and comment summaries

# New behavior:
hlx library show <ref> --full   # Prints TOC followed by the full markdown body
```

The user passes `--full` when they want the complete report. When omitted, the existing TOC-only output is preserved exactly as-is.

## Essential Features (MVP)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | `--full` flag on `hlx library show` | Prints the full markdown body below the TOC when set |
| 2 | Default output unchanged | Existing `hlx library show <ref>` without `--full` continues to print TOC-only |
| 3 | Help text updated | `hlx library show --help` documents the `--full` flag |
| 4 | Skill documentation updated | `skill-content/references/commands.md` documents `--full` under the library show section |

## Features Explicitly Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| `--body-only` flag | Ticket marks as stretch/optional; defer unless trivially cheap |
| `--out <path>` flag | Ticket marks as stretch/optional; defer unless trivially cheap |
| New API endpoints or changes | The existing `/api/library/items/:id` already returns the full body |
| Pagination or truncation of long reports | No evidence of need; full body is the requested behavior |
| Changes to `src/docs/cli-content.ts` | Pre-existing gap; library commands are not documented there today |

## Success Criteria

1. `hlx library show <ref> --full` prints the same markdown content available at `item.content` from the `/api/library/items/:id` API response.
2. `hlx library show <ref>` (no flag) output is byte-identical to current behavior.
3. `hlx library show --help` displays documentation for `--full`.
4. The CLI skill reference (`skill-content/references/commands.md`) mentions `--full` under the library show section.

## User Scenarios

[SCN-01] View full report body with --full flag
- Precondition: User has a valid library item reference and is authenticated via the CLI
- Action: User runs `hlx library show <ref> --full`
- Expected Outcome: The CLI prints the TOC section followed by the full markdown body of the report

[SCN-02] Default behavior unchanged without --full
- Precondition: User has a valid library item reference and is authenticated via the CLI
- Action: User runs `hlx library show <ref>` (no --full flag)
- Expected Outcome: The CLI prints only the TOC with slug annotations and comment summaries, identical to current behavior

[SCN-03] View help text for --full flag
- Precondition: User has the CLI installed
- Action: User runs `hlx library show --help`
- Expected Outcome: The help output includes documentation for the `--full` flag with a description of what it does

[SCN-04] Full body matches API content
- Precondition: A library item exists with known markdown content
- Action: User runs `hlx library show <ref> --full` and compares the body portion to the `item.content` field from the `/api/library/items/:id` endpoint
- Expected Outcome: The markdown body printed by the CLI matches the API response content

[SCN-05] Handle item with null content gracefully
- Precondition: A library item exists whose `content` field is null
- Action: User runs `hlx library show <ref> --full`
- Expected Outcome: The CLI prints a clear message (e.g., "No content available") rather than crashing or printing empty output

## Key Design Principles

- **Additive only**: The `--full` flag adds a new output mode. It must not alter or remove existing default output.
- **No new API calls**: The handler already fetches the full content; the change is purely in what gets printed.
- **Follow established patterns**: Use the same `hasFlag()` pattern already used by 7+ other CLI flags.
- **Minimal surface**: One new flag, no new commands, no new dependencies.

## Scope & Constraints

- **Single repository**: All changes are within `helix-cli`. No cross-repo or API-side changes needed.
- **4 files affected**: The handler (`src/library/show.ts`), two help/usage text locations (`src/library/index.ts`, `src/index.ts`), and the skill reference doc (`skill-content/references/commands.md`).
- **No existing tests for library commands**: There are no test files under `src/library/`. Test coverage for the new flag is desirable but there is no existing test infrastructure to extend for this specific module.

## Future Considerations

- **`--body-only` flag**: Printing just the markdown body (no TOC) would be useful for piping into files or downstream tools. The ticket calls this a stretch goal.
- **`--out <path>` flag**: Writing the body directly to a file. Also a ticket stretch goal.
- **Library test coverage**: Adding tests for library commands broadly, not just this flag.

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|-----------------|--------|
| 1 | Should the stretch goals (`--body-only`, `--out <path>`) be included if implementation is trivially cheap? | Low risk — ticket says "only if cheap," defer to implementation judgment |
| 2 | No runtime inspection available to verify live API response shape for `item.content` | Low risk — type definitions and null guard in source confirm the field exists and is handled |
| 3 | No existing library test files to extend | Medium risk — new flag has no automated test coverage unless test infrastructure is added |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary problem statement and acceptance criteria | Four acceptance criteria: --full prints body, default unchanged, help updated, skill docs updated |
| scout/scout-summary.md | Boundary map and file inventory | Narrow change surface: 4 files, content already in memory, established flag pattern |
| scout/reference-map.json | Detailed file-level evidence and facts | Confirmed _args param unused, hasFlag() pattern, help text locations, no library tests |
| diagnosis/diagnosis-statement.md | Root cause analysis and implementation scope | Deliberate design omission, not a bug; no new API calls needed; 4-file change set |
| diagnosis/apl.json | Answered diagnostic questions with evidence | Content discarded at line 62 with explicit comment; args plumbing already in place |
| repo-guidance.json | Repo intent classification | helix-cli is the sole target repo; no cross-repo changes needed |
