# Tech Research: Goals & PM Agent (Ralph Loop) -- helix-cli

## Technology Foundation

- **Runtime**: Node.js, TypeScript
- **Build**: `tsc`; Test: `tsc && node --test`
- **Current structure**: `src/tickets/` for ticket commands, `src/docs/` for documentation content

---

## Architecture Decision: New `hlx goals` Command Namespace

### Options Considered

**Option A: Add GOAL to VALID_MODES in src/tickets/create.ts**
- Minimal change: 1 array element + 3 doc string updates
- Users create Goals via `hlx tickets create --mode GOAL`
- Prior RSH-534 report assumed this approach

**Option B: New `hlx goals` command namespace**
- New `src/goals/` directory with dedicated commands
- `hlx goals create --title "..." --description "..."`
- `hlx goals list`, `hlx goals get <id>`, `hlx goals terminate <id>`
- Goals are not tickets -- command structure reflects this

### Chosen Option: B -- New `hlx goals` Namespace

### Rationale

Since Goals are a separate database entity (not a TicketMode), the CLI should reflect this:
- Goals are not tickets. `hlx tickets create --mode GOAL` implies Goals are a type of ticket.
- The user said: "Goals can be their own thing. They don't need to be tickets."
- Goal-specific operations (terminate with verdict, list evaluations) don't fit the ticket command structure.

### Key Consequences

1. **VALID_MODES unchanged** -- stays at 5 values (AUTO, BUILD, FIX, RESEARCH, EXECUTE)
2. **New `src/goals/` directory** with create.ts, list.ts, get.ts, terminate.ts
3. **New `hlx goals` top-level command** registered in the CLI entry point
4. **Goal-specific flags**: `--max-children`, `--title`, `--description`

---

## Commands

| Command | Purpose |
|---------|---------|
| `hlx goals create --title "..." --description "..."` | Create a Goal |
| `hlx goals list` | List Goals for the organization |
| `hlx goals get <id>` | Get Goal detail with evaluation history |
| `hlx goals terminate <id> --verdict <complete\|failed>` | Operator termination |

---

## Technical Decisions

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Command namespace | `hlx goals` (new) | `hlx tickets create --mode GOAL` | Goals are separate entities, not ticket modes |
| VALID_MODES | Unchanged (5 values) | Add GOAL | No GOAL TicketMode exists |
| API calls | Goal-specific endpoints (/api/goals/*) | Ticket endpoints | Separate entity has separate API |

---

## Technical Checks

[TCK-01] CLI uses dedicated `hlx goals` namespace, not ticket mode
- Decision Reference: "New hlx goals namespace" (Architecture Decision)
- Verification Method: code-inspection
- Expected Evidence: `src/goals/` directory exists with create.ts, list.ts, get.ts, terminate.ts. VALID_MODES in `src/tickets/create.ts` does NOT contain GOAL.

---

## Dependencies

No new dependencies. Uses existing HTTP client for API calls.

---

## Summary Table

| Area | Decision | Confidence |
|------|----------|------------|
| Command structure | `hlx goals` namespace | High -- follows separate entity |
| VALID_MODES | Unchanged | High -- no GOAL TicketMode |
| Implementation scope | 4 new command files + registration | Medium -- new directory pattern |

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Description) | User entity preference | "Goals can be their own thing" -- separate CLI namespace |
| diagnosis/diagnosis-statement.md (cli) | Current state | VALID_MODES at create.ts line 13, 5 values, uppercase normalization |
| scout/scout-summary.md (cli) | Change scope analysis | If separate entity: new goals/ directory with commands (not just VALID_MODES update) |
| Server tech-research | Entity model decision | Goals are separate entity -- CLI command structure follows |
