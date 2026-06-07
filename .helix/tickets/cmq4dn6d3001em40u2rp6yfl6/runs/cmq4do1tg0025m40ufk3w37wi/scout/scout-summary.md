# Scout Summary — helix-cli

## Problem

The CLI is a thin REST client with no client-side authorization enforcement. All role/permission checks are server-delegated. Approval status is displayed but not gated on. The CLI is also packaged as a skill for AI agents, which may need documentation updates if MCP tool availability becomes role-dependent.

## Analysis Summary

### CLI as Thin Client

The CLI exposes a subset of server operations via direct REST API calls:
- **Ticket ops:** create, list, get, rerun, continue, update-description, artifacts
- **Goal ops:** create (with requireApproval flag), list, get, terminate, resume
- **Inspection:** repos, db, logs, api (read-only)
- **Comments:** list, post
- **Library/Playbook:** list, show, check

All mutations are forwarded to the server via `hxFetch()`. Server 403/422 errors are surfaced directly to the user.

### Auth Model

- API keys (`hxi_` prefix) → `X-API-Key` header
- Session/OAuth tokens → `Bearer` Authorization header
- Org context → `X-Helix-Org-ID` header
- Config stored in `~/.hlx/config.json` with multi-org support

### Approval Display

The CLI shows approval status in two places:
1. `hlx tickets list` — shows `[APPROVAL_STATUS]` tag
2. `hlx tickets get` — shows `Approval: <status>` line

Goal detail shows `Approval Mode: enabled/disabled` based on `requireApproval` flag.

### AI Agent Skill

The CLI is bundled as a skill for AI agents via `SKILL.md` and reference documents. If MCP tool availability becomes role-dependent, the skill documentation would need to reflect available/restricted operations.

## Relevant Files

| File | Role |
|------|------|
| `src/tickets/create.ts` | Ticket creation (POST /api/tickets) |
| `src/tickets/get.ts` | Ticket detail with approval status display |
| `src/tickets/list.ts` | Ticket listing with approval status tags |
| `src/tickets/rerun.ts` | Ticket rerun |
| `src/goals/create.ts` | Goal creation with requireApproval flag |
| `src/goals/get.ts` | Goal detail with approval mode display |
| `src/lib/http.ts` | HTTP layer with auth headers |
| `src/lib/config.ts` | Config management |
| `skill-content/SKILL.md` | AI agent skill definition |
| `package.json` | Build/quality gate scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope research across CLI | CLI is a thin client — enforcement is server-side |
| src/tickets/create.ts | Map ticket creation flow | No client-side approval gate, delegates to server |
| src/tickets/get.ts | Map approval status display | approvalStatus shown when present |
| src/goals/create.ts | Map goal approval integration | requireApproval flag on goal creation |
| src/lib/http.ts | Map auth header flow | API key vs Bearer token, org context header |
| skill-content/SKILL.md | Map AI agent integration surface | Skill may need updates if role-based restrictions added |
