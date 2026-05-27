# Tech Research: Resume PAUSED Goals — helix-cli

## Technology Foundation

- **Runtime**: Node.js, TypeScript
- **HTTP**: `hxFetch` utility for API calls (src/lib/http.js)
- **CLI structure**: Command router pattern with switch statement in goals/index.ts
- **Quality gates**: `npm run typecheck` (tsc --noEmit), `npm run build` (tsc), `npm test` (tsc && node --test)

No new dependencies are required. The feature uses only existing patterns and libraries.

## Architecture Decision

### Options Considered

**Option A: New resume.ts file following terminate.ts pattern**
- New `src/goals/resume.ts` with `cmdGoalsResume(config, goalId)` function
- POST to `/api/goals/:id/resume` with empty body
- New 'resume' case in goals/index.ts switch
- Updated CLI docs in cli-content.ts

**Option B: Extend terminate.ts to handle both terminate and resume**
- Add a `--action resume|terminate` flag to the existing terminate command
- Conflates two distinct lifecycle actions into one command
- Confusing UX: `hlx goals terminate <goalId> --action resume`

### Chosen Option: A — New resume.ts file

**Rationale**: The CLI follows a one-file-per-command pattern (create.ts, list.ts, get.ts, terminate.ts). Resume is a distinct lifecycle action and deserves its own file. The terminate.ts command (src/goals/terminate.ts) provides the exact structure to follow: parse goalId, POST to endpoint, display result. Resume is even simpler since it has no flags.

## Core API/Methods

### Command: `cmdGoalsResume(config, goalId)`

```
Input:  config: HxConfig, goalId: string
Output: console output (goal ID, title, status)
Flow:
  1. hxFetch(config, `/goals/${goalId}/resume`, { method: "POST", body: {}, basePath: "/api" })
  2. Display goal ID, title, and updated status
  3. On error: parseApiError and exit(1)
```

Pattern source: `cmdGoalsTerminate` (src/goals/terminate.ts)

### Switch case in goals/index.ts

```
case "resume": {
  // help check
  // validate goalId
  await cmdGoalsResume(config, goalId);
  break;
}
```

## Technical Decisions

### 1. Resume command has no flags
- **Decision**: `hlx goals resume <goalId>` — no flags
- **Rationale**: The server endpoint accepts no request body. Unlike terminate (which needs `--verdict`), resume is a simple action. goalId is the only argument.
- **Rejected alternative**: Add `--force` flag — server doesn't support it, and it would bypass safety bounds.

### 2. Response display shows goal ID, title, and status
- **Decision**: Display `Goal resumed:` with ID, Title, Status lines
- **Rationale**: Follows the terminate.ts display pattern but without the Verdict line (resume has no verdict). The server returns `{ ok: true }`, but the CLI should fetch the goal to display its current state — or just display a confirmation. Since the server returns `{ ok: true }` (not the goal), the CLI will display a simple confirmation message.
- **Clarification**: The CLI needs to handle the `{ ok: true }` response shape. It can display "Goal resumed successfully" with just the goalId, or it can make a separate GET call. Following simplicity, just display the confirmation.

### 3. POST body is empty object
- **Decision**: `body: {}` in the hxFetch call
- **Rationale**: The server expects POST with no body. The `hxFetch` utility may require a body parameter. An empty object is safe.

### 4. CLI docs updated in cli-content.ts
- **Decision**: Add `hlx goals resume <goalId>` to the goals command table and add an example section
- **Rationale**: The CLI docs (src/docs/cli-content.ts) serve as the built-in help reference. All other goals commands are documented there.

## Technical Checks

[TCK-01] resume.ts implements POST /goals/:id/resume correctly
- Decision Reference: "New resume.ts file following terminate.ts pattern" (Architecture Decision, Option A)
- Verification Method: code-inspection
- Expected Evidence: src/goals/resume.ts exports `cmdGoalsResume(config, goalId)` that calls `hxFetch(config, \`/goals/${goalId}/resume\`, { method: "POST", basePath: "/api" })` and displays a confirmation message.

[TCK-02] goals/index.ts switch includes resume case
- Decision Reference: "Switch case in goals/index.ts"
- Verification Method: code-inspection
- Expected Evidence: goals/index.ts has a `case "resume":` that validates goalId and calls `cmdGoalsResume`. The usage string includes the resume command.

[TCK-03] CLI docs updated with resume command
- Decision Reference: "CLI docs updated in cli-content.ts"
- Verification Method: code-inspection
- Expected Evidence: src/docs/cli-content.ts goals table includes `hlx goals resume <goalId>` entry and a usage example.

[TCK-04] Quality gates pass
- Decision Reference: All changes must pass quality gates (product success criteria #4)
- Verification Method: behavioral
- Expected Evidence: `npm run typecheck` and `npm run build` pass with zero errors.

## Cross-Platform Considerations

Not applicable — Node.js CLI, platform-independent.

## Performance Expectations

- **Command latency**: Single HTTP POST, sub-100ms server response
- **No local state**: Resume is stateless — no local caching or retry logic

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| Server POST /goals/:id/resume endpoint | External API | New (built in helix-global-server) |
| hxFetch utility | Internal | Already exists (src/lib/http.js) |
| parseApiError utility | Internal | Already exists (src/goals/utils.js) |
| HxConfig type | Internal | Already exists (src/lib/config.js) |

No new external packages.

## Deferred to Round 2

- **Resume with pre-check**: Display current goal status before resuming (requires GET then POST)
- **Batch resume via CLI**: `hlx goals resume --all-paused` to resume all paused goals

## Summary Table

| Aspect | Decision |
|--------|----------|
| New file | src/goals/resume.ts |
| Command | `hlx goals resume <goalId>` |
| Flags | None |
| HTTP | POST /goals/:id/resume with empty body |
| Display | Confirmation message with goalId |
| Switch case | New 'resume' case in goals/index.ts |
| Docs | Updated cli-content.ts goals table + example |

## APL Statement Reference

See tech-research/apl.json. All questions resolved. No open followups.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (cli) | Ticket context | User wants pause/resume; CLI needs resume command |
| diagnosis/diagnosis-statement.md (cli) | CLI root cause | No resume command; terminate.ts is pattern; switch needs new case |
| diagnosis/apl.json (cli) | CLI diagnosis | 4 goals subcommands; terminate.ts POST pattern |
| product/product.md (cli) | Product requirements | `hlx goals resume <goalId>` command required |
| scout/scout-summary.md (cli) | CLI analysis | goals/index.ts switch, terminate.ts pattern, cli-content.ts docs |
| scout/reference-map.json (cli) | File mapping | 4 relevant files identified |
| src/goals/terminate.ts | Direct code inspection | Verified POST pattern: hxFetch, parseApiError, console output |
| src/goals/index.ts | Direct code inspection | Verified switch structure, help check, goalId validation pattern |
| src/docs/cli-content.ts | Direct code inspection | Verified goals command table (lines 135-171) and examples (lines 288-319) |
