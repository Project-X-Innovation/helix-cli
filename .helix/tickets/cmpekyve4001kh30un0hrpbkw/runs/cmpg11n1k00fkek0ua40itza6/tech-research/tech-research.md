# Tech Research: Goals & PM Agent (Ralph Loop) -- helix-cli

## Technology Foundation

| Layer | Technology | Version | Source |
|-------|-----------|---------|--------|
| Runtime | Node.js + TypeScript | strict mode | `package.json` |
| Build | tsc | Standard | `package.json` scripts |
| Test | tsc + node --test | Standard | `package.json` scripts |
| Dependencies | None (pure TypeScript) | N/A | No runtime deps |

## Architecture Decision: New `hlx goals` Command Family

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| A: Add GOAL to VALID_MODES in create.ts | Minimal change (1 line) | Only works for TicketMode approach; Goals are a separate entity |
| **B: New src/goals/ directory** | Mirrors src/tickets/ pattern; separate command namespace | More files |

### Chosen: Option B -- New Command Family

Goals are a separate entity (user decision), not a TicketMode. VALID_MODES (`create.ts:13`) stays at 5 values (AUTO, BUILD, FIX, RESEARCH, EXECUTE). A new `hlx goals` command namespace is needed.

## Core Technical Decisions

### TD-1: Command Structure

New `src/goals/` directory mirroring `src/tickets/` pattern:

| File | Command | Description |
|------|---------|-------------|
| `src/goals/index.ts` | `hlx goals` | Subcommand router |
| `src/goals/create.ts` | `hlx goals create` | `--title`, `--description`, `--max-children`, `--repository-ids` |
| `src/goals/list.ts` | `hlx goals list` | Optional `--status` filter |
| `src/goals/get.ts` | `hlx goals get <goalId>` | Shows goal detail, children, latest evaluation |
| `src/goals/terminate.ts` | `hlx goals terminate <goalId>` | `--outcome completed` or `--outcome failed` |

### TD-2: Registration in index.ts

Add 'goals' to top-level command routing in `src/index.ts`, following the existing pattern for 'tickets', 'inspect', 'comments', etc.

### TD-3: API Calls

All commands call server endpoints (`POST /api/goals`, `GET /api/goals`, `GET /api/goals/:id`, `POST /api/goals/:id/terminate`) using the existing apiFetch pattern from the tickets commands.

## Technical Checks

[TCK-01] New goals command family with correct subcommands
- Decision Reference: "New hlx goals command family" (Architecture Decision)
- Verification Method: code-inspection
- Expected Evidence: `src/goals/` directory with index.ts, create.ts, list.ts, get.ts, terminate.ts. Registered in src/index.ts.

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Server Goal API | New (server Phase 1-3) | CLI depends on server endpoints being available |
| src/tickets/ pattern | Existing | Structural reference for command family |

## Deferred to Round 2

- `hlx goals approve` and `hlx goals reject` (approval mode commands)
- `hlx goals evaluations` (view evaluation history)
- Goal-related output formatting improvements

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md Continuation Context | Entity model decision | Separate entity means new command family, not VALID_MODES update |
| scout/scout-summary.md (CLI) | CLI structure | VALID_MODES at line 13; command family pattern in src/index.ts |
| diagnosis/diagnosis-statement.md (CLI) | CLI change scope | New src/goals/ directory; create, list, get, terminate subcommands |
