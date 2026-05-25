# Product: T7 -- CLI Goals Namespace

## Problem Statement

Helix users can create and manage Goals through the server API, but there is no CLI interface to interact with them. The `hlx goals` namespace does not exist. Users who rely on the CLI for workflow automation and quick operations cannot create, list, inspect, or terminate Goals without direct API calls. The server-side Goal API (11 endpoints at `/api/goals`) is fully implemented and operational, but the CLI -- the primary developer interface -- has no coverage for this new entity.

## Product Vision

Provide a first-class `hlx goals` CLI experience that lets users manage Goals directly from the terminal, matching the established quality and patterns of `hlx tickets`. Goals are a distinct entity from tickets, and the CLI must reflect this separation -- Goals are created via `hlx goals create`, not via a ticket mode flag.

## Users

- **Helix operators**: Power users who manage Goals via CLI for speed and scriptability.
- **Automation scripts**: CI/CD pipelines or internal tools that programmatically create and monitor Goals.
- **Developers**: Team members who prefer terminal workflows over the web UI for quick goal status checks and termination.

## Use Cases

1. **Create a Goal**: An operator defines a business objective with success criteria and kicks off the autonomous Goal loop from the terminal.
2. **Monitor Goals**: An operator lists active Goals to check status and progress across the organization.
3. **Inspect a Goal**: An operator retrieves detailed Goal information -- status, child count, latest evaluation, roadmap, and preview forecasts -- to understand progress.
4. **Terminate a Goal**: An operator manually concludes a Goal as either complete (objective met) or failed (abandoned/unrecoverable).
5. **Script Goal management**: Automation integrates `hlx goals` commands into pipelines for programmatic Goal lifecycle management.

## Core Workflow

1. User runs `hlx goals create` with title, description, and repository list.
2. Server creates the Goal and spawns a setup ticket; Goal enters its autonomous loop.
3. User runs `hlx goals list` periodically to monitor Goal status.
4. User runs `hlx goals get <id>` to inspect a specific Goal's progress, roadmap, and evaluation results.
5. When the Goal reaches its objective or needs manual termination, user runs `hlx goals terminate <id> --verdict complete|failed`.

## Essential Features (MVP)

1. **`hlx goals create`** -- Create a Goal with required fields (title, description) and optional fields (repos, max-children, require-approval, sprint).
2. **`hlx goals list`** -- List Goals for the organization with optional status filter and limit.
3. **`hlx goals get <goalId>`** -- Display Goal detail including status, child count, latest evaluation verdict, roadmap summary, and preview forecasts. Supports `--json` output.
4. **`hlx goals terminate <goalId>`** -- Terminate a Goal with a required verdict (`complete` or `failed`).
5. **`hlx goals --help`** -- Namespace help listing all 4 subcommands with usage.
6. **Command registration** -- `goals` case in the main CLI router so `hlx goals` is a recognized top-level command.
7. **CLI documentation** -- `hlx goals` namespace documented alongside existing commands in the docs content module.

## Features Explicitly Out of Scope (MVP)

- **Goal approval workflow via CLI** (approve/reject evaluation proposals) -- covered by web UI in T5/T6.
- **Goal evaluation history via CLI** -- available through server API but not part of T7's 4-command spec.
- **Goal roadmap/preview sub-commands** -- viewable via `hlx goals get` but no dedicated commands.
- **Goal update/edit via CLI** -- PATCH endpoint exists server-side but is not in the T7 spec.
- **Interactive prompts** -- CLI uses flags only; no interactive mode.
- **Modifications to `hlx tickets`** -- VALID_MODES stays at 5 values; no GOAL mode added.

## Success Criteria

1. All 4 commands (`create`, `list`, `get`, `terminate`) successfully call the corresponding server API endpoints and display results.
2. `hlx goals --help` prints usage documentation for all subcommands.
3. VALID_MODES in `src/tickets/create.ts` remains `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']` -- unchanged.
4. `npm run typecheck` passes with zero errors.
5. `npm run build` succeeds.
6. CLI documentation is updated to include the `hlx goals` namespace.
7. `--json` output is supported on `list` and `get` commands for scriptability.

## User Scenarios

[SCN-01] Create a Goal with required fields
- Precondition: User has a valid Helix API key and organization configured
- Action: User runs `hlx goals create --title "Automate RMA process" --description "Build complete RMA approval with approval flow, email notifications, and admin dashboard"`
- Expected Outcome: CLI displays the created Goal with its ID, title, and DRAFT/QUEUED status

[SCN-02] Create a Goal with all optional fields
- Precondition: User has a valid API key and repositories registered
- Action: User runs `hlx goals create --title "Reporting Dashboard" --description "Build analytics dashboard" --repos repo1,repo2 --max-children 15 --require-approval --sprint sprintId`
- Expected Outcome: CLI displays the created Goal reflecting all specified options (max children = 15, approval required, associated repos and sprint)

[SCN-03] List all Goals
- Precondition: User has at least one Goal in their organization
- Action: User runs `hlx goals list`
- Expected Outcome: CLI displays a formatted table of Goals showing ID, title, status, and child count

[SCN-04] List Goals filtered by status
- Precondition: User has Goals in various statuses
- Action: User runs `hlx goals list --status ACTIVE`
- Expected Outcome: CLI displays only Goals with ACTIVE status

[SCN-05] Get Goal detail
- Precondition: A Goal exists with at least one completed child ticket
- Action: User runs `hlx goals get <goalId>`
- Expected Outcome: CLI displays detailed Goal information including title, description, status, child count, latest evaluation verdict, roadmap summary, and preview forecasts

[SCN-06] Get Goal detail as JSON
- Precondition: A Goal exists
- Action: User runs `hlx goals get <goalId> --json`
- Expected Outcome: CLI outputs the raw JSON response from the server, suitable for piping to other tools

[SCN-07] Terminate a Goal as complete
- Precondition: A Goal exists in a non-terminal status
- Action: User runs `hlx goals terminate <goalId> --verdict complete`
- Expected Outcome: CLI displays the updated Goal with COMPLETED status

[SCN-08] Terminate a Goal as failed
- Precondition: A Goal exists in a non-terminal status
- Action: User runs `hlx goals terminate <goalId> --verdict failed`
- Expected Outcome: CLI displays the updated Goal with FAILED status

[SCN-09] Display help for goals namespace
- Precondition: CLI is installed
- Action: User runs `hlx goals --help`
- Expected Outcome: CLI prints usage text listing all 4 subcommands (create, list, get, terminate) with brief descriptions

[SCN-10] Existing ticket commands remain unaffected
- Precondition: CLI is installed with goals namespace added
- Action: User runs `hlx tickets create --mode BUILD --title "Test"` and `hlx tickets list`
- Expected Outcome: Ticket commands work identically to before; VALID_MODES remains AUTO, BUILD, FIX, RESEARCH, EXECUTE with no GOAL option

## Key Design Principles

- **Separate entity, separate namespace**: Goals are not tickets. The CLI reflects this with a dedicated `hlx goals` namespace rather than adding a mode to `hlx tickets`.
- **Thin client**: CLI commands are thin wrappers around server API calls. No business logic in the CLI.
- **Pattern consistency**: Follow established `hlx tickets` patterns for router structure, flag parsing, HTTP calls, output formatting, and documentation.
- **Non-destructive**: Adding Goals does not modify any existing ticket commands, modes, or behaviors.

## Scope & Constraints

- **Repo scope**: helix-cli only. Server API is complete (helix-global-server). Client UI is covered by T5/T6 (helix-global-client).
- **5 new files**: `src/goals/index.ts`, `create.ts`, `list.ts`, `get.ts`, `terminate.ts`.
- **2 modified files**: `src/index.ts` (command registration), `src/docs/cli-content.ts` (documentation).
- **Zero runtime dependencies**: helix-cli uses only devDependencies.
- **ES modules**: All imports must use `.js` extensions.
- **TypeScript strict mode**: All new code must pass strict type checking.

## Future Considerations

- **CLI commands for approval workflow** (`hlx goals approve`, `hlx goals reject`) if operator demand warrants CLI-based approval.
- **Evaluation history command** (`hlx goals evaluations <goalId>`) for detailed PM agent audit trail via CLI.
- **Goal update command** (`hlx goals update <goalId>`) leveraging the existing PATCH endpoint.
- **Interactive Goal creation** with prompts for description and success criteria.
- **`--watch` flag** on `hlx goals get` for live status polling.

## Open Questions / Risks

| # | Question / Risk | Impact | Mitigation |
|---|----------------|--------|------------|
| 1 | Exact response shape of `GET /api/goals` list items -- whether it returns full objects or a lighter list type | Affects how `hlx goals list` formats the table | Inspect actual API response during implementation; format available fields |
| 2 | Whether `--json` should be supported on `hlx goals list` (not explicitly in T7 spec but follows existing pattern) | Scriptability for list output | Include it -- matches `hlx tickets list --json` pattern and is low effort |
| 3 | Whether `hlx goals create --repos` should resolve repo names to IDs via `resolveAllRepos` | User experience for repo specification | Follow `hlx tickets create` pattern which uses `resolveAllRepos` |
| 4 | Server API availability during CLI testing | Cannot verify CLI without a running server | Static verification (typecheck, build) confirms correctness; runtime verification depends on server |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report, Section 8) | Primary specification for T7 CLI commands | 4 commands with exact flag specs; VALID_MODES unchanged; docs update required |
| ticket.md (Research Report, Section 13 -- T7 description) | T7 deliverables checklist | 5 new files in src/goals/, command registration, docs update |
| ticket.md (Research Report, Section 1) | Architecture decisions context | Goals are a separate entity (not a TicketMode); separate UI/CLI namespace |
| helix-cli scout/scout-summary.md | Codebase analysis and file inventory | Confirmed no src/goals/ directory exists; identified all reference patterns; 7 modified/new files total |
| helix-cli scout/reference-map.json | File-level facts and unknowns | API response shapes, hxFetch basePath requirement, flag utilities, ES module constraints |
| helix-cli diagnosis/diagnosis-statement.md | Root cause and success criteria | Greenfield additive feature; helix-cli is the only repo needing changes; 9 success criteria defined |
| helix-cli diagnosis/apl.json | Structured Q&A evidence | Confirmed API contracts (CreateGoalSchema, TerminateGoalSchema), command registration pattern, docs structure |
| repo-guidance.json (helix-global-client run root) | Repo intent classification | helix-cli = target, helix-global-server = context, helix-global-client = context |
