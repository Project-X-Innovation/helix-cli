# Scout Summary — helix-cli

## Problem

Update the Helix CLI to support Goal creation. The scope depends on the entity model decision: if Goals use TicketMode, it's a single VALID_MODES addition + docs. If Goals are a separate entity (as the user's continuation context suggests), the CLI may need a dedicated `hlx goals` command namespace.

## Analysis Summary

**VALID_MODES (src/tickets/create.ts line 13):** Central constant defining accepted modes as a const array. Currently 5 values: AUTO, BUILD, FIX, RESEARCH, EXECUTE. Adding GOAL requires a single array element addition if TicketMode approach.

**Usage strings:** Three locations reference the valid mode list: create.ts usage (line 17), tickets/index.ts help text, and docs/cli-content.ts documentation (lines 107, 203).

**No existing Goal references:** Grep for goal/Goal/GOAL across src/ returned zero matches. This is a greenfield addition.

**Entity model impact on CLI scope:**
- **TicketMode approach**: Minimal — add GOAL to VALID_MODES, update 3 doc strings.
- **Separate entity approach**: More significant — may need `hlx goals create`, `hlx goals list`, `hlx goals get <id>`, `hlx goals terminate <id>` commands, plus Goal-specific flags (--max-children, etc.).

## Relevant Files

| File | Lines | Relevance |
|------|-------|-----------|
| `src/tickets/create.ts` | 13, 17, 79-88, 147 | VALID_MODES array, usage string, mode validation, request body |
| `src/tickets/index.ts` | — | Help/usage text referencing valid modes |
| `src/docs/cli-content.ts` | 107, 203 | CLI documentation listing valid modes |
| `src/tickets/get.ts` | 10 | RelatedTicket type includes mode field |
| `package.json` | — | Build: tsc; Test: tsc && node --test |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report, RSH-488) | Primary specification | Section 4.2: CLI change is adding GOAL to VALID_MODES in create.ts |
| ticket.md (Continuation Context) | User design directive | Goals may be separate entity, impacting CLI command structure |
| src/tickets/create.ts | Verify VALID_MODES location and pattern | Line 13 const array, uppercase normalization, includes validation |
| src/docs/cli-content.ts | Documentation references | Mode docs at lines 107 and 203 |
