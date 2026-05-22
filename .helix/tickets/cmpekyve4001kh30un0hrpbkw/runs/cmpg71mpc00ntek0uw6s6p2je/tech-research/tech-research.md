# Tech Research: Goals & PM Agent (Ralph Loop) -- helix-cli

## Technology Foundation

| Layer | Technology | Version | Evidence |
|-------|-----------|---------|---------|
| Runtime | Node.js + TypeScript | ES modules, strict mode | package.json |
| Build | tsc | TypeScript compiler | package.json scripts |
| Quality Gates | typecheck (tsc --noEmit), build (tsc), test (tsc + node --test) | package.json |

**Key CLI state (verified):**
- VALID_MODES: `["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]` at src/tickets/create.ts line 13. Unchanged by Goals (Goals are not a ticket mode).
- Command families in src/index.ts: tickets, inspect, comments, library, skill, org, login, token, update.
- src/tickets/index.ts (~150 lines): subcommand router pattern reference for new goals family.
- Zero Goal-related code exists.

---

## Architecture Decisions

### AD-CLI1: New `hlx goals` Command Family (Not VALID_MODES Addition)

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| A: Add GOAL to VALID_MODES in tickets/create.ts | Minimal change (1 line). | Goals are separate entities, not ticket modes. Creates API confusion -- `hlx tickets create --mode GOAL` sends to wrong endpoint. |
| B: New src/goals/ directory with own subcommand router | Clean namespace. Matches separate-entity architecture. Direct API calls to /api/goals endpoints. | ~5 new files. |

**Chosen: Option B -- New hlx goals command family.**

**Rationale:** Goals are a separate entity with own API endpoints (POST /api/goals, not POST /api/tickets with mode=GOAL). The CLI must reflect this. VALID_MODES stays unchanged at 5 values. New `goals` top-level command registered in src/index.ts alongside existing families.

### AD-CLI2: Command Structure Mirrors Ticket Pattern

**Decision:** src/goals/ directory structure mirrors src/tickets/:

| File | Command | Server Endpoint |
|------|---------|----------------|
| `src/goals/index.ts` | Router/dispatcher | - |
| `src/goals/create.ts` | `hlx goals create --title "..." --description "..."` | POST /api/goals |
| `src/goals/list.ts` | `hlx goals list [--status ACTIVE]` | GET /api/goals |
| `src/goals/get.ts` | `hlx goals get <goalId>` | GET /api/goals/:id |
| `src/goals/terminate.ts` | `hlx goals terminate <goalId> [--outcome completed\|failed]` | POST /api/goals/:id/terminate |

**Optional flags for create:**
- `--max-children <number>` (default: 20)
- `--require-approval` (default: false)
- `--repo <repoId>` (repeatable, for repositoryIds)

---

## Technical Decisions

### TD-CLI1: Registration in src/index.ts

**Decision:** Register `goals` command family in the top-level router at src/index.ts, positioned alphabetically among existing families.

### TD-CLI2: Output Format

**Decision:** Goal list and detail output follows existing ticket list/detail formatting conventions (structured text output, not JSON by default). Goal detail includes: goal ID, title, status, child count, latest evaluation verdict, roadmap summary.

---

## Technical Checks

[TCK-CLI1] New hlx goals command family exists
- Decision Reference: "New hlx goals command family" (AD-CLI1)
- Verification Method: code-inspection
- Expected Evidence: src/goals/index.ts, create.ts, list.ts, get.ts, terminate.ts exist. Goals registered in src/index.ts. VALID_MODES in src/tickets/create.ts unchanged at 5 values.

[TCK-CLI2] CLI commands hit correct server endpoints
- Decision Reference: "Command structure mirrors ticket pattern" (AD-CLI2)
- Verification Method: code-inspection
- Expected Evidence: create.ts calls POST /api/goals, list.ts calls GET /api/goals, get.ts calls GET /api/goals/:id, terminate.ts calls POST /api/goals/:id/terminate.

---

## Performance Expectations

CLI is a thin HTTP client. Performance is bounded by server response time. No special optimization needed.

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| No new dependencies | - | CLI is pure TypeScript with Node built-ins |

---

## Deferred to Round 2

| Item | Reason |
|------|--------|
| `hlx goals approve` / `hlx goals reject` | Approval workflow is opt-in. Add after core CRUD proven. |
| `hlx goals evaluations <goalId>` | Evaluation history viewing from CLI. Lower priority than UI. |

---

## Summary Table

| Decision | Choice | Confidence |
|----------|--------|-----------|
| Command namespace | New `hlx goals` family (AD-CLI1) | High (separate entity) |
| Structure | Mirrors src/tickets/ pattern (AD-CLI2) | High (established pattern) |
| VALID_MODES | Unchanged (TD-CLI1) | High |

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md Research Report Section 4.2 | CLI impact specification | Goals need command family, not VALID_MODES update |
| diagnosis/diagnosis-statement.md (CLI) | CLI scope assessment | New src/goals/ directory, 4-5 files, depends on server API |
| scout/scout-summary.md (CLI) | CLI structure and patterns | VALID_MODES at line 13, subcommand router in src/tickets/index.ts |
| product/product.md | CLI scenarios | SCN-11: hlx goals create with --title, --description, --max-children flags |
