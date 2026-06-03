# Tech Research — Goals Feature Flag (helix-cli)

## Technology Foundation

- **Runtime**: Node.js (TypeScript, compiled with `tsc`)
- **HTTP client**: `hxFetch` in `src/lib/http.ts` — shared fetch wrapper with retry logic, timeout handling, and structured error messages
- **Error flow**: `hxFetch` throws `Error("HTTP {status} {statusText} — {body}")` on non-2xx responses. The CLI's top-level catch (index.ts:157-160) calls `console.error(error.message)`. Some goal commands have local try/catch blocks using `parseApiError` (goals/utils.ts) which extracts the `.error` field from JSON response bodies.
- **CLI routing**: Main entry (`index.ts:124-127`) routes `hlx goals` to `runGoals(config, args)`. `runGoals` (`goals/index.ts:20`) dispatches subcommands via switch statement.

No new dependencies are required. All changes use existing patterns.

## Architecture Decision

### Decision 1: Feature flag handling strategy

**Options considered:**
1. **Pre-flight check** — Before each goals command, call `/auth/me` or `/api/features` to check if Goals is enabled
2. **Reactive error handling** — Catch server 404 responses and display a user-friendly message
3. **CLI-side env var** — Add a local `GOALS_ENABLED` env var to the CLI config

**Chosen**: Option 2 — Reactive error handling.

**Rationale**: The ticket explicitly states "server is the single source of truth." Option 1 adds latency (extra API call per command) and complexity. Option 3 creates dual state that can drift out of sync with the server. Reactive handling is the simplest approach: when the server returns 404 with `"Goals feature is not available."`, the CLI catches it and displays the message. The existing `parseApiError` utility already extracts `.error` from JSON response bodies, so the message surfaces naturally.

### Decision 2: Error catch placement

**Options considered:**
1. **Wrapper try/catch in `runGoals`** — Catch all errors from the switch statement
2. **Individual try/catch in each command file** — Add local catch blocks to `list.ts` and `get.ts` (the two commands missing them)
3. **Modify `hxFetch` to detect 404** — Make the HTTP client feature-flag-aware

**Chosen**: Option 1 — Wrapper try/catch in `runGoals`.

**Rationale**: Currently, `create.ts`, `terminate.ts`, and `resume.ts` have local try/catch blocks with `parseApiError`, but `list.ts` and `get.ts` let errors propagate to the top-level catch in `index.ts:157-160`. The top-level catch shows the raw error message (e.g., `HTTP 404 Not Found — {"error":"Goals feature is not available."}`), which is ugly. A wrapper try/catch in `runGoals` around the switch statement provides consistent error handling for all 5 commands. It catches errors from commands that don't have their own catch (list, get), while commands with local catch blocks (create, terminate, resume) handle their own errors first (via `process.exit(1)` after `console.error`). The wrapper catch uses `parseApiError` to extract the clean error message.

### Decision 3: Goals commands remain in CLI help

**Decision**: Goals commands stay visible in help output and documentation regardless of flag state.

**Rationale**: The CLI is a thin client — it doesn't know the server's feature flag state until a request is made. Removing commands from help would require a pre-flight check, adding latency. Keeping commands visible with clear server-side error messages is simpler and matches the product spec: "Goals commands remain in CLI help/docs."

## Core API/Methods

| Component | Method/Location | Change |
|-----------|----------------|--------|
| `goals/index.ts` | `runGoals` function | Add try/catch wrapper around switch statement with `parseApiError` |

## Technical Decisions (including rejected alternatives)

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Flag strategy | Reactive error handling | Pre-flight check; CLI-side env var | Server is source of truth; no extra API call; no state drift |
| Catch placement | Wrapper in `runGoals` | Per-command catch; modify hxFetch | Consistent for all 5 commands; no changes to shared HTTP client |
| Help visibility | Commands always shown | Conditional help based on server state | Avoids pre-flight latency; matches product spec |

## Technical Checks

[TCK-01] Goals error handling wrapper
- Decision Reference: "Wrapper try/catch in runGoals" (Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: `runGoals` function in `goals/index.ts` wraps the switch statement body in a try/catch. The catch block uses `parseApiError` to extract the error message and displays it via `console.error`. When the server returns `{ error: "Goals feature is not available." }`, the CLI displays `Error: Goals feature is not available.` (not the raw HTTP error format).

[TCK-02] Existing goal commands unaffected
- Decision Reference: "Commands with local catch blocks handle their own errors first" (Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: `create.ts`, `terminate.ts`, and `resume.ts` retain their existing try/catch blocks with `parseApiError`. These inner catch blocks fire before the outer `runGoals` wrapper for errors in those commands. The `list.ts` and `get.ts` commands (which lack local catch blocks) are now covered by the wrapper.

## Cross-Platform Considerations

The CLI is a Node.js tool that communicates with the server via HTTP. It has no direct relationship with the client (React web app). The feature flag strategy is purely reactive:

1. User runs `hlx goals <command>`
2. CLI sends HTTP request to server's `/api/goals/...` endpoint
3. If goals is disabled, server returns `HTTP 404 { "error": "Goals feature is not available." }`
4. `hxFetch` throws an error (404 is not retried — not in RETRYABLE_STATUS_CODES)
5. `runGoals` wrapper catch extracts the message via `parseApiError`
6. CLI displays: `Error: Goals feature is not available.`

## Performance Expectations

- **No added latency**: No pre-flight check. The error handling is purely catch-path, adding zero overhead to the success path.
- **No retry for 404**: `hxFetch` RETRYABLE_STATUS_CODES is `[429, 500, 502, 503, 504]`. A 404 response is not retried, so the CLI fails fast.

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| `parseApiError` | Internal utility | Available (goals/utils.ts:10-25) |
| `hxFetch` error format | Internal convention | Documented (HTTP {status} {statusText} — {body}) |

No new npm packages required.

## Deferred to Round 2

- CLI-side feature flag pre-check (unnecessary for current scope)
- Hiding goals commands from help when disabled (requires pre-flight)
- Custom error codes from server for feature-disabled responses

## Summary Table

| Aspect | Detail |
|--------|--------|
| Strategy | Reactive error handling (catch 404 from server) |
| Change scope | Add try/catch wrapper in `runGoals` (goals/index.ts) |
| Files changed | `goals/index.ts` |
| New files | None |
| Dependencies | None (uses existing parseApiError) |
| Risk | Minimal — adds error handling wrapper only; no changes to existing command logic |

## APL Statement Reference

See `tech-research/apl.json` — all questions resolved, no open followups.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope and intent | CLI must handle disabled Goals gracefully |
| diagnosis/diagnosis-statement.md (cli) | Root cause | 5 goals commands always available; no feature-flag handling |
| diagnosis/apl.json (cli) | Investigation findings | Reactive handling is simplest; CLI should not maintain flag state |
| product/product.md | Product requirements | SCN-06: CLI shows "Goals feature is not enabled" instead of raw error; SCN-07: works normally when enabled |
| scout/reference-map.json (cli) | File map and code facts | Identified command files, error utility, dispatch pattern |
| scout/scout-summary.md (cli) | CLI surface analysis | 5 commands, no feature flag mechanism, generic error parsing |
| repo-guidance.json | Repo roles | CLI must gracefully handle 404 responses from disabled goal endpoints |
| src/goals/index.ts (direct read) | Verify dispatch structure | runGoals dispatches 5 subcommands via switch; no try/catch wrapper |
| src/goals/utils.ts (direct read) | Verify error utility | parseApiError extracts .error from JSON response body |
| src/goals/list.ts (direct read) | Verify error handling gap | No try/catch — errors propagate to top-level handler |
| src/goals/get.ts (direct read) | Verify error handling gap | No try/catch — errors propagate to top-level handler |
| src/goals/create.ts (direct read) | Verify existing try/catch | Has local try/catch with parseApiError and process.exit(1) |
| src/lib/http.ts (direct read) | Verify error format and retry logic | hxFetch throws formatted error; 404 not in RETRYABLE_STATUS_CODES |
| src/index.ts (direct read) | Verify top-level error handler | Lines 157-160: catch → console.error(error.message) → process.exit(1) |
