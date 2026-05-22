# Tech Research: Enable Full CLI Capabilities for Helix Agents

## Technology Foundation

**Runtime**: Node.js >= 18 (ESM, TypeScript 6.x compiled to ES2022)
**Package**: `@projectxinnovation/helix-cli` v1.3.4 (npm, public, with provenance)
**Build**: `tsc` via `prepare` script (runs automatically on `npm ci`)
**CI/CD**: GitHub Actions with two workflows:
- `build-release.yml` (on push to `main`) -- builds tarball, publishes as GitHub Release `latest`
- `publish.yml` (on tag push `v*`) -- builds, tests, validates tarball, publishes to npm with OIDC provenance
**Consumer**: `helix-workflow-step-agent` depends on `@projectxinnovation/helix-cli@^1.2.0`

The full CLI already exists in source at v1.3.4. No new code needs to be written. The fix is operational: publish the existing v1.3.4 source to npm so agent sandboxes receive the full command set.

## Architecture Decision

### Decision 1: Fix approach -- Publish existing CLI vs. write new code

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Publish v1.3.4 to npm | Push a `v1.3.4` git tag to trigger the existing `publish.yml` workflow | Zero code changes; uses existing CI/CD; all commands already tested in source; semver-compatible with `^1.2.0` | Requires npm OIDC trusted publishing to be configured; relies on existing workflow correctness |
| B. Write missing commands from scratch | Implement tickets, comments, etc. commands in a new version | Fresh code | Massive waste -- all code already exists in v1.3.4 source |
| C. Vendor the CLI binary into helix-workflow-step-agent | Copy the built CLI directly into the agent package | Bypasses npm publish | Fragile coupling; duplication; loses npm version management |

**Chosen option: A -- Publish v1.3.4 to npm**

**Rationale**: The full CLI with all 10 top-level commands (login, token, inspect, comments, preview, library, org, tickets, skill, update) already exists in the source repo at v1.3.4. The CI/CD pipeline (`publish.yml`) is already configured to validate and publish on tag push. The `helix-workflow-step-agent` dependency on `^1.2.0` will automatically resolve to `1.3.4` with no consumer changes. This is the smallest correct change that fully solves the problem.

### Decision 2: Environment clarity approach

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. No change (document current behavior) | Agents can check `hlx org current` to see their server URL | Zero code changes; sufficient for MVP | No explicit "production" / "staging" label |
| B. Add environment label to CLI output | CLI detects known production URLs and labels them | Clear signal for agents | Requires hardcoding known URLs; fragile |
| C. Add `--env` flag or environment display command | New command like `hlx env` showing connected environment | Clean UX | New code; scope creep for this ticket |

**Chosen option: A -- No change for MVP**

**Rationale**: The primary blocker is that agents lack the commands entirely (stale npm package). Environment clarity is a contributing factor but not the root cause. The existing `hlx org current` command (available in v1.3.4) shows the configured server URL, which sufficiently identifies the environment. A dedicated environment indicator is a future enhancement per the product spec.

### Decision 3: Env var naming

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Keep current aliases (HELIX_INSPECT_TOKEN as alias for HELIX_API_KEY) | No code changes | Zero risk; backward compatible | "INSPECT" naming may still confuse agents |
| B. Rename env vars in agent sandboxes to HELIX_API_KEY | Change sandbox provisioning to use primary env var name | Clearer naming | Requires changes outside helix-cli; out of scope |

**Chosen option: A -- Keep current aliases**

**Rationale**: The CLI config loading (src/lib/config.ts:42) already treats `HELIX_INSPECT_TOKEN` as a full-access alias for `HELIX_API_KEY`. Renaming env vars requires changes in `helix-workflow-step-agent` sandbox provisioning, which is outside the scope of this ticket. The diagnosis confirmed there is NO read-only restriction -- the naming is misleading but functionally irrelevant.

## Core API/Methods

The CLI already implements all required API interactions. Key methods (all using `hxFetch` from `src/lib/http.ts`):

| Command | Method | API Path | basePath |
|---------|--------|----------|----------|
| `hlx tickets create` | POST | /tickets | /api |
| `hlx tickets list` | GET | /tickets | /api |
| `hlx tickets get` | GET | /tickets/:id | /api |
| `hlx tickets update-description` | PATCH | /tickets/:id | /api |
| `hlx tickets rerun` | POST | /tickets/:id/rerun | /api |
| `hlx tickets continue` | POST | /tickets/:id/rerun | /api |
| `hlx comments post` | POST | /tickets/:id/comments | /api |
| `hlx comments list` | GET | /tickets/:id/comments | /api |
| `hlx inspect db/logs/api` | POST/GET | /inspect/:repoId/* | /api/inspect (default) |

The `hxFetch` default basePath is `/api/inspect` (src/lib/http.ts:43). All write commands explicitly override this to `/api`. Inspection commands use the default. This is correct and matches the server route structure.

Auth handling: `hxi_`-prefixed tokens use `X-API-Key` header; others use `Bearer` authorization (src/lib/http.ts:53-57). The server's `attachAuthContext` middleware resolves both to the same full `AuthContext`.

## Technical Decisions

### TD-1: Publish mechanism

The `publish.yml` workflow (`.github/workflows/publish.yml`) is the established publish path:
1. Triggered on git tag push matching `v*`
2. Uses Node 24 (for npm 11.x with OIDC trusted publishing support)
3. Runs `npm ci` (which triggers `prepare` -> `npm run build` -> `tsc`)
4. Runs `npm test` (tsc && node --test dist/**/*.test.js)
5. Validates tag version matches package.json version
6. Packs tarball and validates required files: `dist/index.js`, `package.json`, `skill-content/SKILL.md`
7. Validates no test files leaked into tarball
8. Publishes with `npm publish *.tgz --provenance`

The package.json `publishConfig` specifies `access: "public"`, `provenance: true`, and `registry: "https://registry.npmjs.org"`.

**Rejected alternative**: Manual `npm publish` from a developer machine. This bypasses CI validation, provenance signing, and version-tag verification.

### TD-2: Semver compatibility

Package.json version: `1.3.4`. Consumer dependency: `^1.2.0` (in helix-workflow-step-agent).

Per semver, `^1.2.0` resolves to `>=1.2.0 <2.0.0`, so `1.3.4` is within range. No consumer changes needed.

The `files` field in package.json includes `dist` (excluding test files) and `skill-content`. The `bin` field maps `hlx` to `dist/index.js`. These are already correctly configured for the full CLI.

**Rejected alternative**: Bumping to v2.0.0 would require updating the consumer dependency, adding unnecessary coordination.

### TD-3: No server changes required

The server (helix-global-server) already supports all needed operations via hxi_ API keys:
- `attachAuthContext` (middleware.ts:198) resolves hxi_ keys to full `AuthContext` via `resolveApiKeyAuth`
- `requireAuth` (middleware.ts:310) only checks `auth !== null` -- no permission differentiation
- `POST /api/tickets` (api.ts:331) uses the same auth gate as session endpoints
- `InspectionApiKey` model has no permissions/scopes field
- All 10 active production API keys have empty `repos` arrays (unrestricted)
- Production logs confirm `POST /api/tickets 201` succeeds consistently

**Evidence**: Runtime inspection confirmed POST /api/tickets returns 201 in production. Zero auth failures on ticket endpoints in 7-day log window.

### TD-4: Tarball content validation

The publish workflow validates that the tarball includes:
- `package/dist/index.js` (CLI entrypoint)
- `package/package.json` (metadata)
- `package/skill-content/SKILL.md` (agent skill documentation)
- No `*.test.js` or `*.test.d.ts` files

The package.json `files` array ensures only `dist` (minus test files) and `skill-content` are included. This is already correctly configured for the full CLI build.

## Technical Checks

[TCK-01] All CLI commands present in published npm package
- Decision Reference: "Publish v1.3.4 to npm" (Architecture Decision 1)
- Verification Method: behavioral
- Expected Evidence: Running `hlx tickets create --help` in an agent sandbox returns usage information (not "Unknown command"). Running `hlx comments post --help` returns usage information. Running `hlx --help` lists all 10 top-level commands (login, token, inspect, comments, preview, library, org, tickets, skill, update).

[TCK-02] Ticket creation succeeds via CLI
- Decision Reference: "All write commands available" (Product Essential Feature 2)
- Verification Method: behavioral
- Expected Evidence: Running `hlx tickets create --title "Test" --description "Test" --repos <repo-name>` returns a ticket ID and status, not an error. The created ticket is visible in the Helix production system.

[TCK-03] Comment posting succeeds via CLI
- Decision Reference: "All write commands available" (Product Essential Feature 2)
- Verification Method: behavioral
- Expected Evidence: Running `hlx comments post --ticket <id> "test message"` returns a comment ID, not an error. The comment is visible on the target ticket.

[TCK-04] npm tarball includes all required command directories
- Decision Reference: "Tarball content validation" (TD-4)
- Verification Method: code-inspection
- Expected Evidence: npm tarball contains `dist/tickets/`, `dist/comments/`, `dist/library/`, `dist/org/`, `dist/token/`, `dist/skill/`, `dist/update/`, `dist/preview/`, `dist/inspect/`, and `dist/index.js`. No test files present.

[TCK-05] Semver range compatibility
- Decision Reference: "Semver compatibility" (TD-2)
- Verification Method: code-inspection
- Expected Evidence: Published npm version is `1.3.4` which satisfies `^1.2.0`. helix-workflow-step-agent's package.json dependency on `@projectxinnovation/helix-cli` uses `^1.2.0` range.

[TCK-06] basePath routing correctness
- Decision Reference: "Core API/Methods" -- write commands use `/api`, inspect uses `/api/inspect`
- Verification Method: code-inspection
- Expected Evidence: All ticket and comment commands in `src/tickets/*.ts` and `src/comments/*.ts` pass `basePath: "/api"` to `hxFetch`. Inspection commands in `src/inspect/*.ts` either use the default basePath (`/api/inspect`) or pass it explicitly.

## Cross-Platform Considerations

Not applicable. The CLI targets Node.js >= 18 (ESM) and runs in Linux-based agent sandboxes. No cross-platform concerns.

## Performance Expectations

- CLI commands are simple HTTP request/response interactions with the server API
- `hxFetch` implements retry logic (3 attempts, exponential backoff) for transient failures (429, 500, 502, 503, 504)
- 30-second request timeout per attempt
- No performance concerns; the bottleneck is server-side processing, not the CLI

## Dependencies

| Dependency | Type | Impact |
|------------|------|--------|
| npm OIDC trusted publishing configured for `@projectxinnovation/helix-cli` | Infrastructure | Required for `publish.yml` to work; publish will fail with 404 if not configured |
| Node 24 in CI | CI/CD | publish.yml explicitly requires Node 24 for npm 11.x OIDC support |
| `helix-workflow-step-agent` sandbox re-provisioning | Operational | Agents get the new CLI version on next `npm install` during sandbox provisioning |
| helix-global-server API stability | API contract | All ticket/comment endpoints already exist and work; no changes needed |
| GitHub Actions secrets/permissions | CI/CD | `id-token: write` permission for OIDC; `contents: read` for checkout |

## Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | npm OIDC trusted publishing not configured | Unknown | Publish fails entirely | Verify npm package settings before tagging; fall back to NPM_TOKEN secret if needed |
| 2 | npm cache in sandbox provisioning delays pickup | Low | Agents temporarily keep old version | Next full sandbox provision will pick up v1.3.4; can be forced by cache invalidation |
| 3 | Breaking changes between v1.2.0 and v1.3.4 | Very Low | Agent scripts break | The CLI added commands; existing login + inspect behavior unchanged. package.json `bin` mapping unchanged (`hlx` -> `dist/index.js`) |
| 4 | 10,000-char ticket description limit | Low | Silent failure on long descriptions | CLI already surfaces server errors (create.ts:155-171 parses JSON error responses); server returns clear validation error via Zod |
| 5 | `npm test` fails in CI blocking publish | Low | Publish blocked until tests pass | Tests already exist and run on build-release.yml; fix any failures before tagging |

## Deferred to Round 2

- **Environment indicator in CLI output**: A persistent label showing "Connected to: production" or "Connected to: staging" (product Future Considerations)
- **Env var renaming in sandbox provisioning**: Supporting `HELIX_API_KEY` as the primary env var name instead of `HELIX_INSPECT_TOKEN` (product Future Considerations)
- **Granular API key permissions**: Adding scopes/permissions to the `InspectionApiKey` model (product Future Considerations)
- **CLI auto-update in sandboxes**: The CLI has an auto-update mechanism (`hlx update`) but its behavior in ephemeral sandbox environments is untested

## Summary Table

| Aspect | Decision |
|--------|----------|
| Fix approach | Publish existing v1.3.4 to npm via git tag push |
| Code changes needed | None -- full CLI already exists in source |
| Server changes needed | None -- API already supports all operations via hxi_ keys |
| Consumer changes needed | None -- `^1.2.0` semver range picks up v1.3.4 automatically |
| Environment clarity | Defer to future enhancement; `hlx org current` shows server URL |
| Env var naming | Keep current aliases; no code changes |
| Publish mechanism | Existing `publish.yml` workflow on `v*` tag push |
| Primary risk | npm OIDC trusted publishing configuration status unknown |

## APL Statement Reference

See `tech-research/apl.json` for the structured APL record. Key conclusion: The technical path is an operational publish with zero code changes. All required CLI functionality exists in source v1.3.4, the server API supports all operations, and the CI/CD pipeline is configured.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library run root) | Understand the full problem statement, user expectations, and referenced ticket RSH-534 | Agents expected to create tickets, post comments, look up tickets; confusion about prod vs staging; ticket references RSH-534 for CLI failure context |
| diagnosis/diagnosis-statement.md (helix-cli) | Root cause identification and evidence summary | Stale npm package (v1.2.0) is the primary cause; server has no read-only restriction; env var naming is misleading but functionally irrelevant |
| diagnosis/apl.json (helix-cli) | Structured diagnosis answers with evidence | Confirmed sandbox has v1.2.0 with only login+inspect; server supports write ops; env var confusion is naming-only |
| product/product.md (helix-cli) | Product requirements, success criteria, and scope constraints | MVP is npm publish of v1.3.4; no new commands needed; environment clarity deferred; 6 open questions documented |
| scout/scout-summary.md (helix-cli) | CLI capability mapping from source code | All 10 commands present; HELIX_INSPECT_TOKEN is full-access alias; skill docs document write operations |
| scout/reference-map.json (helix-cli) | File-by-file evidence of CLI source structure | 21 files mapped; basePath routing confirmed; auth flow documented |
| scout/scout-summary.md (helix-global-server) | Server-side auth verification | hxi_ API keys get full AuthContext; no permission downgrading; POST /api/tickets 201 confirmed |
| repo-guidance.json (library run root) | Repo intent and scope | helix-cli is target (publish); helix-global-server is context only; no code changes in any repo |
| helix-cli/package.json | Package metadata and publish configuration | v1.3.4, publishConfig with public access and provenance, files array includes dist + skill-content |
| helix-cli/.github/workflows/publish.yml | CI/CD publish pipeline | Tag-triggered, Node 24, OIDC provenance, tarball validation, version match check |
| helix-cli/.github/workflows/build-release.yml | CI/CD build pipeline | Main-branch triggered GitHub Release; confirms build process works |
| helix-cli/src/index.ts | CLI entrypoint with all command routing | 10 commands in switch statement; full usage help string |
| helix-cli/src/lib/http.ts | HTTP client with auth and basePath handling | Default basePath /api/inspect; write commands override to /api; hxi_ uses X-API-Key header |
| helix-cli/src/lib/config.ts | Config loading with env var priority | HELIX_API_KEY > HELIX_INSPECT_TOKEN > HELIX_INSPECT_API_KEY; all resolve to same apiKey |
| helix-cli/src/tickets/create.ts | Ticket creation implementation | POST /api/tickets with basePath /api; requires title, description, repos; error parsing for server responses |
| helix-cli/src/comments/post.ts | Comment posting implementation | POST /api/tickets/:id/comments with basePath /api; requires message content |
| RSH-534 run-5/report.md | Referenced ticket report on Goals/PM agent | Confirmed CLI write commands used in implementation plans; production ticket creation succeeded |
