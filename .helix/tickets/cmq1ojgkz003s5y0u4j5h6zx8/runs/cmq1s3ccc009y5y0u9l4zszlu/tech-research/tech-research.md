# Tech Research — helix-cli

## Technology Foundation

- **Runtime**: Node.js + TypeScript
- **Build**: `tsc`
- **Test**: `tsc + node --test`
- **Typecheck**: `tsc --noEmit`
- **Architecture**: Thin client — validates mode locally, sends mode string to server API; server enforces platform restrictions

## Architecture Decision

### Decision 1: Replace EXECUTE with PLAY in VALID_MODES (L1)

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| A: Replace EXECUTE with PLAY | Clean; matches server API; no dead code | Scripts using `--mode EXECUTE` break |
| B: Accept both EXECUTE and PLAY | Backward compatible | Dead code; server rejects EXECUTE anyway; confusing |

**Chosen: Option A** — Replace EXECUTE with PLAY in the `VALID_MODES` tuple. Update help text accordingly.

**Rationale**: Zero EXECUTE tickets exist in production. No scripts depend on `--mode EXECUTE`. The server will reject EXECUTE after the API validation update, so keeping it in the CLI gives users a mode the server rejects — a confusing failure path. Clean replacement is correct.

### Decision 2: No new CLI subcommands for L1 (L2/L3 deferred)

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| A: L1 = mode flag only; defer play subcommands to L2/L3 | Minimal change; matches "use normal ticket system" | L2/L3 users lack CLI play tools |
| B: Add placeholder subcommands now | Forward-compatible | Dead code; over-engineering for L1 |

**Chosen: Option A** — The CLI's ticket creation flow with `--mode PLAY` is sufficient for L1. The ticket description says "Use normal Helix ticket system to create a Play."

L2/L3 deferred subcommands:
- `hlx plays preview` — trigger play preview from CLI
- `hlx plays run` — trigger play execution from CLI
- `hlx plays status` — check play execution status
- `hlx plays list` — list plays for a ticket

These would be new files in `src/plays/` mirroring the existing `src/tickets/` pattern.

## Core API/Methods

| Surface | Current | After | File |
|---------|---------|-------|------|
| `VALID_MODES` tuple | AUTO, BUILD, FIX, RESEARCH, EXECUTE | AUTO, BUILD, FIX, RESEARCH, PLAY | create.ts:13 |
| Help text | `--mode <AUTO\|BUILD\|FIX\|RESEARCH\|EXECUTE>` | `--mode <AUTO\|BUILD\|FIX\|RESEARCH\|PLAY>` | create.ts:17 |
| Mode validation | `includes()` check | Same logic, different value | create.ts:79-88 |
| Docs mode table | Includes EXECUTE | Includes PLAY | cli-content.ts:109 |

## Technical Decisions

### Deploy ordering

Server must deploy first. The CLI sends `mode: "PLAY"` to `POST /api/tickets`. If PLAY is sent before the server recognizes it in `platformConfig.allowedModes`, the server returns 400. This is low risk — the standard deploy pipeline is server-first.

**Rejected alternative**: Version-negotiated mode values — over-engineering for a simultaneous release.

### Docs file update

`cli-content.ts` contains an embedded copy of CLI documentation (mode list at line 109). This must be updated alongside `create.ts` to keep the docs mirror consistent with actual behavior.

## Technical Checks

[TCK-01] PLAY in VALID_MODES
- Decision Reference: "Replace EXECUTE with PLAY in VALID_MODES" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `VALID_MODES` tuple contains "PLAY" and does not contain "EXECUTE". Help text shows PLAY.

[TCK-02] CLI docs show PLAY
- Decision Reference: "Docs file update" (Technical Decision)
- Verification Method: code-inspection
- Expected Evidence: `cli-content.ts` mode list includes PLAY and does not include EXECUTE.

[TCK-03] Mode validation accepts PLAY
- Decision Reference: "Replace EXECUTE with PLAY" (Architecture Decision 1)
- Verification Method: behavioral
- Expected Evidence: `hlx tickets create --mode PLAY ...` succeeds (server permitting). `hlx tickets create --mode EXECUTE ...` produces CLI validation error before hitting server.

## Cross-Platform Considerations

None. The CLI is platform-agnostic — it sends mode strings to the server, which enforces platform restrictions. The CLI does not need to know which modes are platform-specific.

## Performance Expectations

Zero impact. The change is a string value replacement in a static tuple and inline help text.

## Dependencies

| Dependency | Type | Level | Risk |
|------------|------|-------|------|
| Server PLAY recognition | Cross-repo | L1 | Low — server deploys first in standard pipeline |

## Deferred to Round 2

1. **Play subcommands** — `hlx plays preview/run/status/list` (L2/L3)
2. **Play step definition from CLI** — Define MAP/REDUCE/EFFECT steps via CLI (L2)
3. **Play execution output streaming** — Stream play execution results to terminal (L3)

## Summary Table

| Area | Decision | Level | Rationale |
|------|----------|-------|-----------|
| Mode flag | PLAY replaces EXECUTE in VALID_MODES | L1 | 0 EXECUTE tickets; server rejects EXECUTE |
| Subcommands | None for L1; deferred to L2/L3 | L1 | "Use normal ticket system to create a Play" |
| Deploy order | Server first | L1 | CLI mode string validated server-side |
| Docs | Update cli-content.ts mode list | L1 | Keep docs mirror consistent |

## APL Statement Reference

See `tech-research/apl.json` for the full investigation trace.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (description item 1) | CLI scope | "Use normal Helix ticket system to create a Play" |
| diagnosis/diagnosis-statement.md (cli) | CLI change surface | 2-file change; thin client; server enforces restrictions |
| diagnosis/apl.json (cli) | Investigation findings | VALID_MODES at create.ts:13; help text at :17; docs at cli-content.ts:109 |
| product/product.md | Success criteria SCN-02 | `hlx tickets create --mode PLAY --title "..."` |
| src/tickets/create.ts:13,17 | Verify mode flag | VALID_MODES tuple; inline help text |
| src/docs/cli-content.ts:109 | Verify docs | Mode table includes EXECUTE |
