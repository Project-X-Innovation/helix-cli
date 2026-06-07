# Tech Research — helix-cli

## Technology Foundation

- **Runtime**: Node.js + TypeScript (compiled via `tsc` to `dist/`)
- **Package**: `@projectxinnovation/helix-cli` (binary: `hlx`)
- **Existing playbook commands**: `hlx playbook check <ruleId>`, `hlx playbook checks <ruleId>`
- **Skill documentation**: `skill-content/SKILL.md` — the primary interface for AI agent / MCP client discovery

No new dependencies or runtime changes required. This is a documentation-only update.

## Architecture Decision

### Decision 1: SKILL.md Documentation Update — Scope

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. SKILL.md update only | Add playbook to frontmatter triggers and commands table | Minimal change; documents what exists; unblocks MCP/AI agent discovery | Does not add rule CRUD commands |
| B. SKILL.md + new rule CRUD CLI commands | Add full rule management CLI commands + documentation | Complete CLI parity with REST API | Scope creep; MCP tools are server-side and don't use CLI; out of ticket scope |
| C. No changes | Skip CLI entirely | Zero effort | Existing playbook commands remain invisible to AI agents |

**Chosen: Option A — SKILL.md update only**

**Rationale**: The ticket's CLI research question asks "what, if anything, helix-cli needs to support Playbook-over-MCP." MCP tools delegate directly to server-side service functions, not through CLI commands. The CLI's role is as a standalone interface for users, not an MCP intermediary. Documenting the existing `check` and `checks` commands in SKILL.md makes them discoverable by AI agents using the hlx-cli skill. Rule CRUD commands are a separate enhancement.

## Core API/Methods

### SKILL.md Changes

**1. Frontmatter `description` triggers** — Add playbook triggers:

Current triggers end with: `...hlx update, hlx skill show/install, broken hlx install, install recovery.`

Add: `hlx playbook check, hlx playbook checks`

**2. Commands-at-a-glance table** — Add playbook row:

```
| playbook | Trigger compliance checks and view check history |
```

This follows the established pattern: one row per command group with a brief description.

**3. Workflow section** — Optionally add a compliance check step. The current workflow covers auth → org → tickets → artifacts → create → continue → inspect → comment. A playbook step could be added after inspect:

```
10. Check compliance: `hlx playbook check <ruleId>` — triggers and polls to completion.
```

## Technical Decisions (with rejected alternatives)

### Playbook Command Description — Wording

**Chosen**: "Trigger compliance checks and view check history" — concise, action-oriented, covers both subcommands.

**Rejected**: "Manage playbook rules and run compliance checks" — rejected because the CLI does not currently support rule management (create/list/get/update/delete). The description should accurately reflect available commands.

### Workflow Section Inclusion — Optional

**Chosen**: Add a brief step for compliance checking in the workflow section.

**Rationale**: The workflow section is meant to guide AI agents through common sequences. Compliance checking is a distinct user task that doesn't fit neatly into the existing ticket-centric workflow, but mentioning it ensures discoverability.

## Technical Checks

[TCK-01] SKILL.md frontmatter includes playbook triggers
- Decision Reference: "Add playbook to frontmatter triggers"
  (from Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: SKILL.md frontmatter `description` field contains `hlx playbook check` and `hlx playbook checks`.

[TCK-02] Commands table includes playbook row
- Decision Reference: "Add playbook row to commands-at-a-glance table"
  (from Core API/Methods section)
- Verification Method: code-inspection
- Expected Evidence: Commands table has a `playbook` row with description. Table has 10 entries (previously 9).

[TCK-03] Build passes after changes
- Decision Reference: "Quality gates: npm run build"
  (from helix-cli diagnosis)
- Verification Method: behavioral
- Expected Evidence: `npm run build` completes without errors. Since only SKILL.md (a markdown file) is changed, build should pass trivially.

## Cross-Platform Considerations

No cross-platform concerns. SKILL.md is a markdown file consumed by AI agents as text. It is not compiled, type-checked, or deployed independently.

## Performance Expectations

No performance impact. SKILL.md is read once by AI agent sessions, not at runtime.

## Dependencies

### Internal Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `skill-content/SKILL.md` | Documentation file to update | Exists, needs playbook section |
| `src/playbook/index.ts` | Existing command router | Exists, no changes needed |
| `src/playbook/check.ts` | Existing check command | Exists, no changes needed |
| `src/playbook/checks.ts` | Existing checks command | Exists, no changes needed |

### External Dependencies

None.

## Deferred to Round 2

1. **Rule CRUD CLI commands** — `hlx playbook rules list/create/get/update/delete` following the `goals/` CRUD pattern
2. **Playbook section in references/commands.md** — Detailed flag reference for playbook commands

## Summary Table

| Aspect | Decision |
|--------|----------|
| Changed file | `skill-content/SKILL.md` |
| Change type | Documentation only |
| Sections updated | Frontmatter triggers, commands table, workflow (optional) |
| New commands | None — documenting existing `check` and `checks` commands |
| Quality gates | `npm run build` |

## APL Statement Reference

Update `skill-content/SKILL.md` to document existing playbook check/checks commands: add to frontmatter triggers, commands table, and the workflow section. No new CLI commands needed.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Research question 4: CLI involvement | CLI needs SKILL.md update; MCP tools are server-side |
| diagnosis/diagnosis-statement.md (CLI) | Documentation lag root cause | Commands work but SKILL.md has zero playbook mentions |
| diagnosis/apl.json (CLI) | SKILL.md gap confirmed | Frontmatter, commands table, workflow all omit playbook |
| scout/scout-summary.md (CLI) | Command surface and SKILL.md analysis | 2 subcommands (check, checks); 9-entry commands table; goals/ CRUD pattern for future |
| scout/reference-map.json (CLI) | File inventory | SKILL.md, src/playbook/index.ts, check.ts, checks.ts |
| skill-content/SKILL.md (direct read) | Verified documentation gap | Zero matches for 'playbook'; 9 command groups listed |
| src/playbook/index.ts (direct read) | Verified command surface | Dispatches check and checks subcommands |
| repo-guidance.json | Repo intent | CLI is secondary target — SKILL.md documentation update |
