# Tech Research — helix-cli (Play Mode L1 Foundation)

## Technology Foundation

- **Runtime**: Node.js (ES modules, Node 18+)
- **Language**: TypeScript (strict)
- **Package**: `@projectxinnovation/helix-cli`, binary: `hlx`
- **Build**: `tsc`
- **Typecheck**: `tsc --noEmit`
- **Test**: `tsc && node --test dist/**/*.test.js`

No new dependencies are introduced.

## Architecture Decision 1: VALID_MODES Replacement Strategy

**Context**: `VALID_MODES` at `src/tickets/create.ts:13` is a plain `string[]` constant: `["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]`. It is NOT typed against the server-side TicketMode Prisma enum — it can be updated independently.

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Replace EXECUTE with PLAY | Swap the string in the array | Clean. Matches server z.enum changes. Users see PLAY, not EXECUTE. | hlx commands with --mode EXECUTE will fail. |
| B. Add PLAY alongside EXECUTE | Keep both in array | Users can still use EXECUTE | EXECUTE has 0 production usage. Server rejects EXECUTE. Would cause confusing UX where CLI accepts but server rejects. |

**Chosen: Option A — Replace EXECUTE with PLAY**

**Rationale**: VALID_MODES is a simple string array used for client-side validation before sending to the server. The server z.enum will reject EXECUTE, so keeping it in CLI VALID_MODES would create a misleading UX where the CLI accepts a value the server rejects. Replacing ensures consistency.

## Architecture Decision 2: Skill Content Markdown Editability

**Context**: `skill-content/references/commands.md` references EXECUTE at lines 119 and 128. Diagnosis flagged an unknown about whether this file is auto-generated.

**Decision**: Code inspection found no auto-generation markers ("auto-generated", "DO NOT EDIT", etc.) in the file. It appears to be manually maintained. Safe to edit directly. If it later turns out to be auto-generated, the generator would need updating separately — but the edit is still correct.

## Core API/Methods

No new CLI commands or flags in L1. Changes are string replacements:

| File | Location | Change |
|------|----------|--------|
| `src/tickets/create.ts:13` | VALID_MODES array | Replace `"EXECUTE"` with `"PLAY"` |
| `src/tickets/create.ts:17` | Usage help string | Replace EXECUTE with PLAY in mode list |
| `src/tickets/index.ts:21` | Usage string | Replace EXECUTE with PLAY |
| `src/tickets/index.ts:73` | Usage string | Replace EXECUTE with PLAY |
| `src/docs/cli-content.ts:109` | Mode table | Replace EXECUTE with PLAY |
| `src/docs/cli-content.ts:250` | Example text | Replace EXECUTE with PLAY |
| `skill-content/references/commands.md:119` | Command signature | Replace EXECUTE with PLAY |
| `skill-content/references/commands.md:128` | Mode flag table | Replace EXECUTE with PLAY |

## Technical Decisions (with rejected alternatives)

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| VALID_MODES | Replace EXECUTE with PLAY | Add alongside | Server rejects EXECUTE; inconsistent UX |
| commands.md | Edit directly | Skip (may be auto-generated) | No auto-gen markers found; safe to edit |

## Technical Checks

[TCK-01] VALID_MODES includes PLAY, not EXECUTE
- Decision Reference: "Replace EXECUTE with PLAY" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `VALID_MODES` at create.ts contains `"PLAY"` and does NOT contain `"EXECUTE"`. Array has 5 entries: AUTO, BUILD, FIX, RESEARCH, PLAY.

[TCK-02] All usage/help strings show PLAY
- Decision Reference: "Replace EXECUTE with PLAY" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: Grep for "EXECUTE" across CLI source files returns zero matches. Help text for `--mode` flag shows PLAY in the mode list.

## Performance Expectations

No performance impact. String replacements only.

## Dependencies

No new package dependencies.

## Deferred to Round 2

- **CLI play subcommands** (L2/L3) — `hlx play preview`, `hlx play run` etc.

## Summary Table

| Aspect | Decision |
|--------|----------|
| VALID_MODES | Replace EXECUTE with PLAY |
| Help strings | Replace EXECUTE with PLAY in 3 usage strings |
| CLI docs | Replace EXECUTE with PLAY in mode table and examples |
| commands.md | Edit directly (not auto-generated) |
| Test changes | None (0 test files reference EXECUTE) |
| Files changed | 4 source files + 1 markdown |
| New dependencies | None |

## APL Statement Reference

Minimal CLI change: replace EXECUTE with PLAY in VALID_MODES string array, 3 usage help strings, and 4 documentation references across 4 source files + 1 markdown. VALID_MODES is independently typed from server TicketMode — no cross-repo type dependency. No test changes needed.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-725, library run root) | Primary ticket context and Research Report RSH-707 | CLI listed as lightest target with 2 files |
| diagnosis/diagnosis-statement.md (CLI) | CLI change surface | 4 source + 1 markdown; VALID_MODES is plain string array |
| diagnosis/apl.json (CLI) | CLI diagnosis evidence | 2 questions resolved; no test changes confirmed |
| product/product.md (server) | Product specification | CLI must accept mode PLAY; EXECUTE must be rejected |
| scout/reference-map.json (CLI) | File inventory with line numbers | 4 source files + 1 markdown; exact locations |
| scout/scout-summary.md (CLI) | Analysis summary | VALID_MODES independently typed; no test coverage of EXECUTE |
| commands.md:1-10, 119-128 | Direct code inspection | No auto-generation markers found; safe to edit |
