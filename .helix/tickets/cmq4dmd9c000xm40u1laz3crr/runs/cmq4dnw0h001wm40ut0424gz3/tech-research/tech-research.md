# Tech Research: CLI Converse Command (helix-cli)

## Technology Foundation

- **Runtime**: Node.js 18+ (zero runtime dependencies)
- **Language**: TypeScript, compiled via `tsc` to `dist/`
- **HTTP client**: `hxFetch` (native `fetch()` with retry + auth) — 30s per-request timeout, 3 retries
- **CLI architecture**: Domain-organized commands (`comments/`, `playbook/`, `tickets/`), main router in `src/index.ts`
- **Existing patterns**: Polling in `playbook/check.ts` (5s intervals, 120 polls, progress dots)
- **No new dependencies**: Pure Node.js, matching existing architecture

## Architecture Decision 1: CLI Command Structure

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) New subcommand `hlx comments converse` | Add `converse` alongside `list` and `post` in `src/comments/` | Follows existing CLI structure; clear distinct operation; `post` stays simple | One more file |
| B) Add `--ask` flag to `hlx comments post` | Extend `post` to optionally wait for reply | No new command; fewer user concepts | Overloads `post` with async wait behavior; harder to document |
| C) Top-level command `hlx converse` | New domain at top level | Short to type | Breaks domain grouping convention; comment-related but not under `comments/` |

### Chosen: Option A - New subcommand `hlx comments converse`

**Rationale**: The CLI organizes commands by domain (`comments/`, `playbook/`, `tickets/`). A converse operation is fundamentally different from posting — it posts AND waits for a reply. Keeping it as a separate subcommand follows the established pattern (list, post, converse) and leaves `post` unchanged. Registration in `src/comments/index.ts` follows the existing switch/case pattern at L25-48.

**Command signature**:
```
hlx comments converse --ticket <ref> [--parent <commentId>] [--timeout <seconds>] [--json] <message>
```

## Architecture Decision 2: Reply Detection via HTTP Polling

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) Poll `GET /api/tickets/{ticketId}/comments` | Periodically fetch comments and scan for new `isAgentAuthored` reply | Uses existing endpoint; matches CLI's polling pattern (check.ts); no new server endpoints | Higher latency (poll interval); unnecessary data transfer |
| B) SSE subscription | Connect to `/tickets/{ticketId}/comments/stream` and listen for events | Lower latency; matches client approach | CLI has no SSE client infrastructure; adds complexity; `hxFetch` timeout would fight it |
| C) New dedicated poll endpoint | `GET /api/tickets/{ticketId}/comments/{commentId}/reply` | Clean API; minimal data transfer | Requires server-side changes; adds coupling |

### Chosen: Option A - Poll existing GET endpoint

**Rationale**: The CLI already has a proven polling pattern in `playbook/check.ts` (5s intervals, 120 polls, progress dots). The GET comments endpoint already exists and returns `isAgentAuthored` and `parentCommentId` fields needed for reply detection. No SSE client exists in the CLI codebase and adding one would break the zero-dependency principle. No server-side changes are needed.

**Polling strategy**:
1. POST comment with `isHelixTagged: true`
2. Record `postedCommentId` and `postedCreatedAt`
3. Poll `GET /api/tickets/{ticketId}/comments` every 5s
4. Filter for: `isAgentAuthored === true` AND `createdAt > postedCreatedAt` AND (direct parent match or thread membership)
5. On match: return reply content
6. On timeout: print posted comment ID, exit with code 1

## Architecture Decision 3: Polling Interval and Timeout

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A) 5s interval, 120 polls (10 min) | Matches `playbook/check.ts` exactly | Consistent with existing pattern; 10 min covers IDLE→ACTIVE→reply | May be overly conservative for quick error replies |
| B) 3s interval, 100 polls (5 min) | Faster detection | Detects replies faster | More HTTP requests; 5 min may timeout on slow agents |
| C) 5s interval, configurable max via `--timeout` flag (default 300s = 60 polls) | Matches server default; user controls | Consistent with MCP tool default; user can shorten for quick checks | Slightly more complex flag parsing |

### Chosen: Option C - 5s interval, configurable timeout (default 300s)

**Rationale**: Aligns with the MCP converse tool's 300s default timeout. The 5s poll interval matches `check.ts` and is a good balance between responsiveness and HTTP request frequency. A `--timeout` flag lets users shorten the wait when they expect a quick reply (error states) or extend it for slow agents. Default 300s = 60 polls.

## Architecture Decision 4: isHelixTagged in POST Body

### Chosen: Always set `isHelixTagged: true`

The converse command explicitly sets `isHelixTagged: true` in the POST body. This is the critical difference from the existing `post` command (which sends only `{ content }`). The server-side controller (`comment-controller.ts` L75-84) checks this flag to trigger agent dispatch. Without it, the comment is posted but no agent reply is triggered.

The CLI POST goes through the HTTP controller (not the MCP path), so dispatch already works server-side — the CLI just needs to include the flag.

**No implicit detection fallback**: The converse command always sets the flag explicitly. It does not rely on `isDirectHelixAddress()` server-side detection. This is intentional — the user is explicitly requesting a Helix conversation, so the flag should be deterministic.

## Architecture Decision 5: Reply Identification in Poll Results

### Chosen: Filter by `isAgentAuthored` + chronological ordering

Each poll response includes the full comment list. The CLI identifies the agent reply by:

1. Filter comments where `isAgentAuthored === true`
2. Filter where `createdAt > postedCreatedAt` (posted after our message)
3. Match thread: comment is in the same thread as our posted message (via `parentCommentId`)
4. Take the first (oldest) matching reply

**Why not track by parentCommentId alone**: The GET endpoint returns comments without guaranteed threading resolution. The chronological filter ensures we don't pick up stale agent replies from before our message.

**Edge case**: If the agent posts multiple replies (system ack + host reply), the CLI returns the first one found. This matches the MCP tool behavior.

## Core API/Methods

### New: `src/comments/converse.ts`

```
cmdConverse(config: HxConfig, ticketId: string, args: string[]): Promise<void>
```

- Parse flags: `--parent <commentId>`, `--timeout <seconds>`, `--json`
- Parse positional args for message content
- POST `/api/tickets/{ticketId}/comments` with `{ content, isHelixTagged: true, parentCommentId? }`
- Poll `GET /api/tickets/{ticketId}/comments` with 5s interval
- On reply: print content (or JSON in `--json` mode), exit 0
- On timeout: print posted comment ID, exit 1

### Modified: `src/comments/index.ts`

- Import `cmdConverse` from `./converse.js`
- Add `case "converse"` to switch at L25
- Update usage string to include `converse` subcommand

## Technical Decisions (with rejected alternatives)

| Decision | Chosen | Rejected | Why Rejected |
|----------|--------|----------|--------------|
| Command structure | New `converse` subcommand | `--ask` flag on `post`; top-level command | Overloads `post` behavior; breaks domain grouping |
| Reply detection | HTTP polling (5s) | SSE; new endpoint | No SSE client in CLI; zero-dependency constraint; no server changes |
| Timeout | Configurable `--timeout`, default 300s | Fixed 10 min (matching check.ts) | 10 min is too long for default; consistency with MCP tool's 300s |
| isHelixTagged | Always `true` | Rely on server implicit detection | Explicit is deterministic; user invoked converse deliberately |
| Progress indication | Dots (matching check.ts) | Spinner; silent | Dots match existing pattern; user knows CLI is working |

## Technical Checks

[TCK-01] POST includes isHelixTagged: true
- Decision Reference: "Always set isHelixTagged: true in POST body"
  (from Architecture Decision 4)
- Verification Method: code-inspection
- Expected Evidence: The converse command's POST request body includes `isHelixTagged: true` alongside `content` and optional `parentCommentId`. This is the fix for the gap identified in `post.ts` L31-35 which only sends `{ content }`.

[TCK-02] Polling pattern follows check.ts conventions
- Decision Reference: "Poll existing GET endpoint with 5s interval"
  (from Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: The converse command uses a poll loop with 5s intervals, progress dot output via `process.stdout.write(".")`, and terminates on reply detection or timeout. The pattern structurally mirrors `playbook/check.ts` L79-94.

[TCK-03] Timeout fallback with non-zero exit code
- Decision Reference: "Configurable timeout via --timeout flag, default 300s"
  (from Architecture Decision 3)
- Verification Method: code-inspection
- Expected Evidence: On timeout, the command prints the posted comment ID and exits with `process.exit(1)`. A `--timeout` flag is supported with a default of 300 seconds. The `--json` output mode includes the posted comment ID in structured output.

[TCK-04] Converse registered in comments router
- Decision Reference: "New subcommand hlx comments converse"
  (from Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `src/comments/index.ts` has a `case "converse"` in its switch statement that resolves the ticket reference and calls `cmdConverse()`. The usage string includes the converse subcommand.

## Performance Expectations

| Operation | Expected Latency | Notes |
|-----------|-----------------|-------|
| POST comment | <1s | Single HTTP request (hxFetch with retry) |
| Each poll request | <1s | GET comments list, filtered client-side |
| Reply detection (error states) | 5-10s | One poll cycle after immediate error reply |
| Reply detection (system ack) | 5-10s | One poll cycle after sub-second ack |
| Reply detection (host reply, ACTIVE) | 2-4 min | Multiple poll cycles; ~24-48 polls |
| Reply detection (IDLE→ACTIVE→reply) | 3-5 min | Wake + reply; ~36-60 polls |
| Timeout | Per `--timeout` flag | Default 300s = 60 polls |

**Network overhead**: Each poll fetches the full comment list for the ticket. For tickets with many comments, this could be bandwidth-heavy. Acceptable for MVP; a `since` query parameter could optimize this later but requires server-side changes.

## Dependencies

### Existing (no new packages)

| Dependency | Source | Used For |
|------------|--------|----------|
| `hxFetch` | `src/lib/http.ts` | HTTP requests (POST comment, GET comments) |
| `getFlag` / `hasFlag` | `src/lib/flags.ts` | Parse `--timeout`, `--parent`, `--json` flags |
| `extractTicketRef` / `resolveTicket` | `src/lib/resolve-ticket.ts` | Resolve ticket reference to ID |
| `HxConfig` | `src/lib/config.ts` | Auth and URL configuration |

### No New Dependencies

Zero runtime dependencies maintained. No new npm packages.

## Deferred to Round 2

| Item | Rationale |
|------|-----------|
| Interactive REPL mode | Multi-turn back-and-forth without re-running command; adds significant complexity |
| SSE-based wait | Lower latency reply detection; requires adding SSE client infrastructure |
| `--wait` flag on `post` | Alternative UX — deferred in favor of explicit `converse` subcommand for clarity |
| `--since` query parameter on GET | Optimize polling by only fetching new comments; requires server-side endpoint change |
| Auto-detect latest thread parent | Convenience for follow-ups without knowing parent ID; adds complexity |
| Rich output formatting | Agent reply printed as plain text; markdown rendering could improve readability |

## Summary Table

| Aspect | Decision |
|--------|----------|
| Files added | `src/comments/converse.ts` |
| Files modified | `src/comments/index.ts` (add converse case + update usage) |
| New dependencies | None |
| Command | `hlx comments converse --ticket <ref> [--parent <id>] [--timeout <s>] [--json] <message>` |
| Reply detection | Poll GET /api/tickets/{ticketId}/comments every 5s |
| Timeout | Default 300s, configurable via `--timeout` |
| Exit codes | 0 = reply received; 1 = timeout or error |
| Progress | Dots to stdout during polling (matching check.ts pattern) |
| Server changes needed | None — CLI uses existing HTTP API with dispatch |
| Estimated scope | ~80-100 lines new code (converse.ts), ~15 lines modified (index.ts) |

## APL Statement Reference

See `tech-research/apl.json` for the complete question-answer loop. All questions resolved with `followups=[]`.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library) | Core requirements | CLI converse command alongside MCP tool |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI root cause and fix shape | POST omits isHelixTagged; new converse subcommand; poll for reply |
| diagnosis/apl.json (helix-cli) | CLI-specific questions answered | CLI should poll via HTTP (existing pattern); set isHelixTagged:true |
| product/product.md (helix-cli) | Product requirements and scenarios | 5 scenarios; exit codes; progress dots; --json mode; --parent threading |
| scout/scout-summary.md (helix-cli) | CLI architecture and polling pattern | Zero deps; 5s/120 poll in check.ts; hxFetch 30s timeout |
| scout/reference-map.json (helix-cli) | CLI file-level map | post.ts L31-35 sends only content; list.ts has --helix-only/--since/--json |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server dispatch that CLI relies on | HTTP controller has full dispatch; CLI POST goes through this path |
| diagnosis/apl.json (helix-global-server) | Agent latency and session states | Five session states; system ack <1s; host reply 2-4 min |
| repo-guidance.json (library) | Repo intent | helix-cli = secondary target; relies on server HTTP dispatch |
| src/comments/post.ts | Verify current POST behavior | Sends { content } only — confirmed gap |
| src/comments/index.ts | Verify CLI router structure | Switch on subcommand; add converse case |
| src/comments/list.ts | Verify comment list response shape | Has isAgentAuthored, createdAt — sufficient for reply detection |
| src/playbook/check.ts | Verify polling pattern | 5s interval, 120 polls, progress dots, terminal status check |
