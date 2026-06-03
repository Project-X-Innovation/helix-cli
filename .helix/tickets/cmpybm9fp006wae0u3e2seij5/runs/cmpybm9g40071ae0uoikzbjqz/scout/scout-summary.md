# Scout Summary — helix-cli

## Problem

The ticket proposes a host-agent-proxy MCP pattern where chat interfaces send messages to a host agent that uses the helix-cli to fulfill requests. The CLI's command surface and capabilities define the ceiling of what this new MCP architecture could offer. Understanding the CLI's current coverage, gaps relative to the existing MCP tools, and the safety boundaries (deny lists) is essential context.

## Analysis Summary

The helix-cli (`hlx`) is a TypeScript CLI tool published as `@projectxinnovation/helix-cli` on npm. It provides the command surface that the host agent already uses on sprite VMs.

**Current CLI command surface:**
- `tickets` — 11 subcommands (list, create, get, rerun, continue, artifacts, artifact, bundle, update-description, latest)
- `goals` — 6 subcommands (create, list, get, terminate, resume)
- `inspect` — 4 subcommands (repos, db, logs, api) — read-only production access
- `comments` — list, post
- `library` — list, show, comments
- `skill` — show, install
- `org` — current, list, switch
- `login`, `token`, `update`

**Host agent safety controls:**
- CLI deny list: `tickets create`, `comments post`, `tickets continue`, `tickets rerun`, `tickets archive`
- Binary allowlist for exec: node, npm, npx, cat, grep, find, ls, wc, head, tail, sort, uniq, jq, git

**Coverage gap analysis** (CLI vs. current MCP tools):
The current MCP exposes 13 tool modules. The CLI covers: tickets, comments, inspection, library. The CLI does NOT currently expose: sprint management, staging-queue operations, deployment management, settings management, profile management, analytics, organization management, transcripts, or attachment handling. These would need CLI equivalents or alternative routing in a host-agent-proxy model.

**Skill system**: The CLI installs as an agent skill (`~/.claude/skills/hlx-cli/`) with comprehensive documentation (SKILL.md + references). This is the existing agent integration pattern for coding agents.

## Relevant Files

| File | Role |
|------|------|
| `src/index.ts` | CLI entry point, command router |
| `skill-content/SKILL.md` | Agent-consumable skill documentation |
| `src/skill/install.ts` | Skill installation for Claude Code / Codex |
| `src/tickets/*.ts` | Ticket command implementations |
| `src/goals/*.ts` | Goal command implementations |
| `src/inspect/*.ts` | Production inspection commands |
| `src/comments/*.ts` | Comment commands |
| `src/library/*.ts` | Library access commands |
| `src/lib/config.ts` | Auth and multi-org configuration |
| `src/lib/http.ts` | HTTP client with retry logic |
| `package.json` | Build, test, publish configuration |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary ticket specification | CLI is the proposed execution backbone for the new MCP host-agent pattern |
| src/index.ts | CLI entry point inspection | Maps all available command groups and dispatch logic |
| skill-content/SKILL.md | Skill documentation | Defines CLI capabilities as seen by AI agents — the same surface the host agent uses |
| src/services/host-agent-service.ts (server repo) | Host agent CLI integration | CLI installed on sprites, authenticated via inspection API key, with 5-item deny list |
| src/mcp/register-tools.ts (server repo) | MCP tool registration | 13 tool modules — compared against CLI coverage to identify gaps |
| package.json | Package configuration | Published on npm, exports skill content, build/test scripts |
