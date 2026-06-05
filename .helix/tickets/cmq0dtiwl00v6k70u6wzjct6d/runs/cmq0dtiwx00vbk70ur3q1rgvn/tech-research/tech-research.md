# Tech Research: CLI --json Flag for Comment Pull Support

## Technology Foundation

- **CLI**: Node.js/TypeScript (`helix-cli`), stateless HTTP API client
- **Build**: TypeScript compiler (`tsc`), no bundler
- **Test**: Node.js built-in test module (`node --test`)
- **HTTP**: Custom `hxFetch` wrapper with retry, auth, timeouts

## Architecture Decision 1: Add --json Output Flag

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) --json flag | Output JSON.stringify of comments array when --json is passed | Simple; non-breaking; includes all fields incl. comment IDs | Slightly larger output than human-readable |
| B) --format json | Named format parameter | More extensible (could add csv, yaml later) | Over-engineered for single alternative format |
| C) Always JSON | Change default output to JSON | Simplest code | Breaking change for human users |

### Chosen: A) --json flag

Add `--json` flag to `hlx comments list`. When present, output `JSON.stringify(comments)` where comments is the filtered array of comment objects. When absent, preserve existing human-readable format. Non-breaking change.

**Rationale**: The runner's `run_helix_cli` tool uses `hlx comments list` for agent introspection. With human-readable output, the agent cannot reliably extract comment IDs. JSON output enables programmatic consumption. The `--json` flag pattern is the standard CLI convention for machine-parseable output.

## Architecture Decision 2: Include Comment IDs in Output

### Current State

The human-readable output (list.ts:42-51) does not include the comment `id` field. The `CommentResponse` type (list.ts:5-14) already includes `id` from the API response — it is available but not rendered.

### Decision

The JSON output includes all fields from the API response: `id`, `author` (name, email), `content`, `isHelixTagged`, `isAgentAuthored`, `createdAt`. The `id` field is critical for the `lastProcessedCommentId` marker used by the runner's pull loop (see helix-global-server tech research AD-3).

## Core API/Methods

### Modified Function

| Function | File | Change |
|----------|------|--------|
| `cmdList` | src/comments/list.ts | Add `--json` flag check. When present, output `JSON.stringify(comments)` after filtering. |

### Implementation Pattern

```
// Pseudocode — WHAT not HOW
1. Parse --json flag from args (args.includes("--json"))
2. Fetch + filter comments (existing logic, unchanged)
3. If --json: console.log(JSON.stringify(comments))
4. Else: existing human-readable output (unchanged)
```

## Technical Decisions

### TD-1: Output Format

JSON output is a flat array of comment objects, not wrapped in a `{ comments: [...] }` envelope. This matches the shape after client-side filtering and is simpler for consumers to parse.

**Rejected alternative**: Wrapping in `{ comments: [...], count: N }` adds metadata but complicates parsing for the runner's execFile-based consumption.

### TD-2: No Server-Side Filtering Changes

The CLI continues to fetch all comments and filter client-side. Server-side `since` query parameter is deferred to a future ticket per product scope. Client-side filtering is functional for MVP.

## Technical Checks

[TCK-01] --json flag outputs structured JSON with comment IDs
- Decision Reference: "Add --json flag to hlx comments list" (AD-1, AD-2)
- Verification Method: code-inspection
- Expected Evidence: src/comments/list.ts checks for `--json` in args. When present, outputs JSON.stringify of filtered comments array. Each comment object includes `id` field. Default behavior (no flag) is unchanged.

## Performance Expectations

| Metric | Expectation |
|--------|-------------|
| Output size | Marginally larger than human-readable (includes field names) |
| Latency | No change (same API call, same filtering) |

## Dependencies

| Dependency | Type | Risk |
|------------|------|------|
| None | N/A | The change is self-contained within list.ts |

## Deferred to Round 2

| Item | Why Deferred |
|------|-------------|
| Server-side `since` query parameter | Product scope exclusion; client-side filtering sufficient for MVP |
| --after-id flag for cursor-based filtering | ID comparison is handled by the runner, not CLI |
| Comment list tests | No existing test files for comments commands; test coverage enhancement is separate |

## Summary Table

| Decision | Choice | Impact |
|----------|--------|--------|
| AD-1: Output format | --json flag | Machine-parseable output for runner and agent tools |
| AD-2: Comment IDs | Include id field in JSON output | Enables lastProcessedCommentId marker for idempotent pull |

## APL Statement Reference

The CLI already supports `--since` filtering for comments but outputs human-readable text only. A `--json` flag is the primary addition needed to enable the runner's pull-based comment consumption and the agent's programmatic comment inspection via `run_helix_cli`.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | CLI scope from ticket description | Runner must pull unprocessed comments since marker |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI pull readiness | --json flag is primary addition; comment IDs needed for cursor |
| diagnosis/apl.json (helix-cli) | CLI Q&A on pull model support | Partial support exists; structured output required |
| scout/reference-map.json (helix-cli) | CLI file inventory and facts | --since exists, client-side filtering, no JSON output |
| scout/scout-summary.md (helix-cli) | CLI scope assessment | Minimal changes, --json flag suggested |
| src/comments/list.ts (L1-52) | Direct code inspection | CommentResponse type has id field; output excludes it; --since filtering is client-side |
| product/product.md (helix-global-server) | Cross-repo product requirements | CLI JSON output is MVP feature #5; server-side since is out of scope |
| repo-guidance.json | Repo intent | helix-cli = target (minor) |
