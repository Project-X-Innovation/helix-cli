# Tech Research: T7 -- CLI Goals Namespace

## Technology Foundation

- **Runtime**: Node.js >= 18 (ES2022 target, Node16 module resolution)
- **Language**: TypeScript 6.x with strict mode
- **Module system**: ES modules (`"type": "module"` in package.json); all imports require `.js` extensions
- **Build**: `tsc` (TypeScript compiler), no bundler
- **Dependencies**: Zero runtime dependencies; only devDependencies (`@types/node`, `typescript`)
- **HTTP client**: Shared `hxFetch` utility at `src/lib/http.ts` (retry with backoff, timeout, auth headers)
- **Flag parsing**: Shared utilities at `src/lib/flags.ts` (`getFlag`, `requireFlag`, `hasFlag`, `isHelpRequested`, `getPositionalArgs`)

No new libraries or frameworks are needed. All implementation uses existing shared utilities.

---

## Architecture Decision

### Decision 1: Command namespace structure -- mirror `src/tickets/` pattern

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Mirror `src/tickets/` directory pattern | New `src/goals/` directory with `index.ts` router + individual command files | Consistent with 100% of existing namespaces; easy to navigate; each command is isolated | Slightly more files than a single-file approach |
| B. Single file for all goal commands | One `src/goals.ts` with all 4 commands | Fewer files | Inconsistent with established pattern; harder to maintain; violates every existing namespace's structure |

**Chosen: Option A** -- Mirror `src/tickets/` exactly. Every existing namespace (tickets, comments, inspect, org, library, preview) uses a directory with an index router. Consistency is paramount in a CLI codebase with zero runtime deps.

### Decision 2: Goal ID argument handling -- raw positional cuid

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Raw positional argument | First arg after subcommand is the goal cuid (e.g., `hlx goals get clxyz123abc`) | Simple; matches server API directly; no resolution round-trip | Users must know the full cuid |
| B. Ticket-style reference resolution | Use `extractTicketRef` + `resolveTicket` pattern to support short IDs and numbers | Familiar for ticket users | Goals have no shortId field; no number-based system exists; resolution endpoint doesn't exist; would require server changes |

**Chosen: Option A** -- Goals do not have a `shortId` field or ticket-number system. The Goal model only has a cuid `id`. There is no server endpoint to resolve goal references. Raw positional cuids are the only correct approach. The research report Section 8.3 confirms this: `hlx goals get clxyz123abc`.

### Decision 3: `--repos` flag -- comma-separated with `resolveAllRepos`

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Comma-separated names, resolve to IDs | `--repos name1,name2` parsed via split + `resolveAllRepos` | Matches `hlx tickets create --repos` pattern; user-friendly (names not IDs) | Requires API round-trip to resolve |
| B. Accept raw repository IDs | `--repos id1,id2` passed directly | No resolution needed | User must know internal cuid IDs; terrible UX |
| C. Space-separated | `--repos name1 name2` | Research report example uses this format | Incompatible with `getFlag` which reads only the next arg; would need custom parsing; breaks existing flag conventions |

**Chosen: Option A** -- The tickets create command at `src/tickets/create.ts:62-77` already implements this pattern. The server's `CreateGoalSchema.repositoryIds` accepts `string[]` of internal IDs. The `resolveAllRepos` function at `src/lib/resolve-repo.ts:44-80` handles name/key/ID resolution with error messages listing available repos.

Note: The research report Section 8.3 example shows space-separated repos (`--repos helix-global-server helix-global-client`), but this is incompatible with the CLI's `getFlag` utility which reads only a single value after a flag. The comma-separated format used in the ticket description and tickets create command is correct.

### Decision 4: `--verdict` flag naming and values

**Options considered:**

| Option | Description |
|--------|-------------|
| A. `--verdict complete\|failed` | Matches server TerminateGoalSchema field name and enum values exactly |
| B. `--outcome completed\|failed` | Alternative naming from one variant of the ticket description |

**Chosen: Option A** -- The server's `TerminateGoalSchema` at `goal-controller.ts:33-35` defines `verdict: z.enum(["complete", "failed"])`. The CLI flag must match the server field name and exact string values. Using `--outcome` or `completed` (with 'd') would require mapping and introduce unnecessary inconsistency.

### Decision 5: `--limit` on list command -- client-side truncation

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Client-side truncation | Parse `--limit`, slice result array | Works without server changes; satisfies spec | Returns all data over the wire, then truncates |
| B. Pass as query param | `?limit=N` to server | Efficient on large datasets | Server `listGoals` handler does NOT read limit/offset params (verified goal-controller.ts:73-78); would be silently ignored |
| C. Omit the flag | Don't implement --limit | Simpler | Deviates from research report Section 8.3 spec |

**Chosen: Option A** -- The server's `listGoals` handler only reads `?status` query param. It does not accept `limit` or `offset`. Client-side truncation with `Array.slice(0, limit)` satisfies the spec with no server changes. The default limit (20 per spec) is sensible for typical goal counts.

### Decision 6: `--json` output support scope

**Chosen**: Support `--json` on both `list` and `get` commands, matching the `hlx tickets list --json` and `hlx tickets get <ref> --json` patterns. The product spec (product.md Success Criteria #7) explicitly requires this. JSON output emits `JSON.stringify(data, null, 2)` for scriptability.

`create` and `terminate` do not need `--json` -- they output structured text confirmation consistent with `hlx tickets create` behavior.

### Decision 7: `--repos` required vs. optional for create

**Chosen**: Optional. The server's `CreateGoalSchema.repositoryIds` defaults to `[]`. The product spec SCN-01 shows create without repos. Making repos optional allows goals to be created before repos are determined (the repos may be specified when the PM agent begins evaluating). This differs from `hlx tickets create` where `--repos` is required -- appropriate because tickets need repos immediately for execution, while goals can defer.

---

## Core API/Methods

### Server Endpoints Used (4 of 11)

| Endpoint | Method | Request | Response | CLI Command |
|----------|--------|---------|----------|-------------|
| `/api/goals` | POST | `{ title, description, maxChildren?, requireApproval?, repositoryIds?, sprintId? }` | 201 `{ goal }` | `hlx goals create` |
| `/api/goals` | GET | `?status=X` (optional) | 200 `{ items: Goal[] }` (each with `_count.childTickets`) | `hlx goals list` |
| `/api/goals/:id` | GET | -- | 200 `{ goal }` (with `childTickets[]`, `latestEvaluation`) | `hlx goals get` |
| `/api/goals/:id/terminate` | POST | `{ verdict: "complete" \| "failed" }` | 200 `{ goal }` | `hlx goals terminate` |

### Shared Utilities Used

| Utility | Location | Usage |
|---------|----------|-------|
| `hxFetch` | `src/lib/http.ts:37` | All API calls with `basePath: "/api"` |
| `getFlag` | `src/lib/flags.ts:5` | Optional value flags (`--status`, `--limit`, `--max-children`, `--sprint`) |
| `requireFlag` | `src/lib/flags.ts:28` | Required value flags (`--title`, `--description`, `--verdict`) |
| `hasFlag` | `src/lib/flags.ts:11` | Boolean flags (`--json`, `--require-approval`) |
| `isHelpRequested` | `src/lib/flags.ts:24` | Help detection (`--help`, `-h`) |
| `resolveAllRepos` | `src/lib/resolve-repo.ts:44` | Resolve `--repos` names to IDs |
| `configOrHelp` | `src/index.ts:25` | Config loading with help bypass |

### Response Type Shapes (for TypeScript type definitions)

**GoalListItem** (from `GET /api/goals`):
```
{ id, organizationId, reporterUserId, title, description, status, maxChildren, roadmap, previews, requireApproval, repositoryIds, sprintId, createdAt, updatedAt, _count: { childTickets: number } }
```

**GoalDetail** (from `GET /api/goals/:id`):
```
{ id, ...(all Goal fields), childTickets: Array<{ id, title, status, childType, mode, createdAt, updatedAt }>, latestEvaluation: { id, goalId, triggerTicketId, assessmentArtifact, deciderOutput, verdict, proposedTicketId, createdAt } | null }
```

**CreateGoalResponse** (from `POST /api/goals`):
```
{ goal: { id, title, status, ... } }
```

---

## Technical Decisions (with rejected alternatives)

### TD-1: File structure for new commands

5 new files in `src/goals/`:

| File | Exports | Responsibility |
|------|---------|----------------|
| `index.ts` | `runGoals(config, args)` | Subcommand router (switch statement), namespace help text |
| `create.ts` | `cmdGoalsCreate(config, args)` | Parse flags, resolve repos, POST /api/goals, format output |
| `list.ts` | `cmdGoalsList(config, args)` | Parse flags, GET /api/goals, format table or JSON output |
| `get.ts` | `cmdGoalsGet(config, goalId, args)` | GET /api/goals/:id, format detail or JSON output |
| `terminate.ts` | `cmdGoalsTerminate(config, goalId, args)` | Parse --verdict, POST /api/goals/:id/terminate, format output |

**Rejected**: Single-file approach; multi-export barrel file. Both violate established patterns.

### TD-2: Goal ID extraction pattern

```
const goalId = args[0]; // First positional arg after subcommand
if (!goalId) { console.error("Error: Goal ID is required."); process.exit(1); }
```

Unlike tickets, goals have no resolution layer. The router (`index.ts`) extracts the goalId before calling `cmdGoalsGet` or `cmdGoalsTerminate`.

**Rejected**: Using `getPositionalArgs` with flag exclusions -- unnecessary complexity since goalId is always the first non-flag arg at position 0.

### TD-3: Output formatting for `hlx goals list`

One-line-per-goal table format:
```
<id-abbr>  <status>      <childCount> children  <updatedAt>  <title>
```

Follows the tickets list pattern at `src/tickets/list.ts:106-112` which outputs:
```
<shortId>  <id-abbr>  <status>  <reporter>  <updatedAt>  <title>
```

Goals don't have shortIds, so the format drops shortId and adds child count instead (more useful for goals).

### TD-4: Output formatting for `hlx goals get`

Multi-section formatted output:
```
Title:          <title>
ID:             <id>
Status:         <status>
Max Children:   <maxChildren>
Approval Mode:  <requireApproval>
Children:       <count>

Latest Evaluation:
  Verdict:      <verdict or "none">

Child Tickets:
  <id>  <status>  <childType>  <title>

Description:
<description, truncated at 500 chars>
```

Follows `src/tickets/get.ts:62-113` (printTicketDetail) structure.

### TD-5: `src/index.ts` registration

Add a new case to the switch at lines 79-148, following the exact pattern of the `tickets` case (lines 116-119):
```
case "goals": {
  const config = configOrHelp(args.slice(1));
  await runGoals(config, args.slice(1));
  break;
}
```

Also add import at top and `hlx goals` line to usage text.

### TD-6: `src/docs/cli-content.ts` documentation

Add a `### Goals` section to Common Commands (between Tickets and Inspect sections) with:
- Command table (create, list, get, terminate)
- Flag tables for create, list
- Worked examples section

---

## Technical Checks

[TCK-01] Command registration in src/index.ts
- Decision Reference: "Add 'goals' case to switch statement following the tickets pattern" (TD-5)
- Verification Method: code-inspection
- Expected Evidence: src/index.ts contains a `case "goals":` block that calls `configOrHelp(args.slice(1))` then `await runGoals(config, args.slice(1))`. Import statement for `runGoals` exists at top of file. `hlx goals` appears in usage text.

[TCK-02] API calls use correct basePath and endpoints
- Decision Reference: "All API calls use hxFetch with basePath: '/api'" (Core API/Methods)
- Verification Method: code-inspection
- Expected Evidence: All hxFetch calls in src/goals/*.ts include `basePath: "/api"`. Paths are `/goals` (create, list), `/goals/${goalId}` (get), `/goals/${goalId}/terminate` (terminate). No calls use the default `/api/inspect` basePath.

[TCK-03] VALID_MODES unchanged
- Decision Reference: "Goals are a separate entity from tickets; VALID_MODES must NOT change" (Research Report Architecture Decision #1, Diagnosis)
- Verification Method: code-inspection
- Expected Evidence: src/tickets/create.ts line 13 contains exactly `const VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"] as const;` with no GOAL value added. No imports or references to VALID_MODES in src/goals/.

[TCK-04] --verdict flag matches server TerminateGoalSchema
- Decision Reference: "Use --verdict with values 'complete' or 'failed' matching server" (Decision 4)
- Verification Method: code-inspection
- Expected Evidence: terminate.ts uses `requireFlag(args, "--verdict", ...)` and validates the value against `["complete", "failed"]` before sending as `{ verdict }` in the POST body.

[TCK-05] ES module imports use .js extensions
- Decision Reference: "ES modules with .js extensions required in imports" (Technology Foundation)
- Verification Method: code-inspection
- Expected Evidence: All import statements in src/goals/*.ts use `.js` extensions (e.g., `import { hxFetch } from "../lib/http.js"`). No bare specifier imports to local files.

[TCK-06] TypeScript strict mode compliance
- Decision Reference: "TypeScript strict mode, all new code must pass strict type checking" (Technology Foundation)
- Verification Method: behavioral
- Expected Evidence: `npm run typecheck` exits with code 0 (zero errors). All response types are explicitly typed (no `any`).

[TCK-07] CLI documentation updated
- Decision Reference: "src/docs/cli-content.ts should be updated to document the hlx goals namespace" (TD-6, Research Report Section 8.5)
- Verification Method: code-inspection
- Expected Evidence: cli-content.ts contains a Goals section with command table, flag descriptions, and at least one worked example. The `keywords` array includes "goals".

---

## Cross-Platform Considerations

Not applicable. helix-cli is a Node.js CLI targeting Node >= 18 on all platforms. The implementation uses only `node:fs` and `node:path` built-ins (for config, not for goals commands). Goals commands are pure HTTP calls with no platform-specific behavior.

---

## Performance Expectations

- **API calls**: Single HTTP request per command (except create with `--repos` which adds one resolveAllRepos call). hxFetch has 30s timeout with up to 3 retry attempts.
- **Startup time**: Negligible. No heavy imports; all goals modules are small.
- **Output rendering**: Client-side only. Goals lists are expected to be small (typically < 100 goals per org). Client-side `--limit` truncation is adequate.
- **No streaming**: All responses are JSON. No need for streaming or incremental output.

---

## Dependencies

### Existing Dependencies Used (no new dependencies)

| Dependency | Type | Purpose |
|------------|------|---------|
| `typescript` | devDependency | Compilation (v6.0.2) |
| `@types/node` | devDependency | Node.js type definitions (v25.5.0) |

### External Service Dependencies

| Service | Dependency Type | Notes |
|---------|----------------|-------|
| Helix Server API (`/api/goals`) | Runtime | All 4 commands require a running server with Goal API deployed (T4 must be complete) |
| Helix Inspect API (`/api/inspect/repositories`) | Runtime | Only for `--repos` flag resolution via `resolveAllRepos` |

### Cross-Repo Dependencies

| Repo | Relationship | What's Needed |
|------|-------------|---------------|
| helix-global-server | Context only (no changes) | Server Goal API must be deployed (T4). Verified complete in current staging HEAD. |
| helix-global-client | No relationship | No interaction for T7 |

---

## Deferred to Round 2

| Item | Reason |
|------|--------|
| `hlx goals approve <goalId> <evalId>` | Approval workflow CLI is out of scope per product spec; covered by web UI (T5/T6) |
| `hlx goals reject <goalId> <evalId>` | Same as approve -- out of scope |
| `hlx goals evaluations <goalId>` | Evaluation history command not in T7 spec; server endpoint exists but CLI coverage is future work |
| `hlx goals update <goalId>` | PATCH endpoint exists server-side but not in T7's 4-command spec |
| `--watch` flag on `hlx goals get` | Live polling not in T7 spec; mentioned in product.md Future Considerations |
| Server-side pagination for goals list | Server needs limit/offset support on `listGoals` handler for large datasets |
| `--description-file` for goals create | Ticket create supports this but research report doesn't specify it for goals; could be added later |

---

## Summary Table

| Dimension | Value |
|-----------|-------|
| Repos changed | helix-cli (1 repo only) |
| New files | 5 (`src/goals/index.ts`, `create.ts`, `list.ts`, `get.ts`, `terminate.ts`) |
| Modified files | 2 (`src/index.ts`, `src/docs/cli-content.ts`) |
| New dependencies | 0 |
| Server API endpoints used | 4 (POST /api/goals, GET /api/goals, GET /api/goals/:id, POST /api/goals/:id/terminate) |
| Risk level | Low -- greenfield additive feature, all patterns well-established |
| Key constraint | VALID_MODES in src/tickets/create.ts must remain exactly 5 values |
| Quality gates | `npm run typecheck` (0 errors), `npm run build` (success) |

---

## APL Statement Reference

T7 is a well-defined greenfield CLI feature adding 5 new files and modifying 2 existing files in helix-cli. All patterns are established by the tickets namespace. The server API contracts are verified (4 endpoints with exact response shapes). Key technical decisions: raw cuid for goal IDs (no resolution needed), comma-separated --repos with resolveAllRepos, client-side --limit truncation, --verdict flag matching server TerminateGoalSchema, --json on list and get. No new dependencies required. Only helix-cli is changed. All APL questions resolved with followups=[].

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report Section 8) | Primary CLI specification for T7 | 4 commands with flag specs, --repos format, --verdict values, VALID_MODES constraint, docs update |
| ticket.md (Research Report Section 13, T7) | T7 deliverables checklist | 5 new files in src/goals/, index.ts registration, cli-content.ts docs |
| diagnosis/diagnosis-statement.md (helix-cli) | Root cause and scope | Greenfield additive feature; helix-cli only; 9 success criteria |
| diagnosis/apl.json (helix-cli) | Verified API contracts | CreateGoalSchema fields, TerminateGoalSchema, hxFetch basePath, flag utilities |
| product/product.md (helix-cli) | User scenarios and success criteria | 10 scenarios, --json required on list+get, --repos optional for create |
| scout/reference-map.json (helix-cli) | File inventory and server API facts | Confirmed no src/goals/, 11 server endpoints, _count.childTickets on list |
| scout/scout-summary.md (helix-cli) | Pattern reference and constraints | namespace router pattern, ES modules, strict TS, quality gates |
| repo-guidance.json | Repo intent classification | helix-cli=target, server=context, client=context |
| helix-cli/src/index.ts | Command registration pattern | Switch-based routing at lines 79-148, configOrHelp, import pattern |
| helix-cli/src/tickets/index.ts | Namespace router reference | Subcommand switch, help text, isHelpRequested, 150 lines |
| helix-cli/src/tickets/create.ts | Create command reference | requireFlag, resolveAllRepos, POST body, VALID_MODES at line 13 |
| helix-cli/src/tickets/list.ts | List command reference | Query params, hasFlag --json, table output format |
| helix-cli/src/tickets/get.ts | Get command reference | printTicketDetail, formatted output, --json via hasFlag |
| helix-cli/src/lib/http.ts | HTTP client contract | hxFetch signature, basePath option, retry/timeout behavior |
| helix-cli/src/lib/flags.ts | Flag parsing API | getFlag, requireFlag, hasFlag, isHelpRequested, getPositionalArgs |
| helix-cli/src/lib/resolve-repo.ts | Repo resolution | resolveAllRepos signature and error handling |
| helix-cli/src/docs/cli-content.ts | Documentation structure | Exported object with markdown content, command tables, keywords array |
| helix-global-server/src/controllers/goal-controller.ts | Server API response shapes | Exact Zod schemas, response envelopes, latestEvaluation transform |
| helix-global-server/src/services/goal-service.ts | Service layer details | listGoalsForOrganization has no pagination; getGoalDetail includes childTickets+evaluations |
