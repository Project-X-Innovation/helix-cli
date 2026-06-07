# Scout Summary — helix-cli

## Problem

The CLI has working playbook commands (`hlx playbook check`, `hlx playbook checks`) integrated into the main router since at least v1.3.4, but the SKILL.md skill documentation — the primary interface for MCP/AI agent discovery — does not mention playbook at all. The frontmatter triggers list, commands table, and workflow section all omit playbook. Additionally, the CLI only has check-related commands (trigger and list checks), with no rule CRUD commands (create, list, get, update, delete).

## Analysis Summary

### Current Playbook CLI Commands

Two subcommands exist under `hlx playbook`:

1. **`hlx playbook check <ruleId> [--json]`** (`src/playbook/check.ts`, 113 lines)
   - Triggers a compliance check via `POST /api/playbook/rules/{ruleId}/check`
   - Polls `GET /api/playbook/rules/{ruleId}/checks/{checkId}` every 5 seconds
   - Times out after 120 polls (10 minutes)
   - Terminal statuses: PASS, FAIL, ERROR
   - Outputs human-readable or JSON results
   - Exit code: 0 for PASS, 1 for FAIL/ERROR/timeout

2. **`hlx playbook checks <ruleId> [--json]`** (`src/playbook/checks.ts`)
   - Lists check history via `GET /api/playbook/rules/{ruleId}/checks`

### SKILL.md Gap

The `skill-content/SKILL.md` frontmatter `description` field lists all supported triggers — playbook is absent. The commands table lists 9 command groups (login, token, org, tickets, inspect, comments, library, skill, update) but not playbook. A grep for "playbook" in SKILL.md returns zero matches.

### CLI Command Architecture

Commands follow a consistent pattern:
- `src/<domain>/index.ts` — router with usage text and subcommand dispatch
- `src/<domain>/<subcommand>.ts` — individual command implementation
- `hxFetch(config, path, options)` — HTTP client with retry, auth, basePath
- `--json` flag for structured output
- `hasFlag(args, flag)` for argument parsing

The `goals/` directory shows the full CRUD pattern (create, list, get, terminate, resume) that playbook could follow if rule management is needed.

### Quality Gates

- `npm run build` — TypeScript compilation to dist/
- No lint or test scripts visible in this repo

## Relevant Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/playbook/index.ts` | Command router: check, checks | 62 |
| `src/playbook/check.ts` | Trigger + poll compliance check | 113 |
| `src/playbook/checks.ts` | List check history | ~30 |
| `skill-content/SKILL.md` | AI agent skill docs — missing playbook | 100+ |
| `src/index.ts` | Main router — playbook integrated (lines 133-137) | 170 |
| `src/lib/http.ts` | hxFetch client with retry/auth | 134 |
| `src/goals/index.ts` | Pattern reference for full CRUD commands | ~60 |
| `package.json` | Package config, scripts | 50+ |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket scope — research question 4: CLI involvement | CLI needs SKILL.md update at minimum; may need new commands |
| src/playbook/index.ts | Map current playbook command surface | 2 subcommands: check, checks — no rule CRUD |
| src/playbook/check.ts | Understand async polling implementation | 5s interval, 10-min timeout, PASS/FAIL/ERROR terminals |
| skill-content/SKILL.md | Confirm documentation gap | Zero mentions of playbook — frontmatter, commands table, workflow all omit it |
| src/index.ts | Confirm playbook is routed | Line 17 imports, lines 133-137 route — integrated but undocumented |
| src/goals/index.ts | Pattern reference for CRUD commands | Shows create/list/get/terminate/resume pattern that playbook could adopt |
