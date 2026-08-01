# Tech Research — helix-cli

## Technology Foundation

- **Runtime**: Node.js + TypeScript
- **Build**: `tsc`
- **Test**: `tsc + node --test`
- **Typecheck**: `tsc --noEmit`
- **Architecture**: Thin client — validates mode locally, server enforces platform restrictions

## Architecture Decision

### Decision 1: Replace EXECUTE with PLAY in VALID_MODES

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| A: Replace EXECUTE with PLAY | Clean, no dead code, matches server API | Scripts using `--mode EXECUTE` break |
| B: Add PLAY alongside EXECUTE | Backward compatible | Dead code; server will reject EXECUTE anyway |

**Chosen: Option A** — Replace EXECUTE with PLAY in the `VALID_MODES` tuple. Update help text accordingly.

**Rationale**: Zero EXECUTE tickets exist in production. No scripts depend on `--mode EXECUTE`. The server will reject EXECUTE after the API validation update, so keeping it in the CLI would give users a false sense of validity. Clean replacement is correct.

### Decision 2: No new CLI subcommands for MVP

No play-specific subcommands (preview, execute, rollback) are needed for MVP. The CLI's ticket creation flow with `--mode PLAY` is sufficient. Play-specific CLI commands are deferred to the governance/execution follow-up.

## Core API/Methods

| Surface | Current | After |
|---------|---------|-------|
| `VALID_MODES` tuple | AUTO, BUILD, FIX, RESEARCH, EXECUTE | AUTO, BUILD, FIX, RESEARCH, PLAY |
| Help text | `--mode <AUTO\|BUILD\|FIX\|RESEARCH\|EXECUTE>` | `--mode <AUTO\|BUILD\|FIX\|RESEARCH\|PLAY>` |
| Mode validation | Uppercase normalize + array check | Same logic, different values |

## Technical Decisions

### Single-file change scope

The entire CLI change is in `src/tickets/create.ts`:
1. Line 13: `VALID_MODES` array — replace EXECUTE with PLAY
2. Line 17: Help text — replace EXECUTE with PLAY in usage string

No other files need changes. `continue.ts` has a `--dry-run` flag for client-side payload preview, but it is mode-agnostic and needs no changes.

**Rejected alternative**: Adding a `--play-preview` flag — over-engineering for MVP; play preview is deferred.

## Technical Checks

[TCK-01] VALID_MODES includes PLAY and excludes EXECUTE
- Decision Reference: "Replace EXECUTE with PLAY in VALID_MODES" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `VALID_MODES` array contains "PLAY" and does not contain "EXECUTE". Help text shows `--mode <AUTO|BUILD|FIX|RESEARCH|PLAY>`.

## Cross-Platform Considerations

None. The CLI is a thin client. Mode validation is local (string check against VALID_MODES). Platform-specific restrictions (PLAY is NetSuite-only) are enforced by the server API. The CLI does not need platform awareness.

## Performance Expectations

Zero impact. Replacing one string literal in an array has no measurable effect.

## Dependencies

| Dependency | Type | Risk |
|------------|------|------|
| Server API accepting PLAY | Cross-repo | Server migration must be deployed before CLI users try `--mode PLAY` |

## Deferred to Round 2

1. Play-specific CLI subcommands (preview, execute, rollback)
2. Play execution status polling
3. Play result display

## Summary Table

| Area | Decision | Rationale |
|------|----------|-----------|
| VALID_MODES | Replace EXECUTE with PLAY | Zero EXECUTE usage; server rejects EXECUTE |
| Help text | Update mode options | Match VALID_MODES |
| New subcommands | None for MVP | Play execution deferred |

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/tickets/create.ts` | Modify | Replace EXECUTE with PLAY in VALID_MODES array and help text |

## APL Statement Reference

See `tech-research/apl.json` for the complete question-answer-statement-followups chain.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change surface analysis | Single-file change; VALID_MODES + help text |
| diagnosis/apl.json (helix-cli) | Resolved CLI design questions | Replace EXECUTE with PLAY; no new subcommands for MVP |
| product/product.md | CLI requirements | SCN-02 (create via CLI), SCN-09 (CLI help shows Play) |
| scout/reference-map.json (helix-cli) | File inventory | 3 files identified; only create.ts needs changes |
| scout/scout-summary.md (helix-cli) | CLI mode system analysis | VALID_MODES is string tuple; thin client; server enforces restrictions |
| src/tickets/create.ts (lines 13, 17) | Verify VALID_MODES and help text | 5-value string tuple including EXECUTE; help text documents mode options |
