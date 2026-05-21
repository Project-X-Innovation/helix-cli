# Tech Research: Goals & PM Agent (Ralph Loop) -- helix-cli

## Technology Foundation

- **Runtime**: Node.js, TypeScript
- **Build**: tsc
- **Test**: tsc && node --test
- **Existing pattern**: VALID_MODES const array with uppercase normalization and includes validation

## Architecture Decision 1: Add GOAL to VALID_MODES

### Approach

Minimal change: add `'GOAL'` to the `VALID_MODES` const array at `src/tickets/create.ts` line 13. The existing mode validation logic (lines 79-88) normalizes input to uppercase and uses `includes()` -- no logic changes needed. The mode is conditionally included in the request body (line 147) -- no structural changes needed.

### Supporting Changes

| File | Change | Purpose |
|------|--------|---------|
| `src/tickets/create.ts` line 13 | Add `'GOAL'` to VALID_MODES array | Accept GOAL mode for ticket creation |
| `src/tickets/create.ts` line 17 | Update usage string | List GOAL in help text |
| `src/tickets/index.ts` | Update help text | List GOAL in command description |
| `src/docs/cli-content.ts` | Update documentation | List GOAL in CLI documentation |

### Rejected Alternative: Goal-Specific CLI Flags

Goal-specific creation fields (e.g., `--max-children`) are not needed at CLI creation time for MVP. The server API handles defaults (maxChildren=20). If Goal-specific CLI options are needed later, they can be added as optional flags to the create command.

## Technical Checks

[TCK-01] GOAL in VALID_MODES and help text
- Decision Reference: "Add GOAL to VALID_MODES const array"
  (from Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: src/tickets/create.ts VALID_MODES array includes 'GOAL'. Usage strings in create.ts, index.ts, and cli-content.ts mention GOAL.

## Performance Expectations

No performance impact. Adding a string to a const array.

## Dependencies

No new dependencies required.

## Risks

No risks. Trivial addition following established pattern.

## Deferred to Round 2

- Goal-specific CLI flags (--max-children, --terminate)
- Goal status display in `hlx tickets get` output
- Goal child tree display in CLI

## Summary Table

| Decision | Choice | Key Rationale |
|----------|--------|---------------|
| VALID_MODES addition | Add 'GOAL' string to array | Existing validation handles new values automatically |
| Goal-specific flags | Deferred | Server defaults sufficient for MVP |

## APL Statement Reference

See tech-research/apl.json for investigation context.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-488) | Primary specification | Section 4.2: CLI change is adding GOAL to VALID_MODES |
| diagnosis/diagnosis-statement.md (helix-cli) | Root cause analysis | 1 code change + 3 doc string updates; no structural changes |
| diagnosis/apl.json (helix-cli) | Investigation findings | Minimal scope confirmed; validation handles new values automatically |
| scout/scout-summary.md (helix-cli) | Analysis summary | VALID_MODES at line 13, usage strings at 3 locations |
| product/product.md (helix-global-server) | Product requirements | CLI support: `hlx tickets create --mode GOAL` is MVP feature #12 |
