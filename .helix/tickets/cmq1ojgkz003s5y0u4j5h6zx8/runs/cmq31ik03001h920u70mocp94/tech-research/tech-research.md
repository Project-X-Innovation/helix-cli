# Tech Research: MVP NetSuite Play Mode — helix-cli

## Technology Foundation

- **Runtime:** Node.js + TypeScript
- **Build:** `npm run build` (tsc)
- **Validation:** `npm run typecheck && npm run build`
- **Architecture:** Thin client — CLI sends mode strings to server API; server enforces platform gating

## Architecture Decisions

### AD-1: Replace EXECUTE with PLAY in VALID_MODES

**Options considered:**
1. Add PLAY alongside EXECUTE
2. Replace EXECUTE with PLAY

**Chosen:** Option 2 — Replace.

**Rationale:** EXECUTE=0/872 production tickets. Ticket says "replaces execute." The CLI is a thin pass-through — it validates mode locally then sends to server. Server is the source of truth for platform enforcement. No backward-compatibility concern.

### AD-2: No Play-Specific Subcommands for MVP-1

**Options considered:**
1. Add `hlx plays` subcommands (list, run, preview)
2. Only update the existing `hlx tickets create --mode` to accept PLAY

**Chosen:** Option 2 — Update existing command only.

**Rationale:** MVP-1 is mode scaffolding. Play-specific subcommands (listing plays, triggering runs, viewing step results) depend on MVP-2/MVP-3 server API endpoints that don't exist yet. Adding dead commands creates confusion. Defer subcommands until server endpoints are ready.

### AD-3: Deploy After Server

**Decision:** CLI deploys after server.

**Rationale:** CLI sends `mode: "PLAY"` in POST body to `POST /api/tickets`. Server validates against `platformConfig.allowedModes`. If CLI sends PLAY before server recognizes it, server returns 400. Zero EXECUTE usage means no transition period is needed.

## Core API/Methods

### MVP-1 Changes (3 Files, 6 Locations)

| File | Location | Change |
|------|----------|--------|
| `src/tickets/create.ts` (line 13) | `VALID_MODES` array | `"EXECUTE"` -> `"PLAY"` |
| `src/tickets/create.ts` (line 17) | Help text / usage string | `EXECUTE` -> `PLAY` in `--mode` options |
| `src/tickets/index.ts` (line 21) | Usage text | `EXECUTE` -> `PLAY` in mode list |
| `src/tickets/index.ts` (line 73) | Help text | `EXECUTE` -> `PLAY` in mode list |
| `src/docs/cli-content.ts` (line 109) | Mode table | `EXECUTE` -> `PLAY` |
| `src/docs/cli-content.ts` (line 250) | Description text | `EXECUTE` -> `PLAY` |

### How Mode Validation Works (No Change Needed)

```typescript
// create.ts — existing pattern (unchanged logic, just swap EXECUTE -> PLAY)
const VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "PLAY"] as const;
// Line ~80: uppercase normalize + includes check
const modeUpper = modeArg.toUpperCase();
if (!VALID_MODES.includes(modeUpper)) { ... }
```

The validation logic itself doesn't change — only the constant value.

## Technical Decisions

### TD-1: Help Text Consistency

All help text surfaces show the same mode list. Three locations show mode options:
- `create.ts:17` — inline usage string
- `index.ts:21` — tickets usage function
- `index.ts:73` — help text (appears to duplicate)

All three must say PLAY, not EXECUTE. The docs content (cli-content.ts) mirrors client-side CLI docs and must also update.

### TD-2: No Structural Changes

The CLI mode validation is a simple array inclusion check. Replacing one string in the array is the entire logic change. No function signatures, types, or control flow need modification.

## Technical Checks

[TCK-01] VALID_MODES contains PLAY, not EXECUTE
- Decision Reference: "Replace EXECUTE with PLAY in VALID_MODES" (AD-1)
- Verification Method: code-inspection
- Expected Evidence: `VALID_MODES` array in create.ts contains `"PLAY"`, does not contain `"EXECUTE"`.

[TCK-02] All help text references PLAY
- Decision Reference: "Replace EXECUTE with PLAY" (AD-1)
- Verification Method: code-inspection
- Expected Evidence: Grep for "EXECUTE" in src/tickets/ and src/docs/ returns zero matches. All mode lists in usage strings and help text include PLAY.

[TCK-03] CLI docs mirror updated
- Decision Reference: "Replace EXECUTE with PLAY" (AD-1)
- Verification Method: code-inspection
- Expected Evidence: cli-content.ts mode table (line 109) and description (line 250) reference PLAY, not EXECUTE.

## Cross-Platform Considerations

None. The CLI is platform-agnostic — it sends mode to server, server enforces platform gating.

## Performance Expectations

Zero impact. String constant change.

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| Server PLAY mode deployed | Cross-repo | Server must accept PLAY before CLI sends it |

No new dependencies.

## Deferred to Round 2

- Play-specific subcommands (`hlx plays list`, `hlx plays run`, `hlx plays preview`) — depends on MVP-2/MVP-3 server API

## Summary Table

| Decision | Choice | Confidence | Risk |
|----------|--------|------------|------|
| EXECUTE -> PLAY | Replace in VALID_MODES + help text | High | None |
| Subcommands | Deferred until server API ready | High | None |
| Deploy order | After server | High | None |

## APL Statement Reference

See `tech-research/apl.json`.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/diagnosis-statement.md (cli) | Root cause and file list | 3 files; deploy after server |
| diagnosis/apl.json (cli) | Investigation Q&A | Replace not coexist; server-first deploy |
| product/product.md | Product scope | CLI success criteria: `hlx tickets create --mode PLAY` works |
| src/tickets/create.ts:13,17 | Direct inspection | VALID_MODES array + help text |
| src/tickets/index.ts:21,73 | Direct inspection | Two usage text locations |
| src/docs/cli-content.ts:109,250 | Direct inspection | Mode table + description |
