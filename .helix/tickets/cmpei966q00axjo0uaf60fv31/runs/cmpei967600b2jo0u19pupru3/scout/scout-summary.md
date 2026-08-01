# Scout Summary: RSH-531 -- NetSuite Verification (helix-cli)

## Problem

RSH-531 asks for a comprehensive plan for NetSuite verification. The helix-cli provides the CLI infrastructure for runtime inspection commands and agent skill management that underpin NS verification capabilities.

## Analysis Summary

### Runtime Inspection Commands

The helix-cli provides three inspection command types relevant to NS verification:
- `hlx inspect db --repo <name> "<sql>"` -- Read-only database queries
- `hlx inspect logs --repo <name> "<query>"` -- Log searching
- `hlx inspect api --repo <name> <path>` -- API endpoint inspection

These inspection commands are used by the runtime-inspection skill during workflow steps and are the mechanism by which the verification step can access production/sandbox data.

### Agent Skill Bundling

The CLI bundles a SKILL.md that provides canonical agent guidance. The `hlx skill show` and `hlx skill install` commands manage skill distribution to agent directories (Claude Code or Codex).

### Prior Verification Architecture Design

The repo contains a comprehensive verification architecture design document (ticket cmpd9loth00cnfw0uu5pja25s) that defines NS-specific verification methods in Section 4.5:
- SuiteQL queries for record/field/relationship verification
- Script deployment verification via deployment XML inspection
- Log checks for execution verification
- API calls to RESTlet/SuiteTalk endpoints
- Workflow verification via state transition checks

This design document also identifies tooling/browser failures as 28.9% of all verification failures, with agent-browser CLI, curl, and simplified browser flows as resolution strategies.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/index.ts` | CLI entry point: inspect db/logs/api commands, skill show/install |
| `src/inspect/` | Runtime inspection implementations |
| `src/skill/` | Agent skill bundling and distribution |
| `src/docs/cli-content.ts` | CLI documentation with authentication and troubleshooting |
| `.helix/tickets/cmpd9loth00cnfw0uu5pja25s/.../ticket.md` | Verification architecture design: NS-specific methods, 4-outcome model, strategy catalog |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand ticket scope | Research ticket for NS verification plan |
| src/index.ts | Map CLI inspection capabilities | 3 inspection types available: db, logs, api -- all used for NS runtime verification |
| .helix/tickets/cmpd9loth00cnfw0uu5pja25s ticket.md | Prior verification architecture design | 5 NS verification methods defined: SuiteQL, script deployment XML, logs, API calls, workflow state; 28.9% failures are tooling/browser issues |
