# Tech Research: Playbook Check CLI Commands

## Technology Foundation

- **Runtime**: Node.js + TypeScript, compiled to JS via `tsc`
- **Dependencies**: Zero external dependencies (only @types/node and typescript as devDeps)
- **HTTP**: Native fetch wrapped in `hxFetch` (src/lib/http.ts) with retries, auth, basePath
- **Test**: Node.js built-in `node:test`, compiled first then run via `node --test dist/**/*.test.js`

## Architecture Decision 1: Command Group Structure

### Options Considered

**Option A: New src/playbook/ directory following goals/ pattern (chosen)**
Create `index.ts` (router), `check.ts` (trigger+poll), `checks.ts` (list).

**Option B: Single src/playbook.ts file**
Put all playbook logic in one file.

### Chosen: Option A — Separate command group directory

**Rationale**: Follows the established pattern (goals/, tickets/, library/). Each subcommand in its own file enables focused testing and maintenance. The router in index.ts provides help text and error handling via switch-based dispatch.

**New files**:
- `src/playbook/index.ts` — Router dispatching `check` and `checks` subcommands
- `src/playbook/check.ts` — Trigger + poll + display result
- `src/playbook/checks.ts` — List check history

**Dispatcher entry in src/index.ts**: Add `playbook` case to L81-156 switch, following the `goals` pattern with `configOrHelp`.

## Architecture Decision 2: Polling Strategy

### Options Considered

**Option A: Fixed-interval delay loop (chosen)**
Sleep 5 seconds, GET status, check for terminal state, repeat.

**Option B: Exponential backoff**
Start at 2s, double each iteration.

**Option C: Configurable --interval flag**
Let users control the polling interval.

### Chosen: Option A — Fixed 5-second interval

**Rationale**: Checks typically take 1-5 minutes. A 5-second interval provides responsive feedback (~12 checks per minute) without excessive API load. Exponential backoff would make early checks fast but late checks sluggish. A configurable flag adds complexity for minimal benefit.

**Implementation**:
```
POST /playbook/rules/:ruleId/check -> get check reference
loop:
  sleep(5000)
  GET /playbook/rules/:ruleId/checks/:checkId
  if status in [PASS, FAIL, ERROR]: break
  if elapsed > 600000 (10 min): timeout warning, break
print result
```

**Timeout**: 10 minutes (600 seconds). If exceeded, print a warning with the check ID so the user can poll manually later.

## Architecture Decision 3: Rule-ref Resolution

### Options Considered

**Option A: Accept raw rule ID directly (chosen)**
User provides the full rule ID as a positional argument.

**Option B: Prefix matching via list endpoint**
Fetch all rules, match by ID prefix.

**Option C: Name-based lookup**
Match rules by summary text.

### Chosen: Option A — Accept raw rule ID

**Rationale**: Consistent with `hlx goals get <goalId>` which accepts a raw ID. Simplest implementation with no ambiguity. Users can use `hlx playbook checks <ruleId>` (list) to discover rule IDs. Prefix matching can be added later if UX feedback warrants it.

## Architecture Decision 4: Output Formatting

### Design

**Check result display** (terminal state):
- Status: PASS/FAIL/ERROR with visual indicator
- Interpretation: Full text
- Compliance rate: Percentage
- Counts: Compliant / Violating / Total
- Examples: Truncated list of compliant and violating examples

**Check history display** (list):
- Table format with padEnd() alignment (following goals/list.ts pattern)
- Columns: ID (truncated), Status, Compliance Rate, Checked At
- Newest first

**--json flag**: Both commands support `--json` for machine-readable output, printing the raw API response.

## Core API/Methods

| File | Function | API Call | Purpose |
|------|----------|----------|---------|
| `check.ts` | `cmdPlaybookCheck` | POST `/playbook/rules/:ruleId/check` then GET `/playbook/rules/:ruleId/checks/:checkId` | Trigger + poll + display |
| `checks.ts` | `cmdPlaybookChecks` | GET `/playbook/rules/:ruleId/checks` | List history |

All API calls use `hxFetch(config, path, { basePath: "/api" })`.

## Technical Decisions

### Rejected: Server-Sent Events for real-time updates
Over-engineered for a CLI use case. Simple polling is adequate for check durations.

### Rejected: Parallel polling of multiple checks
Ticket mandates one check = one rule. No batching in the CLI.

### Rejected: --timeout and --interval CLI flags
Adds complexity for minimal benefit. Fixed defaults (5s interval, 10min timeout) are reasonable. Can be added later.

## Technical Checks

[TCK-01] CLI polling loop exits on terminal status
- Decision Reference: "Fixed 5-second interval with terminal detection"
  (from Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: `check.ts` contains a loop that GETs the check status, breaks when status is PASS/FAIL/ERROR, and has a timeout guard at ~10 minutes.

[TCK-02] CLI uses hxFetch with basePath '/api'
- Decision Reference: "All API calls use hxFetch with basePath: '/api'"
  (from Core API/Methods)
- Verification Method: code-inspection
- Expected Evidence: All hxFetch calls in src/playbook/ use `basePath: "/api"`, not the default `/api/inspect`.

[TCK-03] CLI prints interpretation, counts, and examples on completion
- Decision Reference: "Print interpretation, counts, compliance rate, examples"
  (from Architecture Decision 4)
- Verification Method: code-inspection
- Expected Evidence: On terminal PASS/FAIL, the output includes interpretation text, compliant/violating counts, compliance rate, and example records.

## Performance Expectations

- **Trigger response**: Sub-second (single POST)
- **Polling overhead**: ~12 requests per minute during polling. Well within API rate limits.
- **Total command duration**: 1-5 minutes typical, 10-minute maximum.

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| `hxFetch` | Existing | HTTP client with retries and auth |
| `getFlag`, `hasFlag`, `getPositionalArgs` | Existing | Argument parsing |
| `parseApiError` | Existing (goals/utils.ts) | Error message extraction |
| `configOrHelp` | Existing (index.ts) | Config loading pattern |
| Server playbook check endpoints | New (this ticket) | CLI depends on server API |

## Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Server endpoints not ready when CLI is built | Low | CLI compiles independently; runtime errors are handled by parseApiError |
| 2 | 30-second hxFetch timeout may interfere with long polling | Low | Each poll request is a lightweight GET; 30s is more than adequate |

## Deferred to Round 2

- Prefix-based rule-ref resolution
- Configurable polling interval and timeout
- Color/emoji formatting for PASS/FAIL status
- Progress spinner during polling

## Summary Table

| Aspect | Decision |
|--------|----------|
| Command group | `src/playbook/` with index.ts, check.ts, checks.ts |
| Dispatcher | `playbook` case in src/index.ts switch |
| Polling | 5-second fixed interval, 10-minute timeout |
| Rule-ref | Raw rule ID (consistent with goals/get) |
| Output | Formatted text + --json support |
| API base path | `/api` (not `/api/inspect`) |

## APL Statement Reference

See `tech-research/apl.json` for the full APL trace.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Primary specification | CLI must trigger+poll check, list history, print interpretation/counts/examples |
| `diagnosis/diagnosis-statement.md` (CLI) | Root cause | Zero playbook code; first polling pattern; goals/ structure model |
| `diagnosis/apl.json` (CLI) | Design Q&A | Command structure, polling approach, rule-ref resolution |
| `scout/reference-map.json` (CLI) | File inventory | Goals/ pattern reference; hxFetch with basePath: '/api'; no polling exists |
| `scout/scout-summary.md` (CLI) | Analysis | New command group needed; polling is new behavior |
| `product/product.md` | Product requirements | CLI scenarios SCN-07 and SCN-08; success criteria 3 |
| `src/index.ts` L81-156 | CLI dispatcher pattern | Switch-based dispatch with configOrHelp |
| `src/goals/index.ts` | Command group pattern | Switch-based routing, help text, parseApiError |
| `src/lib/http.ts` | HTTP client | hxFetch API, basePath, retries, 30s timeout |
| `repo-guidance.json` | Repo intent | CLI is target repo |
