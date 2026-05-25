# Implementation Plan: T7 -- CLI Goals Namespace

## Overview

Add a new `hlx goals` CLI command namespace with 4 subcommands (create, list, get, terminate) to helix-cli. The commands are thin wrappers around the existing server-side Goal API at `/api/goals`. This is a greenfield additive feature: 5 new files in `src/goals/`, 2 modified files (`src/index.ts`, `src/docs/cli-content.ts`), zero new dependencies.

## Implementation Principles

1. **Pattern consistency**: Every new file mirrors the established `src/tickets/` patterns exactly (router structure, flag parsing, HTTP calls, output formatting).
2. **Separate entity**: Goals are not tickets. No modifications to `VALID_MODES`, `TicketMode`, or any existing ticket code.
3. **Thin client**: CLI commands contain no business logic -- they parse flags, call `hxFetch`, and format output.
4. **ES module compliance**: All imports use `.js` extensions. Strict TypeScript mode. Zero runtime dependencies.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Create goals namespace directory and router | `src/goals/index.ts` with `runGoals` export |
| 2 | Implement `hlx goals create` command | `src/goals/create.ts` with flag parsing, repo resolution, POST /api/goals |
| 3 | Implement `hlx goals list` command | `src/goals/list.ts` with status filter, --limit, --json, table output |
| 4 | Implement `hlx goals get` command | `src/goals/get.ts` with detail display, --json output |
| 5 | Implement `hlx goals terminate` command | `src/goals/terminate.ts` with --verdict flag, POST /api/goals/:id/terminate |
| 6 | Register goals namespace in main CLI router | Modified `src/index.ts` with `goals` case and import |
| 7 | Update CLI documentation | Modified `src/docs/cli-content.ts` with Goals section |
| 8 | Run quality gates | Verify typecheck and build pass |

## Detailed Implementation Steps

### Step 1: Create goals namespace directory and router

**Goal**: Create the `src/goals/` directory and the namespace router that dispatches subcommands.

**What to Build**:

Create `src/goals/index.ts` exporting `runGoals(config: HxConfig, args: string[])`:
- Import `HxConfig` from `../lib/config.js`
- Import `isHelpRequested` from `../lib/flags.js`
- Import command functions from `./create.js`, `./list.js`, `./get.js`, `./terminate.js`
- Define `goalsUsage()` function printing help text for all 4 subcommands (pattern: `src/tickets/index.ts:15-33`)
- Switch on `args[0]` (subcommand) dispatching to the 4 commands
- For `get` and `terminate`: extract goalId as `rest[0]` (first positional arg), error if missing
- Each case checks `isHelpRequested(rest)` before dispatching (pattern: `src/tickets/index.ts:44-48`)
- Default case prints error and calls `goalsUsage()`

**Verification (AI Agent Runs)**:
- File exists at `src/goals/index.ts`
- Exports `runGoals` function
- TypeScript compiles without errors in isolation (may have import errors until Steps 2-5)

**Success Criteria**:
- Router follows the exact pattern from `src/tickets/index.ts`
- All 4 subcommands have cases in the switch
- Help text matches research report Section 8.3 command specs

---

### Step 2: Implement `hlx goals create` command

**Goal**: Create the `hlx goals create` command that calls POST /api/goals.

**What to Build**:

Create `src/goals/create.ts` exporting `cmdGoalsCreate(config: HxConfig, args: string[])`:
- Type definition: `CreateGoalResponse = { goal: { id: string; title: string; status: string; maxChildren: number; requireApproval: boolean } }`
- Required flags: `--title` (via `requireFlag`), `--description` (via `requireFlag`)
- Optional flags:
  - `--repos` (via `getFlag`): comma-separated, resolved via `resolveAllRepos` from `../lib/resolve-repo.js` (pattern: `src/tickets/create.ts:62-77`)
  - `--max-children` (via `getFlag`): parse to integer, default omitted
  - `--require-approval` (via `hasFlag`): boolean flag
  - `--sprint` (via `getFlag`): pass as sprintId
- API call: `hxFetch(config, "/goals", { method: "POST", body: { title, description, repositoryIds?, maxChildren?, requireApproval?, sprintId? }, basePath: "/api" })`
- Output: formatted confirmation (pattern: `src/tickets/create.ts:174-184`)
  ```
  Goal created:
    ID:       <id>
    Title:    <title>
    Status:   <status>
  ```
- Error handling: try/catch with server error extraction (pattern: `src/tickets/create.ts:154-172`)

**Verification (AI Agent Runs)**:
- `npm run typecheck` passes
- File exports `cmdGoalsCreate` function
- Uses `basePath: "/api"` in hxFetch call
- `--repos` flag uses `resolveAllRepos` (not raw IDs)

**Success Criteria**:
- All required flags validated before API call
- Optional flags conditionally included in body
- Import paths use `.js` extensions

---

### Step 3: Implement `hlx goals list` command

**Goal**: Create the `hlx goals list` command that calls GET /api/goals.

**What to Build**:

Create `src/goals/list.ts` exporting `cmdGoalsList(config: HxConfig, args: string[])`:
- Type definition: `GoalListItem = { id: string; title: string; status: string; updatedAt: string; _count: { childTickets: number }; description: string }` and `GoalsListResponse = { items: GoalListItem[] }`
- Flags:
  - `--status` (via `getFlag`): passed as query param `?status=X` to server
  - `--limit` (via `getFlag`): client-side truncation via `Array.slice(0, limit)` (server does not support pagination)
  - `--json` (via `hasFlag`): output `JSON.stringify(items, null, 2)`
- API call: `hxFetch(config, "/goals", { basePath: "/api", queryParams: { status? } })`
- Table output format (pattern: `src/tickets/list.ts:106-113`):
  ```
  <id-abbr>  <status>      <childCount> children  <updated>  <title>
  ```
  - `id-abbr`: `item.id.slice(0, 8) + "..."`
  - `childCount`: from `item._count.childTickets`
  - `status`: padded to 18 chars (longest GoalStatus is PENDING_APPROVAL = 16)
  - `updated`: `new Date(item.updatedAt).toLocaleString()`
- Empty state: "No goals found." (or `[]` for JSON mode)

**Verification (AI Agent Runs)**:
- `npm run typecheck` passes
- `--status` passed as query param, not client-side filter
- `--limit` implemented as client-side `slice`
- `--json` outputs valid JSON

**Success Criteria**:
- Table output is aligned and readable
- Status filter uses server-side `?status` query param
- Default limit: 20 (from spec), applied client-side

---

### Step 4: Implement `hlx goals get` command

**Goal**: Create the `hlx goals get` command that calls GET /api/goals/:id.

**What to Build**:

Create `src/goals/get.ts` exporting `cmdGoalsGet(config: HxConfig, goalId: string, args: string[])`:
- Type definitions for `GoalDetail` matching server response shape (includes childTickets[], latestEvaluation, roadmap, previews)
- `--json` (via `hasFlag`): output `JSON.stringify(goal, null, 2)`
- API call: `hxFetch(config, \`/goals/${goalId}\`, { basePath: "/api" })`
- Formatted output (pattern: `src/tickets/get.ts:62-113`):
  ```
  Title:          <title>
  ID:             <id>
  Status:         <status>
  Max Children:   <maxChildren>
  Approval Mode:  <requireApproval ? "enabled" : "disabled">
  Children:       <childTickets.length>

  Latest Evaluation:
    Verdict:      <latestEvaluation.verdict or "none">

  Child Tickets:
    <id-abbr>  <status>  <childType>  <title>

  Roadmap:
    Completed:  <roadmap.completed_summary or "none">
    Current:    <roadmap.current_assessment or "none">
    Remaining:  <roadmap.projected_remaining.join(", ") or "none">

  Description:
  <description, truncated at 500 chars>
  ```
- Also export `printGoalDetail` for reuse (pattern: `src/tickets/get.ts:62`)

**Verification (AI Agent Runs)**:
- `npm run typecheck` passes
- Handles null `latestEvaluation`, null `roadmap`, null `previews` gracefully
- `--json` outputs raw server response

**Success Criteria**:
- All detail sections render correctly
- Null/missing data shows "none" instead of crashing
- Child tickets listed with childType labels

---

### Step 5: Implement `hlx goals terminate` command

**Goal**: Create the `hlx goals terminate` command that calls POST /api/goals/:id/terminate.

**What to Build**:

Create `src/goals/terminate.ts` exporting `cmdGoalsTerminate(config: HxConfig, goalId: string, args: string[])`:
- Type definition: `TerminateGoalResponse = { goal: { id: string; title: string; status: string } }`
- Required flag: `--verdict` (via `requireFlag`), validated against `["complete", "failed"]`
- API call: `hxFetch(config, \`/goals/${goalId}/terminate\`, { method: "POST", body: { verdict }, basePath: "/api" })`
- Output:
  ```
  Goal terminated:
    ID:       <id>
    Title:    <title>
    Status:   <status>
    Verdict:  <verdict>
  ```
- Error handling: try/catch with server error extraction

**Verification (AI Agent Runs)**:
- `npm run typecheck` passes
- `--verdict` validated before API call
- Invalid verdict values rejected with clear error message

**Success Criteria**:
- Only `"complete"` and `"failed"` accepted as verdict values
- Uses `requireFlag` for `--verdict`
- POST body matches server's `TerminateGoalSchema`

---

### Step 6: Register goals namespace in main CLI router

**Goal**: Add the `goals` case to `src/index.ts` so `hlx goals` is a recognized command.

**What to Build**:

Modify `src/index.ts`:
1. Add import at top: `import { runGoals } from "./goals/index.js";`
2. Add case in switch statement (after `tickets` case, around line 119-122, following exact pattern):
   ```typescript
   case "goals": {
     const config = configOrHelp(args.slice(1));
     await runGoals(config, args.slice(1));
     break;
   }
   ```
3. Add `hlx goals` line to usage text (in the `usage()` function):
   ```
   hlx goals create|list|get|terminate  Manage Goals
   ```

**Verification (AI Agent Runs)**:
- `npm run typecheck` passes
- `goals` case exists in switch statement
- Import for `runGoals` exists
- Usage text includes `hlx goals`

**Success Criteria**:
- Case follows exact `tickets` case pattern (`configOrHelp` + `await runGoals`)
- No other cases modified
- Import uses `.js` extension

---

### Step 7: Update CLI documentation

**Goal**: Add Goals namespace documentation to `src/docs/cli-content.ts`.

**What to Build**:

Modify `src/docs/cli-content.ts`:
1. Add a `### Goals` section to Common Commands (after the Tickets section, before Inspect):
   - Command table: create, list, get, terminate
   - `hlx goals create` flags table
   - `hlx goals list` flags table
2. Add Goals worked examples section (after Tickets examples):
   - Create a goal: `hlx goals create --title "..." --description "..." --repos repo1,repo2`
   - List active goals: `hlx goals list --status ACTIVE`
   - Get goal detail: `hlx goals get <goalId>`
   - Get goal as JSON: `hlx goals get <goalId> --json`
   - Terminate a goal: `hlx goals terminate <goalId> --verdict complete`
3. Add `"goals"` to the `keywords` array

**Verification (AI Agent Runs)**:
- `npm run typecheck` passes
- `cli-content.ts` contains `### Goals` section
- All 4 commands documented
- `keywords` array includes `"goals"`

**Success Criteria**:
- Documentation follows existing Tickets section formatting
- Flag tables match implemented flags
- Worked examples are runnable

---

### Step 8: Run quality gates

**Goal**: Verify the complete implementation passes all quality checks.

**What to Build**: No code changes -- verification only.

**Verification (AI Agent Runs)**:
1. Run `npm run typecheck` in helix-cli -- must exit 0 with zero errors
2. Run `npm run build` in helix-cli -- must succeed (produces `dist/` output)
3. Verify VALID_MODES unchanged: check `src/tickets/create.ts` line 13 is exactly `const VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"] as const;`
4. Verify `src/goals/` contains exactly 5 files: `index.ts`, `create.ts`, `list.ts`, `get.ts`, `terminate.ts`
5. Verify all `.ts` files in `src/goals/` use `.js` extensions in import statements

**Success Criteria**:
- Zero TypeScript errors
- Build produces output in `dist/goals/`
- VALID_MODES is untouched
- All ES module import conventions followed

---

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js >= 18 installed | available | package.json engines field; sandbox environment | CHK-01, CHK-02, CHK-03, CHK-04, CHK-05 |
| npm dependencies installed (`npm install` in helix-cli) | available | package.json devDependencies: typescript, @types/node | CHK-01, CHK-02, CHK-03, CHK-04, CHK-05 |
| TypeScript compiler (`tsc`) available | available | devDependency typescript ^6.0.2 | CHK-01, CHK-02 |
| helix-cli server API key for staging | unknown | Dev setup .env has `HELIX_API_KEY` but may be expired (ticket Section 14 reports 401 errors) | CHK-04, CHK-05 |
| Staging server reachable with Goal API deployed | unknown | Ticket Section 14 confirms server is reachable but API key is expired | CHK-04, CHK-05 |

### Required Checks

[CHK-01] TypeScript typecheck passes
- Action: Run `cd /vercel/sandbox/workspaces/cmphmus0q00gchu0uplff9744/helix-cli && npm run typecheck` to verify all TypeScript compiles with zero errors in strict mode.
- Expected Outcome: Command exits with code 0. Zero type errors reported. All 5 new files in `src/goals/` and 2 modified files compile cleanly.
- Required Evidence: Full command output showing exit code 0 and no error lines.

[CHK-02] Build succeeds and produces output
- Action: Run `cd /vercel/sandbox/workspaces/cmphmus0q00gchu0uplff9744/helix-cli && npm run build` followed by `ls dist/goals/` to verify compiled output exists.
- Expected Outcome: Build exits with code 0. `dist/goals/` directory contains compiled `.js` and `.d.ts` files for all 5 source files (index, create, list, get, terminate).
- Required Evidence: Build command output showing success, and directory listing of `dist/goals/` showing the expected files.

[CHK-03] VALID_MODES remains unchanged
- Action: Read `src/tickets/create.ts` line 13 and verify the VALID_MODES constant. Also search all files in `src/goals/` for any reference to `VALID_MODES`.
- Expected Outcome: Line 13 of `src/tickets/create.ts` contains exactly `const VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"] as const;`. No file in `src/goals/` references `VALID_MODES`.
- Required Evidence: Content of `src/tickets/create.ts` line 13, and search results showing no `VALID_MODES` references in `src/goals/`.

[CHK-04] CLI `hlx goals --help` displays namespace help
- Action: Write the .env file for helix-cli, run `npm install && npm run build` in helix-cli, then execute `node dist/index.js goals --help` to verify the goals namespace is registered and displays help.
- Expected Outcome: The command prints usage text listing all 4 subcommands (create, list, get, terminate) with brief descriptions and exits with code 0.
- Required Evidence: Command output showing all 4 subcommands in the help text.

[CHK-05] CLI `hlx goals create --help` displays create command help
- Action: Run `node dist/index.js goals create --help` in the helix-cli directory.
- Expected Outcome: The command prints usage text showing all flags for the create command (--title, --description, --repos, --max-children, --require-approval, --sprint) and exits with code 0.
- Required Evidence: Command output showing the create subcommand help text with all expected flags.

[CHK-06] ES module import conventions verified
- Action: Search all `.ts` files in `src/goals/` for import statements and verify every local import uses `.js` extension. Also verify no `require()` calls exist.
- Expected Outcome: Every import of a local module (e.g., `../lib/http.js`, `../lib/flags.js`, `./create.js`) uses `.js` extension. No bare specifier imports to local files. No `require()` calls.
- Required Evidence: List of all import statements from all files in `src/goals/` showing `.js` extensions.

[CHK-07] Goals namespace router dispatches correctly
- Action: Read `src/goals/index.ts` and verify it contains a switch statement with cases for `create`, `list`, `get`, `terminate`, and a default case. Verify `runGoals` is exported.
- Expected Outcome: The file exports `runGoals`, contains a switch on the first argument with all 4 subcommand cases, and each case checks `isHelpRequested` before dispatching.
- Required Evidence: File content showing the switch statement with all 4 cases and the export.

[CHK-08] Command registration in main router
- Action: Read `src/index.ts` and verify it imports `runGoals` from `./goals/index.js` and has a `case "goals"` in the switch statement. Verify usage text includes `hlx goals`.
- Expected Outcome: Import statement exists. Case follows the `tickets` pattern: `configOrHelp(args.slice(1))` then `await runGoals(config, args.slice(1))`. Usage text includes a goals line.
- Required Evidence: Relevant lines from `src/index.ts` showing import, case block, and usage text.

[CHK-09] CLI documentation updated
- Action: Read `src/docs/cli-content.ts` and verify it contains a `### Goals` section with command table, flag tables, and worked examples. Verify `keywords` array includes `"goals"`.
- Expected Outcome: Goals section present in the content string with documentation for all 4 commands. Keywords array includes `"goals"`.
- Required Evidence: Relevant sections from `cli-content.ts` showing Goals documentation and updated keywords.

[CHK-10] All API calls use correct basePath and endpoints
- Action: Search all files in `src/goals/` for `hxFetch` calls and verify each uses `basePath: "/api"`. Verify endpoint paths are `/goals` (create, list), `/goals/${goalId}` (get), `/goals/${goalId}/terminate` (terminate).
- Expected Outcome: Every `hxFetch` call includes `basePath: "/api"`. No calls use the default `/api/inspect` basePath. Endpoint paths match the server's route registration.
- Required Evidence: All `hxFetch` call sites from `src/goals/` files showing basePath and path arguments.

---

## Success Metrics

1. All 5 new files created in `src/goals/` following established patterns
2. `src/index.ts` registers the `goals` command
3. `src/docs/cli-content.ts` documents the `hlx goals` namespace
4. `npm run typecheck` exits 0 with zero errors
5. `npm run build` succeeds and produces `dist/goals/` output
6. VALID_MODES in `src/tickets/create.ts` is unchanged
7. `hlx goals --help` prints namespace help text
8. All imports use `.js` extensions (ES module compliance)

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report Section 8) | Primary specification for T7 CLI commands | 4 commands with exact flag specs; VALID_MODES unchanged; docs update required |
| ticket.md (Research Report Section 13, T7) | T7 deliverables checklist | 5 new files in src/goals/, command registration, docs update |
| helix-cli scout/scout-summary.md | Codebase analysis | Confirmed no src/goals/ exists; identified all reference patterns; listed quality gates |
| helix-cli scout/reference-map.json | File inventory and facts | Confirmed server API shapes, hxFetch basePath, flag utilities, ES module constraints |
| helix-cli diagnosis/diagnosis-statement.md | Root cause and scope | Greenfield additive feature; helix-cli only; 9 success criteria |
| helix-cli diagnosis/apl.json | Structured Q&A evidence | Confirmed API contracts, command registration pattern, docs structure |
| helix-cli product/product.md | User scenarios and success criteria | 10 scenarios; --json on list+get; --repos optional; 7 success criteria |
| helix-cli tech-research/tech-research.md | Architecture decisions | 7 decisions: mirror tickets pattern, raw cuid IDs, comma-separated repos, client-side limit, --verdict naming, --json scope, --repos optional |
| helix-cli tech-research/apl.json | Technical resolution | All 5 questions resolved; server pagination absent; repos resolution pattern confirmed |
| repo-guidance.json | Repo intent classification | helix-cli=target, server=context, client=context |
| helix-cli/src/index.ts (direct read) | Command registration pattern | Switch at lines 79-148; configOrHelp; import conventions |
| helix-cli/src/tickets/index.ts (direct read) | Namespace router reference | Switch on subcommand; isHelpRequested checks; extractTicketRef pattern (not needed for goals) |
| helix-cli/src/tickets/create.ts (direct read) | Create command reference | requireFlag, resolveAllRepos, POST body, VALID_MODES at line 13, error handling |
| helix-cli/src/tickets/list.ts (direct read) | List command reference | Query params, hasFlag --json, table output format, client-side filtering |
| helix-cli/src/tickets/get.ts (direct read) | Get command reference | printTicketDetail, formatted output, --json via hasFlag, type definitions |
| helix-cli/src/lib/flags.ts (direct read) | Flag parsing API | getFlag, requireFlag, hasFlag, isHelpRequested -- all 5 utilities verified |
| helix-cli/src/lib/http.ts (direct read) | HTTP client contract | hxFetch signature, basePath defaults to /api/inspect, retry/timeout behavior |
| helix-cli/src/lib/resolve-repo.ts (direct read) | Repo resolution | resolveAllRepos resolves names to IDs; throws Error with available list |
| helix-cli/src/docs/cli-content.ts (direct read) | Documentation structure | Exported object with content markdown, command tables, keywords array |
| helix-cli/package.json (direct read) | Build configuration | ES module (type=module), scripts: build=tsc, typecheck=tsc --noEmit, zero runtime deps |
| helix-cli/tsconfig.json (direct read) | TS configuration | Strict mode, ES2022 target, Node16 modules, rootDir=src, outDir=dist |
