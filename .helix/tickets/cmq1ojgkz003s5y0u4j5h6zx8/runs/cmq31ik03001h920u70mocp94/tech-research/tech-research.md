# Tech Research — MVP NetSuite Play Mode (helix-cli)

## Technology Foundation

- **Runtime:** Node.js + TypeScript
- **Architecture:** CLI command handlers with local validation + server API delegation
- **Mode validation:** VALID_MODES array in `create.ts`, case-insensitive normalization

## Architecture Decision 1: Replace EXECUTE with PLAY in VALID_MODES

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| A: Accept both EXECUTE and PLAY | Backward compatible | Dead mode; confusing help text |
| B: Replace EXECUTE with PLAY | Clean; matches server | Breaking change for EXECUTE users (zero exist) |

### Chosen: Option B — Replace EXECUTE with PLAY

**Rationale:** Zero production usage of EXECUTE. Ticket says "replaces execute." CLI is a thin client — platform enforcement (NetSuite-only gating) is server-side.

**Evidence:** `create.ts:13` — `VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]`. Runtime DB: 0 EXECUTE tickets.

## Core API/Methods

### MVP-1 File Changes (CLI)

| File | Change |
|------|--------|
| `src/tickets/create.ts:13` | Replace EXECUTE with PLAY in VALID_MODES |
| `src/tickets/create.ts:17` | Update help text to show PLAY |
| `src/tickets/index.ts:21` | Replace EXECUTE with PLAY in usage text |
| `src/tickets/index.ts:73` | Replace EXECUTE with PLAY in help text |
| `src/docs/cli-content.ts:109,247,250` | Replace EXECUTE with PLAY in docs |
| `skill-content/SKILL.md` | Update mode references |
| `skill-content/references/commands.md` | Update --mode docs |

### Case-Insensitive Validation

The CLI normalizes mode input to uppercase (`create.ts:82`). Users can type `play`, `Play`, or `PLAY` — all are accepted. This behavior is preserved.

## Technical Decisions

### CLI as Thin Client

The CLI validates mode strings locally against VALID_MODES but delegates platform enforcement to the server. The CLI does not check whether the user's org is NetSuite — that's server-side validation. This means the CLI change is purely a string replacement with no conditional logic.

### Deploy After Server

Server must deploy first. CLI sends `mode: "PLAY"` in POST body to `/api/tickets`. If server doesn't recognize PLAY, it returns 400 from Zod validation. Coordinate deployment.

### No New Subcommands for MVP-1

Play-specific subcommands (`hlx plays list`, `hlx plays run`, `hlx plays status`) are deferred to future tickets. MVP-1 only touches the existing `create` command.

## Technical Checks

[TCK-01] PLAY replaces EXECUTE in VALID_MODES
- Decision Reference: "Replace EXECUTE with PLAY" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: VALID_MODES array contains "PLAY" and does not contain "EXECUTE". Help text shows PLAY.

[TCK-02] Case-insensitive mode validation preserved
- Decision Reference: "Case-insensitive normalization preserved"
- Verification Method: code-inspection
- Expected Evidence: Mode input normalized to uppercase before validation. `play`, `Play`, `PLAY` all accepted.

[TCK-03] Documentation updated
- Decision Reference: "Replace EXECUTE in docs"
- Verification Method: code-inspection
- Expected Evidence: cli-content.ts, SKILL.md, commands.md show PLAY not EXECUTE in mode descriptions.

## Performance Expectations

- Zero performance impact. String replacement only.

## Dependencies

| Dependency | Type | Risk | Mitigation |
|-----------|------|------|------------|
| Server API | External | Medium | Server must deploy first. `--mode PLAY` fails if server doesn't recognize it. |

## Deferred to Round 2

- Play-specific subcommands (`hlx plays list`, `hlx plays run`)
- Play execution trigger from CLI
- Play status monitoring

## Summary Table

| Aspect | Decision |
|--------|----------|
| Mode approach | Replace EXECUTE with PLAY in VALID_MODES |
| Files changed | 3-5 source files + 2 skill docs |
| New commands | None for MVP-1 |
| Deploy order | After server |
| Validation | Local string validation; platform gating is server-side |

## APL Statement Reference

See `tech-research/apl.json`.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary spec | Plays replace EXECUTE |
| diagnosis/diagnosis-statement.md (CLI) | CLI changes | 3-5 files; smallest surface |
| diagnosis/apl.json (CLI) | Answers | Replace EXECUTE; deploy after server |
| product/product.md (CLI) | Requirements | 4 success criteria; 4 scenarios |
| repo-guidance.json | Cross-repo | CLI is target with smallest surface |
| create.ts:13 | Verified VALID_MODES | 5-value array with EXECUTE |
| create.ts:17 | Verified help text | Shows 5 modes including EXECUTE |
