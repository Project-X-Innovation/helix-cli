# Diagnosis Statement — helix-cli

## Problem Summary

The CLI has working playbook commands (`hlx playbook check`, `hlx playbook checks`) integrated into the main router, but `skill-content/SKILL.md` — the primary interface for MCP/AI agent discovery — has zero mentions of playbook. The frontmatter triggers, commands table (9 entries), and workflow section all omit it.

## Root Cause Analysis

Documentation lag: CLI playbook commands were added to the router (`src/index.ts` lines 133-137) and implemented (`src/playbook/check.ts`, `src/playbook/checks.ts`) but SKILL.md was never updated to include them. This is a documentation-only gap — the commands work correctly when invoked directly.

## Evidence Summary

| Evidence | Location | Finding |
|----------|----------|---------|
| Command router | `src/playbook/index.ts` (62 lines) | Dispatches check and checks subcommands |
| Check command | `src/playbook/check.ts` (113 lines) | Trigger + poll: 5s interval, 120 max polls, PASS/FAIL/ERROR terminals |
| Checks command | `src/playbook/checks.ts` | List check history for a rule |
| Main router | `src/index.ts` lines 133-137 | Playbook integrated via `case 'playbook'` |
| SKILL.md gap | `skill-content/SKILL.md` | Zero matches for 'playbook' in frontmatter, commands table, or workflow |

## Success Criteria

1. **SKILL.md updated**: Frontmatter `description` triggers include `hlx playbook check`, `hlx playbook checks`
2. **Commands table updated**: Playbook row added to commands-at-a-glance table
3. **Build passes**: `npm run build` succeeds

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket scope — research question 4: CLI involvement | CLI needs SKILL.md update at minimum |
| helix-cli scout/reference-map.json | CLI gap identification | 2 check commands exist but SKILL.md omits playbook |
| helix-cli scout/scout-summary.md | Confirmed documentation gap | Frontmatter, commands table, workflow all missing playbook |
| src/playbook/index.ts | Verified command surface | 2 subcommands: check, checks — no rule CRUD |
| src/playbook/check.ts | Verified async polling implementation | 5s interval, 10-min timeout, PASS/FAIL/ERROR terminals |
| skill-content/SKILL.md | Verified documentation gap | Zero mentions of playbook |
