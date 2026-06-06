# Tech Research — helix-cli

## Technology Foundation

- **Runtime**: Node.js + TypeScript
- **Architecture**: Thin CLI client -- sends requests to helix-global-server
- **Mode validation**: Local VALID_MODES array, but server is authoritative gatekeeper
- **Validation**: `npm run typecheck && npm run build`

The CLI is the smallest change surface. It accepts mode strings from the user and sends them to the server. The server validates against platform config. The CLI needs to recognize PLAY as a valid mode and display it in help text.

---

## Architecture Decision

### Simple string replacement (3 files)

**Options Considered**:

**Option A: Accept both EXECUTE and PLAY (backward compat)**
- Map EXECUTE -> PLAY on the client side before sending to server.
- Pros: Scripts using `--mode EXECUTE` keep working.
- Cons: EXECUTE has zero usage, so there are no scripts to break. Adds complexity for nothing.

**Option B: Replace EXECUTE with PLAY (chosen)**
- Clean replacement in VALID_MODES and all help text.
- Pros: Simple, consistent, no dead code.
- Cons: `--mode EXECUTE` stops working. But nobody uses it (0/852 tickets).

**Chosen: Option B.** Clean replacement with no backward compat concern.

---

## Five MVP Levels: CLI Changes

### MVP-1: Mode Scaffolding (3 files)

| File | Change | Lines |
|------|--------|-------|
| `src/tickets/create.ts` | Replace EXECUTE with PLAY in VALID_MODES array and help text | 13, 17 |
| `src/tickets/index.ts` | Replace EXECUTE with PLAY in usage text and help text | 21, 73 |
| `src/docs/cli-content.ts` | Replace EXECUTE with PLAY in mode table, example text, and mode description | 109, 247, 250 |

**Mode validation flow**: User passes `--mode PLAY` -> CLI normalizes to uppercase -> checks against VALID_MODES -> sends `mode: "PLAY"` in POST body -> server validates against platformConfig.allowedModes.

### MVP-2/3/4/5: Play-specific subcommands (deferred)

Future levels may add:
- `hlx plays list` -- list plays for a ticket
- `hlx plays preview` -- trigger preview execution
- `hlx plays run` -- trigger full execution
- `hlx plays status` -- check run status

These are not needed at MVP-1 and depend on server API endpoints from MVP-2+.

---

## Technical Decisions

### TD-1: VALID_MODES replaces EXECUTE with PLAY
- **Decision**: Change `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']` to `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'PLAY']`.
- **Rationale**: The CLI should only accept modes that the server recognizes. EXECUTE is removed from server app surfaces.
- **Note**: The mode validation logic (lines 79-87) normalizes to uppercase and checks inclusion -- no structural change needed.

### TD-2: Help text updated throughout
- **Decision**: All three files have their help/usage text updated from EXECUTE to PLAY.
- **Rationale**: Users reading `hlx tickets create --help` should see PLAY, not EXECUTE.

### TD-3: Deploy ordering -- server first
- **Decision**: Server must deploy before CLI.
- **Rationale**: If CLI sends `mode: "PLAY"` before server recognizes it in `platformConfig.allowedModes`, server returns 400. With server deployed first, PLAY works immediately.
- **Evidence**: `ticket-controller.ts` line 152 validates mode against `platformConfig.allowedModes`.

---

## Technical Checks

[TCK-01] PLAY accepted in VALID_MODES, EXECUTE rejected
- Decision Reference: "VALID_MODES replaces EXECUTE with PLAY" (TD-1)
- Verification Method: code-inspection
- Expected Evidence: `create.ts` VALID_MODES array contains 'PLAY', does not contain 'EXECUTE'. Help text shows PLAY.

[TCK-02] All help text references PLAY not EXECUTE
- Decision Reference: "Help text updated throughout" (TD-2)
- Verification Method: code-inspection
- Expected Evidence: `create.ts` help string shows PLAY. `index.ts` usage and help strings show PLAY. `cli-content.ts` mode table, example, and description show PLAY. No string "EXECUTE" in any user-facing text.

---

## Cross-Platform Considerations

- CLI sends mode to server via POST body -- server is authoritative validator
- CLI mode list must match what server accepts for NETSUITE orgs
- Deploy server before CLI to avoid 400 rejections

---

## Performance Expectations

Zero performance impact. Pure string replacements in static arrays and help text.

---

## Dependencies

No new dependencies. All changes use existing TypeScript patterns.

---

## Deferred to Round 2

| Item | Why Deferred |
|------|-------------|
| Play-specific subcommands | Depends on server API endpoints from MVP-2+ |
| Play status/monitoring in CLI | Depends on PlayRun data model from MVP-2 |

---

## Summary Table

| Aspect | Decision |
|--------|----------|
| Scope | 3 files |
| Approach | Replace EXECUTE with PLAY in VALID_MODES + help text |
| Deploy order | After server |
| New deps | None |
| Structural changes | None -- pure string replacements |

---

## APL Statement Reference

See `tech-research/apl.json`. Key finding: The CLI is a thin client. All PLAY mode logic (validation, platform gating, execution) lives on the server. The CLI just needs to accept "PLAY" as a mode string and display it in help text.

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/diagnosis-statement.md (CLI) | File-level change map | 3 files with specific line numbers |
| diagnosis/apl.json (CLI) | Investigation findings | Clean replacement; server-first deploy |
| scout/scout-summary.md (CLI) | CLI analysis | Thin client; server enforces platform restrictions |
| product/product.md | Product spec | CLI accepts `hlx tickets create --mode PLAY` |
| src/tickets/create.ts (lines 13, 17) | Direct inspection | VALID_MODES array and help text |
| src/tickets/index.ts (lines 21, 73) | Reference from diagnosis | Usage text locations |
| src/docs/cli-content.ts (lines 109, 247, 250) | Direct inspection | Mode table and descriptions |
