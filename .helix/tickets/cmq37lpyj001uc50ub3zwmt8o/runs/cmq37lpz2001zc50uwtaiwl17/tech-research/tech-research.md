# Tech Research: MVP NetSuite Play Mode — Level 1 (helix-cli)

## Technology Foundation

- **Runtime**: Node.js, TypeScript strict mode
- **Build/Quality**: `npm run build` (tsc), `npm run typecheck` (tsc --noEmit), `npm run test` (tsc && node --test)
- **Package exports**: `"./docs"` export consumed by helix-global-client for CLI documentation content

## Architecture Decision

### Decision 1: EXECUTE replacement in VALID_MODES

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Replace EXECUTE with PLAY | Remove EXECUTE, add PLAY to the const array | Prevents users from selecting EXECUTE; clean | Not backwards compatible if anyone uses --mode EXECUTE |
| B. Add PLAY alongside EXECUTE | Keep both in VALID_MODES | Backwards compatible | Allows creating EXECUTE tickets that the product wants hidden |

**Chosen option: A — Replace EXECUTE with PLAY**

**Rationale**: EXECUTE has 0 production tickets. No CLI user has ever successfully used `--mode EXECUTE`. The product spec explicitly requires EXECUTE to be hidden from all user-facing surfaces, and the CLI help text is a user-facing surface. The CLI validates mode client-side before sending to the server API, so PLAY must be in VALID_MODES for users to select it. The server API retains EXECUTE in the Zod enum for backwards compatibility, but the CLI should not offer it.

## Core API/Methods

### Files changed (3 files):

1. **`src/tickets/create.ts`** — Replace `"EXECUTE"` with `"PLAY"` in `VALID_MODES` array (line 13); update help text (line 17) to show `<AUTO|BUILD|FIX|RESEARCH|PLAY>`
2. **`src/tickets/index.ts`** — Update help text at lines 21 and 73 to show PLAY instead of EXECUTE
3. **`src/docs/cli-content.ts`** — Update mode documentation at lines 109 and 250 to show "AUTO, BUILD, FIX, RESEARCH, or PLAY"

### Key patterns:

- **VALID_MODES as const**: The `VALID_MODES` array uses `as const` for type narrowing. The mode validation logic (create.ts:79-88) checks `VALID_MODES.includes(modeArg)`. PLAY must be in this array for the CLI to accept it.
- **Help text convention**: Mode options are listed in angle brackets: `<AUTO|BUILD|FIX|RESEARCH|PLAY>`. This pattern appears in 3 locations across 2 files.
- **Shared docs export**: `cli-content.ts` is exported as `"./docs"` in package.json and consumed by `helix-global-client/src/lib/helix-cli-docs-content.ts`. Changes here affect both CLI and client documentation rendering.

## Technical Decisions

### TD-1: Help text format
Follow the existing pattern: `<AUTO|BUILD|FIX|RESEARCH|PLAY>`. PLAY appears last (replacing EXECUTE's position) to maintain alphabetical ordering of the non-AUTO modes.

### TD-2: CLI docs content shared export
The `cli-content.ts` file is a shared export consumed by the client. Both the CLI and client display this content. Updating it in the CLI package automatically updates the client's CLI documentation view. No separate client-side change is needed for this content.

**Rejected alternative**: Duplicating the docs content in the client. This would create a maintenance burden and risk divergence.

## Technical Checks

[TCK-01] VALID_MODES includes PLAY, excludes EXECUTE
- Decision Reference: "Replace EXECUTE with PLAY in VALID_MODES" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `create.ts` VALID_MODES array contains `"PLAY"` and does NOT contain `"EXECUTE"`. Help text at line 17 shows `<AUTO|BUILD|FIX|RESEARCH|PLAY>`.

[TCK-02] All help text locations updated
- Decision Reference: "Help text format" (Technical Decision TD-1)
- Verification Method: code-inspection
- Expected Evidence: All 5 locations updated: create.ts:13 (VALID_MODES), create.ts:17 (help text), index.ts:21 (usage), index.ts:73 (create help), cli-content.ts:109 and :250 (docs).

## Cross-Platform Considerations

None. The CLI is a Node.js application with no platform-specific behavior relevant to this change.

## Performance Expectations

No performance impact. Changes are to static const arrays and string literals.

## Dependencies

- No new dependencies.
- **Cross-repo dependency**: CLI sends `mode: "PLAY"` to the server API. Server must deploy the PLAY schema migration and API validation changes first, otherwise the API will reject `mode: "PLAY"` with a validation error.
- **Shared export**: `cli-content.ts` is consumed by helix-global-client. Changes to mode documentation text propagate to the client.

## Deferred to Round 2

- Play-specific CLI commands (Level 2+) — e.g., `hlx plays list`, `hlx plays run`
- PLAYBOOK_CHECK in CLI VALID_MODES — CLI currently lacks PLAYBOOK_CHECK; separate concern

## Summary Table

| Aspect | Decision |
|--------|----------|
| VALID_MODES | Replace EXECUTE with PLAY |
| Help text | 5 locations updated across 3 files |
| Shared docs | cli-content.ts export propagates to client |
| Files changed | 3 files |
| Performance impact | None |
| New dependencies | None |

## APL Statement

The helix-cli replaces EXECUTE with PLAY in the VALID_MODES array and updates all 5 help/documentation text locations. Three files change: create.ts (VALID_MODES + help text), index.ts (2 usage strings), cli-content.ts (2 documentation references). This is a straightforward text-level change with no architectural decisions beyond the EXECUTE-to-PLAY replacement.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report) | Primary specification for Level 1 scope | CLI needs VALID_MODES update and help text changes for PLAY mode |
| product/product.md (server) | Product requirements and success criteria | CLI accepts --mode PLAY; help text updated; EXECUTE hidden |
| diagnosis/apl.json (CLI) | Investigation context | VALID_MODES is local const; 5 edit locations across 3 files |
| diagnosis/diagnosis-statement.md (CLI) | Evidence for CLI changes | EXECUTE=0 tickets; safe to replace; CLI validates mode client-side |
| scout/reference-map.json (CLI) | File inventory and code facts | 4 files; VALID_MODES at create.ts:13; cli-content.ts shared export |
| scout/scout-summary.md (CLI) | Consolidated analysis | 3 files, 5 edit locations; mode passed as string in POST body |
| create.ts:1-30 | Verified VALID_MODES and help text | VALID_MODES = ['AUTO','BUILD','FIX','RESEARCH','EXECUTE'] as const; help text references --mode options |
