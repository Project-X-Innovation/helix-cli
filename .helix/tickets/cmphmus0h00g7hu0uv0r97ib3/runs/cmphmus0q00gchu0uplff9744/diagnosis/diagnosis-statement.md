# Diagnosis Statement: T7 CLI Goals Namespace

## Problem Summary

The helix-cli needs a new `hlx goals` command namespace with 4 subcommands (create, list, get, terminate) that call the existing server-side Goal API endpoints at `/api/goals`. The `src/goals/` directory does not exist yet. This is a greenfield additive feature -- no existing code is broken or needs repair.

## Root Cause Analysis

**Not a defect -- feature gap.** The server-side Goal entity and its 11 API endpoints are fully implemented in helix-global-server (goal-controller.ts, registered in api.ts:436-447). However, no CLI interface exists to interact with Goals. The T7 ticket specifies adding a CLI namespace that mirrors the existing `hlx tickets` pattern.

**Why helix-cli only:** Goals are a separate entity from tickets with their own API, status enum (GoalStatus, 9 values), and lifecycle. The server API is complete; the client UI (T5/T6) is a separate ticket. T7 is exclusively a helix-cli change.

## Evidence Summary

### Confirmed Facts

1. **`src/goals/` does not exist** -- verified by directory listing.
2. **Server API is complete** -- 11 endpoints registered at api.ts:436-447 with Zod-validated request schemas (CreateGoalSchema, TerminateGoalSchema).
3. **API response shapes** -- `{ goal }` for single objects (create, get, terminate), `{ items }` for lists. GET list accepts `?status` query param.
4. **VALID_MODES is untouched** -- confirmed at src/tickets/create.ts:13 as `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']`.
5. **Command registration pattern** -- src/index.ts switch statement at lines 79-148; each namespace imports a runner and calls it with `configOrHelp(args.slice(1))`.
6. **Flag parsing utilities** -- src/lib/flags.ts exports getFlag, requireFlag, hasFlag, isHelpRequested (verified, 36 lines).
7. **HTTP client** -- hxFetch requires `basePath: "/api"` for goals endpoints (default is `/api/inspect`).
8. **Repo resolution** -- resolveAllRepos at src/lib/resolve-repo.ts resolves comma-separated names to IDs for `--repos` flag.
9. **ES modules** -- package.json type=module; imports require `.js` extensions.
10. **Zero runtime deps** -- only devDependencies (TypeScript, @types/node).

### Implementation Scope

**New files (5):**
| File | Purpose |
|------|---------|
| `src/goals/index.ts` | Namespace router -- exports `runGoals`, switch on subcommand |
| `src/goals/create.ts` | POST /api/goals -- flags: --title, --description, --repos, --max-children, --require-approval, --sprint |
| `src/goals/list.ts` | GET /api/goals -- flags: --status, --limit, --json |
| `src/goals/get.ts` | GET /api/goals/:id -- positional goalId arg, --json |
| `src/goals/terminate.ts` | POST /api/goals/:id/terminate -- positional goalId arg, --verdict flag |

**Modified files (2):**
| File | Change |
|------|--------|
| `src/index.ts` | Add `"goals"` case to switch, import `runGoals` from `./goals/index.js` |
| `src/docs/cli-content.ts` | Add Goals section to Common Commands table and Worked Examples |

### Disconfirming Check

- Verified VALID_MODES has exactly 5 values (not modified by prior T-series tickets).
- Verified no src/goals/ directory exists (no partial implementation from a prior run).
- Server goal-controller.ts uses Zod schemas that exactly match the research report spec.

## Success Criteria

1. `hlx goals create --title "..." --description "..." --repos name1,name2` successfully creates a Goal via POST /api/goals.
2. `hlx goals list` returns a formatted list; `--status` and `--json` flags work.
3. `hlx goals get <goalId>` displays Goal detail including status, child count, latest evaluation; `--json` flag works.
4. `hlx goals terminate <goalId> --verdict complete` terminates a Goal via POST /api/goals/:id/terminate.
5. `hlx goals --help` prints usage for all 4 subcommands.
6. VALID_MODES in src/tickets/create.ts remains `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']`.
7. `npm run typecheck` passes with zero errors.
8. `npm run build` succeeds.
9. `src/docs/cli-content.ts` documents the goals namespace.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report Section 8) | Primary spec for T7 CLI commands | 4 commands with exact flag specs, VALID_MODES unchanged, docs update required |
| ticket.md (Research Report Section 13, T7) | T7 deliverables checklist | src/goals/ directory, 4 command files, index.ts registration, docs update |
| helix-cli scout/reference-map.json | File inventory and facts | Confirmed no src/goals/ directory, listed all reference files, server API details |
| helix-cli scout/scout-summary.md | Analysis summary | Confirmed helix-cli is the only repo needing changes |
| helix-cli/src/index.ts | Command registration pattern | Switch-based routing, configOrHelp, import pattern (lines 79-148) |
| helix-cli/src/tickets/index.ts | Namespace router pattern | Switch on subcommand, help text, isHelpRequested checks (150 lines) |
| helix-cli/src/tickets/create.ts | Create command pattern | Flag parsing, resolveAllRepos, POST body, structured output; VALID_MODES at line 13 |
| helix-cli/src/tickets/list.ts | List command pattern | Query params, client-side filtering, table + JSON output |
| helix-cli/src/tickets/get.ts | Get command pattern | printTicketDetail, formatted console output, --json flag |
| helix-cli/src/lib/http.ts | HTTP client contract | hxFetch signature, basePath: '/api' requirement, retry logic |
| helix-cli/src/lib/flags.ts | Flag parsing utilities | getFlag, requireFlag, hasFlag, isHelpRequested, getPositionalArgs |
| helix-cli/src/lib/resolve-repo.ts | Repo resolution | resolveAllRepos resolves names to IDs for --repos flag |
| helix-cli/src/docs/cli-content.ts | Documentation structure | Exported object with markdown content, command tables, worked examples |
| helix-global-server goal-controller.ts | Server API contracts | CreateGoalSchema fields, TerminateGoalSchema, response envelope shapes |
