# Product Specification — Add Playbook Support to the MCP (helix-cli)

## Problem Statement

The CLI has working playbook commands (`hlx playbook check`, `hlx playbook checks`) integrated into the main router, but SKILL.md — the primary interface for MCP/AI agent discovery — has zero mentions of playbook. The frontmatter triggers, commands table (9 entries), and workflow section all omit it. This makes existing playbook CLI functionality invisible to AI agents that rely on SKILL.md for command discovery.

## Product Vision

Make CLI playbook commands discoverable to AI agents and MCP clients by documenting them in SKILL.md alongside all other CLI commands.

## Users

| User | Need |
|------|------|
| **AI agents using helix-cli skill** | Discover that `hlx playbook check` and `hlx playbook checks` exist and know how to invoke them |
| **MCP clients** | Find playbook CLI commands through standard skill documentation discovery |

## Use Cases

1. **Command discovery** — An AI agent reads SKILL.md and learns that playbook check commands are available, including their syntax and behavior.
2. **Compliance check workflow** — An AI agent triggers a compliance check via `hlx playbook check <ruleId>` and understands the async polling/timeout behavior.

## Core Workflow

1. **Discover** — AI agent reads SKILL.md and finds playbook in the commands table and frontmatter triggers.
2. **Trigger check** — Agent invokes `hlx playbook check <ruleId>` to trigger a compliance check; command polls automatically (5s interval, 10-min timeout).
3. **View history** — Agent invokes `hlx playbook checks <ruleId>` to list check history for a rule.

## Essential Features (MVP)

1. **SKILL.md frontmatter update** — Add playbook-related triggers to the frontmatter description
2. **Commands table update** — Add playbook row to the commands-at-a-glance table with check and checks subcommands

## Features Explicitly Out of Scope (MVP)

- **New CLI commands** — Rule CRUD commands (create, list, get, update, delete) are a separate enhancement
- **CLI code changes** — Existing playbook commands work correctly; only documentation needs updating
- **MCP tool implementation** — MCP tools are server-side in helix-global-server, not CLI

## Success Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | SKILL.md frontmatter includes playbook triggers | Text search confirms presence |
| 2 | Commands table includes playbook row | Table has playbook entry with check/checks subcommands |
| 3 | Build passes | `npm run build` succeeds |

## User Scenarios

[SCN-01] Discover CLI playbook commands via SKILL.md
- Precondition: AI agent has access to the helix-cli skill documentation (SKILL.md)
- Action: AI agent reads SKILL.md to discover available commands
- Expected Outcome: Playbook appears in the commands table with check and checks subcommands listed

[SCN-02] Trigger compliance check via CLI
- Precondition: AI agent knows about `hlx playbook check` from SKILL.md; a playbook rule exists
- Action: AI agent invokes `hlx playbook check <ruleId>`
- Expected Outcome: Command triggers a check, polls for completion (5s intervals, 10-min timeout), and outputs the result (PASS/FAIL/ERROR)

[SCN-03] List check history via CLI
- Precondition: AI agent knows about `hlx playbook checks` from SKILL.md; a playbook rule has checks
- Action: AI agent invokes `hlx playbook checks <ruleId>`
- Expected Outcome: Command outputs the check history for the specified rule

## Key Design Principles

- **Documentation-only change** — The commands already work; this is purely a discovery gap
- **Pattern consistency** — SKILL.md update follows the same format as existing command entries

## Scope & Constraints

- **Change scope**: SKILL.md only — frontmatter triggers + commands table
- **No code changes** — Existing playbook commands are functionally correct
- **Build gate**: `npm run build` must pass

## Future Considerations

- **Rule CRUD CLI commands** — Add `hlx playbook create`, `hlx playbook list`, `hlx playbook get`, etc. for direct CLI rule management
- **Workflow section update** — If playbook becomes part of standard agent workflows, add it to the workflow section of SKILL.md

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|-----------------|--------|
| 1 | Should SKILL.md also describe the async polling behavior (5s interval, 10-min timeout)? | Helps agents understand timeout expectations |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| helix-cli ticket.md | Ticket scope — research question 4: CLI involvement | CLI needs SKILL.md update at minimum |
| helix-cli scout/scout-summary.md | CLI command surface and SKILL.md gap details | 2 commands exist (check, checks); SKILL.md omits playbook entirely |
| helix-cli diagnosis/diagnosis-statement.md | Root cause: documentation lag | Commands work but are invisible to AI agent discovery |
| helix-cli diagnosis/apl.json | CLI-specific Q&A | Rule CRUD commands are separate; SKILL.md is the minimum fix |
| helix-global-server diagnosis/diagnosis-statement.md | Cross-repo context | Confirms CLI is secondary target; server is primary |
