# Tech Research: Server-Side ns-gm Migration (helix-cli)

## Technology Foundation

- **Runtime:** Node.js with TypeScript (strict mode, ES2022 target)
- **Build:** `tsc` (no bundler)
- **Test:** Node.js built-in test runner (`node --test`)
- **HTTP transport:** `hxFetch()` in `src/lib/http.ts` — handles auth (hxi_ API keys via X-API-Key or Bearer tokens via Authorization), retry (3 attempts, exponential backoff on 429/5xx), 30s timeout
- **CLI parsing:** Custom flag/positional parsing in `src/lib/flags.ts`
- **Repo resolution:** `resolveRepo()` in `src/lib/resolve-repo.ts` — name-to-ID resolution

No new dependencies needed. All existing infrastructure is reusable as-is.

---

## Architecture Decisions

### AD-1: New netsuite subcommand — Follow the db.ts template exactly

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Single netsuite subcommand for SuiteQL queries | New `src/inspect/netsuite.ts` following `db.ts` pattern | Consistent, minimal, covers MVP use case | Future operations (saved search, record read) would need additional subcommands |
| B. Multiple NetSuite subcommands (suiteql, search, record) | Separate handlers for each operation type | Future-proof | Over-engineering for MVP; server only supports SuiteQL initially |
| C. Generic netsuite subcommand with --type flag | Single command with type parameter | Flexible | Adds complexity without current need |

**Chosen:** Option A — Single `netsuite` subcommand for SuiteQL queries.

**Rationale:** The server-side proxy MVP supports SuiteQL queries only (see helix-global-server tech-research AD-5). The CLI should match. Future operations can be added as additional subcommands (e.g., `netsuite-search`, `netsuite-record`) following the same pattern, or the netsuite subcommand can be extended with a `--type` flag when needed.

---

### AD-2: CLI interface design — Match db subcommand flags

**Chosen interface:**

```
hlx inspect netsuite --repo <name> --query "<SuiteQL>"
hlx inspect netsuite --repo <name> --query-file <path>
hlx inspect netsuite --repo <name> "<SuiteQL>"     # positional query
```

**Rationale:** Matches the `db` subcommand interface exactly:
- `--repo` (required) — resolved via `resolveRepo()`
- `--query` (recommended) — explicit query string
- `--query-file` — read query from file (avoids shell quoting issues)
- Positional argument — convenience for simple queries

The `--query` and `--query-file` flags mirror `db.ts` lines 70-88. This ensures agents trained on the `db` interface can use `netsuite` with identical syntax.

---

### AD-3: Server endpoint — POST to /api/inspect/{repoId}/netsuite

**Chosen:** The CLI handler POSTs to `/${repoId}/netsuite` (relative to the inspection base URL).

**Rationale:** Matches the existing pattern:
- `db.ts` → `/${repoId}/database` (POST)
- `logs.ts` → `/${repoId}/logs` (POST)
- `api.ts` → `/${repoId}/api` (GET)

Request body: `{ query }` — identical to `db.ts` body structure.

---

### AD-4: Documentation updates — commands.md and usage strings

**Files to update:**
1. `src/inspect/index.ts` — Add `netsuite` to the usage string and switch/case dispatcher
2. `skill-content/references/commands.md` — Add netsuite subcommand documentation
3. `src/inspect/netsuite.ts` — New file with help text matching db.ts style

---

## Core API/Methods

### New: `cmdNetsuite()` (src/inspect/netsuite.ts)

```
Input: config (HxConfig), repoNameOrId (string), query (string)
Flow:
  1. resolveRepo(config, repoNameOrId) — resolve repo name to ID
  2. hxFetch(config, `/${repoId}/netsuite`, { method: "POST", body: { query } })
  3. console.log(JSON.stringify(result, null, 2))
```

This is a direct copy of the `cmdDb()` pattern (db.ts lines 1-12), changing only the endpoint path from `/database` to `/netsuite`.

### Modified: `runInspect()` (src/inspect/index.ts)

Add a new `case "netsuite"` in the switch/case dispatcher (after line 120, before `default`). The case follows the `db` case structure:
1. Check for help request
2. Parse `--repo`, `--query`, `--query-file` flags
3. Handle `--query-file` (read from file)
4. Call `cmdNetsuite(config, repo, query)`

### Modified: `inspectUsage()` (src/inspect/index.ts)

Add `hlx inspect netsuite --repo <name> --query "<SuiteQL>"` to the usage output string.

---

## Technical Decisions (including rejected alternatives)

### TD-1: No environment flag in CLI

**Decision:** Do not expose an `--environment` flag in the CLI.

**Rationale:** The environment (PRODUCTION vs SANDBOX) is determined server-side from the inspection token's `nsEnv` claim (see helix-global-server AD-3). Exposing an environment flag would be misleading — the server ignores client-specified environments for security. The agent doesn't need to know which environment it's querying; the orchestrator handles this.

**Rejected:** Adding `--environment PRODUCTION|SANDBOX` flag. Insecure and redundant.

### TD-2: Error display follows existing pattern

**Decision:** On HTTP errors, `hxFetch()` throws and the error propagates to the CLI's top-level handler.

**Rationale:** The existing error handling in `http.ts` handles 429 (rate limit), 401 (unauthorized), and 5xx (server error) with appropriate retry logic. No NetSuite-specific error handling is needed in the CLI — the server translates NetSuite errors into HTTP errors with descriptive messages (e.g., "NetSuite credentials are not configured for this organization/environment").

---

## Technical Checks

[TCK-01] netsuite subcommand dispatches correctly
- Decision Reference: "Single netsuite subcommand following db.ts pattern" (AD-1)
- Verification Method: code-inspection
- Expected Evidence: `src/inspect/index.ts` has a `case "netsuite"` in the switch/case dispatcher. The case imports and calls `cmdNetsuite()` from `src/inspect/netsuite.ts`.

[TCK-02] CLI interface matches db subcommand flags
- Decision Reference: "Match db subcommand flags" (AD-2)
- Verification Method: code-inspection
- Expected Evidence: The netsuite case in index.ts parses `--repo`, `--query`, and `--query-file` flags using the same `getFlag()` calls as the db case. Positional query argument is also supported.

[TCK-03] Documentation updated
- Decision Reference: "Documentation updates" (AD-4)
- Verification Method: code-inspection
- Expected Evidence: `skill-content/references/commands.md` contains `netsuite` subcommand documentation. `inspectUsage()` in index.ts includes `netsuite` in the usage string.

---

## Cross-Platform Considerations

Not applicable. The CLI runs in Node.js sandboxes. No browser/mobile considerations.

---

## Performance Expectations

| Metric | Expected | Basis |
|--------|----------|-------|
| CLI overhead | <50ms | resolveRepo() is a single HTTP call; the main latency is server-side |
| End-to-end latency | 1-4s | Server-side OAuth2 + RESTlet call dominates; CLI adds minimal overhead |
| Retry behavior | 3 attempts on 429/5xx | Existing `hxFetch()` retry logic applies automatically |

---

## Dependencies

| Dependency | Type | Status | Risk |
|------------|------|--------|------|
| `hxFetch()` | Internal function | Available | None — existing transport layer |
| `resolveRepo()` | Internal function | Available | None — existing repo resolution |
| `getFlag()` / `getPositionalArgs()` | Internal functions | Available | None — existing flag parsing |
| Server endpoint `POST /inspect/:repoId/netsuite` | External (helix-global-server) | Must be built | Depends on helix-global-server changes landing first or simultaneously |

---

## Deferred to Round 2

1. **Additional netsuite operations** — saved search, record reads, script logs via separate subcommands or `--type` flag.
2. **Rich output formatting** — table output mode for query results (currently JSON only).
3. **Interactive query mode** — REPL-like interface for multiple sequential queries.

---

## Summary Table

| Area | Decision | Key Tradeoff |
|------|----------|--------------|
| Subcommand scope | Single SuiteQL query command | MVP simplicity vs. future operation coverage |
| CLI interface | Match db.ts flags exactly | Agent familiarity vs. NetSuite-specific flags |
| Server endpoint | POST /{repoId}/netsuite | URL consistency with existing pattern |
| Environment flag | Not exposed | Security (server-enforced) vs. CLI flexibility |
| Error handling | Reuse hxFetch error pipeline | Consistency vs. NetSuite-specific error messages |

---

## APL Statement Reference

See tech-research/apl.json. All questions resolved with evidence. No open followups.

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change scope | One new handler, one dispatch case, documentation update. Straightforward extension. |
| diagnosis/apl.json (helix-cli) | CLI pattern evidence | db.ts is the 12-line template. POST to /api/inspect/{repoId}/netsuite. |
| scout/reference-map.json (helix-cli) | File-level architecture | 4 existing subcommands, zero NetSuite code, consistent pattern. |
| scout/scout-summary.md (helix-cli) | Architecture overview | Router → handler → hxFetch → display pattern. Transport reusable. |
| product/product.md (helix-global-server) | Product requirements | `hlx inspect netsuite --repo <name> --query "<SuiteQL>"` interface specified. SCN-09 requires help text. |
| src/inspect/index.ts (direct read) | Dispatcher implementation | switch/case at line 41. Usage string at line 10. Help handling per subcommand. |
| src/inspect/db.ts (direct read) | Handler template | 12 lines: resolveRepo → hxFetch POST → console.log. The exact pattern to replicate. |
| src/lib/http.ts (direct read, via scout) | Transport layer | Auth, retry, timeout handled. No changes needed. |
| tech-research/tech-research.md (helix-global-server) | Server-side endpoint design | POST /inspect/:repositoryId/netsuite. Body: { query }. Environment from token, not request. |
