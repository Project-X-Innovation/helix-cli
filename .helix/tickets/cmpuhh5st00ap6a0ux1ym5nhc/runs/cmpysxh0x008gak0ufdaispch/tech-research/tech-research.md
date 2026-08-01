# Tech Research: ns-gm Server-Side Decomposition (helix-cli)

## Technology Foundation

- **Runtime:** Node.js with TypeScript (strict mode, ES2022 target, Node16 module resolution)
- **Build:** `tsc` (no bundler)
- **Test:** Node.js built-in test runner (`tsc && node --test dist/**/*.test.js`)
- **HTTP transport:** `hxFetch()` in `src/lib/http.ts` -- dual-mode auth (hxi_ API keys via X-API-Key or Bearer tokens via Authorization), 3-attempt retry with exponential backoff on 429/5xx, 30s timeout, Retry-After header support
- **CLI parsing:** Custom flag/positional parsing in `src/lib/flags.ts` (getFlag, hasFlag, getPositionalArgs, isHelpRequested)
- **Repo resolution:** `resolveRepo()` in `src/lib/resolve-repo.ts` -- exact ID -> exact name -> partial substring matching

No new dependencies needed. Zero runtime dependencies (only @types/node and typescript as devDeps).

---

## Architecture Decisions

### AD-1: hlx inspect netsuite -- Inspect router extension with SuiteQL + logs modes

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Single netsuite case with --logs flag | One case in inspect router; --logs flag switches between SuiteQL and log retrieval | Covers both modes; minimal routing changes | Slightly more complex flag parsing |
| B. Separate netsuite-query and netsuite-logs cases | Two switch cases and two handler files | Clean separation | More files and routes than needed |
| C. Nested sub-subcommands | `hlx inspect netsuite query` and `hlx inspect netsuite logs` | Most explicit | Over-engineers the CLI for two modes |

**Chosen:** Option A -- Single netsuite case with `--logs` flag.

**Rationale:** The server uses a single endpoint `POST /api/inspect/:repoId/netsuite` with a `type` discriminator (helix-global-server AD-5). The CLI mirrors this: default mode is SuiteQL query, `--logs` flag switches to log retrieval. The handler sends `{ type: 'query', query }` or `{ type: 'logs', scriptId, dateFrom, ... }` based on the flag. This follows the existing `logs.ts` pattern where optional flags modify the request body.

**New file:** `src/inspect/netsuite.ts` (~20 lines for both modes)

**SuiteQL mode (default):**
```
hlx inspect netsuite --repo <name> --query "<SuiteQL>"
hlx inspect netsuite --repo <name> --query-file <path>
hlx inspect netsuite --repo <name> "<SuiteQL>"     # positional
```

**Log retrieval mode (--logs flag):**
```
hlx inspect netsuite --repo <name> --logs --script-id <id> [--date-from <date>] [--date-to <date>] [--log-type <type>]
```

---

### AD-2: hlx run -- New top-level command for SuiteScript execution

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. New top-level case in main dispatcher | `case "run"` at src/index.ts alongside inspect/comments/preview | Clean separation from inspect; matches governance distinction | New directory src/run/ |
| B. Sub-subcommand under inspect | `hlx inspect run` | No new top-level command | Confusing: "inspect run" implies read-only, but it's arbitrary execution |
| C. Sub-subcommand under netsuite | `hlx inspect netsuite run` | Groups NetSuite operations | Too deeply nested; doesn't match `hlx run` in product spec |

**Chosen:** Option A -- New top-level command.

**Rationale:** The continuation context defines `hlx run` as a top-level command with distinct governance from `hlx inspect`. The product spec explicitly names it `hlx run`, not `hlx inspect run`. From the agent's perspective, `hlx run` signals "execute arbitrary code" while `hlx inspect` signals "read-only data access." This governance distinction should be reflected in the CLI hierarchy.

**New directory + file:** `src/run/index.ts`

**Interface:**
```
hlx run --repo <name> "<code>"                    # inline SuiteScript
hlx run --repo <name> --script-file <path>        # code from file
hlx run --repo <name> --script-file <path> --modules query,record  # optional modules
```

**Implementation:** The handler function follows the established pattern:
```
1. resolveRepo(config, repoNameOrId)
2. hxFetch(config, `/${repoId}/run`, { method: 'POST', body: { code, modules? } })
3. console.log(JSON.stringify(result, null, 2))
```

Both hlx run and hlx inspect netsuite use the default basePath `/api/inspect` because the server routes both surfaces under the inspect prefix (helix-global-server AD-1). No basePath override needed.

---

### AD-3: No environment flag

**Decision:** Neither command exposes an `--env` flag.

**Rationale:** Environment (PRODUCTION vs SANDBOX) is cryptographically bound via the `nsEnv` claim in the inspection token (helix-global-server AD-3). The server sets this claim based on the workflow step. The CLI cannot override it. Exposing a flag would be misleading -- the server ignores client-specified environments. A human-facing `--env` flag is a future consideration (out of MVP scope).

---

### AD-4: Main dispatcher integration for hlx run

**Chosen:** Add `case "run"` to src/index.ts switch (between existing cases, before `default` at L153):
```typescript
case "run": {
  const config = configOrHelp(args.slice(1));
  await runRun(config, args.slice(1));
  break;
}
```

**Rationale:** Follows the exact pattern of `case "inspect"` (L90-93), `case "comments"` (L96-99), etc. The `configOrHelp` function (L26-35) handles `--help` detection and auth loading. Import `runRun` from `./run/index.js`.

---

### AD-5: Help text updates

**Files to update:**
1. `src/inspect/index.ts` -- Add `hlx inspect netsuite` lines to `inspectUsage()` (L9-31) and add `case "netsuite"` to switch (after `case "api"` at L109)
2. `src/run/index.ts` -- New file with `runRun()` function including help text
3. `src/index.ts` -- Add `run` to the top-level `usage()` function's command list (L37-67)

---

## Core API/Methods

### New: `cmdNetsuite()` (src/inspect/netsuite.ts)

```
Input: config (HxConfig), repoNameOrId (string), body (query body or logs body)
Flow:
  1. resolveRepo(config, repoNameOrId) -- resolve name to ID
  2. hxFetch(config, `/${repoId}/netsuite`, { method: "POST", body })
  3. console.log(JSON.stringify(result, null, 2))
```

The body is constructed by the caller (the netsuite case in the inspect router):
- SuiteQL: `{ type: 'query', query: '<sql>' }`
- Logs: `{ type: 'logs', scriptId: '...', dateFrom: '...', ... }`

### New: `runRun()` (src/run/index.ts)

```
Input: config (HxConfig), args (string[])
Flow:
  1. Parse --help (show usage and exit)
  2. Parse --repo flag (required)
  3. Parse --script-file flag OR positional code argument
  4. Parse --modules flag (optional, comma-separated -> string[])
  5. resolveRepo(config, repo)
  6. hxFetch(config, `/${repoId}/run`, { method: "POST", body: { code, modules? } })
  7. console.log(JSON.stringify(result, null, 2))
```

### Modified: `runInspect()` (src/inspect/index.ts)

Add `case "netsuite"` in the switch at L41:
1. Check `isHelpRequested(rest)` -- show netsuite help
2. Parse `--repo` flag
3. Check for `--logs` flag -> log retrieval mode
4. If not --logs: parse `--query`, `--query-file`, or positional -> SuiteQL mode
5. Call `cmdNetsuite(config, repo, body)`

### Modified: `inspectUsage()` (src/inspect/index.ts)

Add to usage string:
```
  hlx inspect netsuite --repo <name> "<SuiteQL>"
  hlx inspect netsuite --repo <name> --query-file <path>
  hlx inspect netsuite --repo <name> --logs --script-id <id>
```

---

## Technical Decisions (including rejected alternatives)

### TD-1: No client-side query validation

**Decision:** The CLI does not validate SuiteQL queries or SuiteScript code before sending to the server.

**Rationale:** All validation (assertReadOnlyQuery for inspect, no validation for run) happens server-side. The CLI is a thin transport layer. Adding client-side validation would duplicate logic and could get out of sync with server-side rules.

### TD-2: Error display follows existing pattern

**Decision:** On HTTP errors, `hxFetch()` throws and the error propagates to the CLI's top-level catch handler (src/index.ts:157-159).

**Rationale:** The existing error handling covers all needed cases: 429 (rate limit, retried with Retry-After), 401 (auth error), 5xx (server error, retried). The server translates NetSuite-specific errors into HTTP errors with descriptive messages. No CLI-side translation needed.

### TD-3: --modules flag as comma-separated string

**Decision:** `--modules query,record,search` splits on comma to produce `["query", "record", "search"]`.

**Rationale:** Simple, avoids needing multiple `--module` flags. The RESTlet defaults to all modules if none specified, so `--modules` is optional.

**Rejected:** Multiple `--module` flags (e.g., `--module query --module record`). More complex parsing for no benefit.

### TD-4: --script-file for hlx run mirrors --query-file for inspect

**Decision:** `hlx run --script-file <path>` reads SuiteScript code from a file, following the same `readFileSync` + error handling pattern as `--query-file` in the inspect db case (src/inspect/index.ts:74-84).

**Rationale:** Complex SuiteScript with multi-line code, template literals, and special characters is difficult to pass as a shell argument. File-based input avoids all quoting issues.

### TD-5: 30s timeout is acceptable for MVP

**Decision:** Use the existing 30s `REQUEST_TIMEOUT_MS` from hxFetch (http.ts:5) for both commands. No custom timeout support.

**Rationale:** The server-side RESTlet timeout is 25s (helix-global-server TD-6), leaving ~5s headroom. Most SuiteQL queries complete in <2s. A `--timeout` flag is deferred to Round 2 for long-running SuiteScript that may need more time.

---

## Technical Checks

[TCK-01] hlx inspect netsuite dispatches correctly for SuiteQL queries
- Decision Reference: "Inspect router extension" (AD-1)
- Verification Method: code-inspection
- Expected Evidence: `src/inspect/index.ts` has `case "netsuite"` in the switch. The case parses --repo and --query/--query-file flags, constructs `{ type: 'query', query }` body, calls `cmdNetsuite()`. `src/inspect/netsuite.ts` exists and follows the db.ts pattern.

[TCK-02] hlx inspect netsuite dispatches correctly for log retrieval
- Decision Reference: "Inspect router extension with --logs mode" (AD-1)
- Verification Method: code-inspection
- Expected Evidence: When `--logs` flag is present, the netsuite case constructs `{ type: 'logs', scriptId, dateFrom, dateTo, logType }` body from parsed flags and calls `cmdNetsuite()`.

[TCK-03] hlx run top-level command exists
- Decision Reference: "New top-level command" (AD-2)
- Verification Method: code-inspection
- Expected Evidence: `src/index.ts` has `case "run"` in the main switch. `src/run/index.ts` exists with `runRun()` function. The function parses --repo, --script-file/positional code, optional --modules, and calls hxFetch POST to `/${repoId}/run`.

[TCK-04] Both commands use default basePath
- Decision Reference: "Default basePath /api/inspect" (AD-2 rationale)
- Verification Method: code-inspection
- Expected Evidence: Neither `cmdNetsuite()` nor `runRun()` pass a `basePath` option to `hxFetch()`. Both use the default `/api/inspect` basePath.

[TCK-05] Help text updated for both commands
- Decision Reference: "Help text updates" (AD-5)
- Verification Method: code-inspection
- Expected Evidence: `inspectUsage()` includes netsuite lines. `runRun()` has help text for `hlx run`. The top-level `usage()` in index.ts includes `run`.

---

## Cross-Platform Considerations

Not applicable. The CLI runs in Node.js sandboxes. No browser/mobile considerations.

---

## Performance Expectations

| Metric | Expected | Basis |
|--------|----------|-------|
| CLI overhead | <50ms | resolveRepo() is a single HTTP call; main latency is server-side |
| End-to-end SuiteQL latency | 1-4s | Server-side OAuth2 + RESTlet call dominates |
| End-to-end SuiteScript latency | 1-10s | Depends on script complexity; server has 25s RESTlet timeout |
| Retry behavior | 3 attempts on 429/5xx | Existing hxFetch retry logic; hxFetch uses REQUEST_TIMEOUT_MS=30s per attempt |

---

## Dependencies

| Dependency | Type | Status | Risk |
|------------|------|--------|------|
| `hxFetch()` | Internal function | Available | None -- existing transport layer |
| `resolveRepo()` | Internal function | Available | None -- existing repo resolution |
| `getFlag()` / `getPositionalArgs()` / `hasFlag()` | Internal functions | Available | None -- existing flag parsing |
| `readFileSync` | Node.js built-in | Available | None -- used for --query-file/--script-file |
| Server endpoint `POST /inspect/:repoId/netsuite` | External (helix-global-server) | Must deploy together | Coordinated release required |
| Server endpoint `POST /inspect/:repoId/run` | External (helix-global-server) | Must deploy together | Coordinated release required |

---

## Deferred to Round 2

1. **Human CLI `--env` flag** -- For non-agent users who want environment selection within token authorization.
2. **`--timeout` flag** -- Custom timeout for long-running SuiteScript execution (current default is 30s in hxFetch).
3. **`--params` flag** -- JSON input parameters for parameterized SuiteScript execution.
4. **Rich output formatting** -- Table mode for query results (currently JSON only).
5. **Tab completion** -- Shell completion for subcommands and flags.
6. **Interactive query mode** -- REPL-like interface for multiple sequential queries.

---

## Summary Table

| Area | Decision | Key Tradeoff |
|------|----------|--------------|
| Inspect netsuite scope | SuiteQL + log retrieval via --logs flag (AD-1) | Single handler simplicity vs separate subcommands |
| hlx run location | Top-level command, not under inspect (AD-2) | Governance clarity vs command proliferation |
| Environment flag | Not exposed (AD-3) | Security (server-enforced) vs CLI flexibility |
| basePath | Default /api/inspect for both (AD-2) | Consistency with server routing vs semantic mismatch |
| Error handling | Reuse hxFetch pipeline (TD-2) | Consistency vs NetSuite-specific messages |
| Modules flag | Comma-separated --modules (TD-3) | Simplicity vs multiple flag instances |
| File input | --script-file / --query-file (TD-4) | Quoting avoidance vs file management |
| Timeout | 30s default, no custom flag (TD-5) | Simplicity vs long-running script support |

---

## APL Statement Reference

See tech-research/apl.json. Five questions answered with evidence. All followups resolved.

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Continuation Context) | Two-surface scope and CLI requirements | hlx inspect netsuite + hlx run; both surfaces in one effort; env is token-bounded |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change mapping | Two new commands; no auth/config changes; db.ts as template |
| diagnosis/apl.json (helix-cli) | 4 diagnostic questions with evidence | Command dispatch, inspect router, HTTP client basePath, env flag design |
| product/product.md (helix-cli) | CLI product requirements | Success criteria, user scenarios |
| scout/reference-map.json (helix-cli) | File inventory | src/run/ does not exist; no 'run' case confirmed |
| scout/scout-summary.md (helix-cli) | Architecture overview | Handler is 10-14 lines; hxFetch supports basePath override; zero deps |
| src/inspect/index.ts (direct read, L1-130) | Router implementation verification | switch/case at L41; --query-file at L74-84; help at L9-31 |
| src/inspect/db.ts (direct read, L1-12) | Handler template verification | resolveRepo -> hxFetch POST /{repoId}/database -> console.log |
| src/lib/http.ts (direct read, L1-135) | Transport layer verification | basePath defaults '/api/inspect' at L43; dual-mode auth at L53-57; 30s timeout at L5; 3-attempt retry |
| src/index.ts (direct read, L25-159) | Main dispatcher verification | configOrHelp at L26-35; no 'run' case; 'inspect' at L90-93 |
| helix-global-server tech-research AD-1 | Server route structure | Both surfaces under /api/inspect/ -- default basePath works for both |
| helix-global-server tech-research AD-5 | Endpoint body schema | type discriminator: { type: 'query', query } or { type: 'logs', ... } |
| helix-global-server tech-research TD-6 | Server timeout | 25s RESTlet timeout; 15s OAuth2 timeout -- fits within CLI's 30s |
| repo-guidance.json | Repo intent | helix-cli = target (secondary) |
