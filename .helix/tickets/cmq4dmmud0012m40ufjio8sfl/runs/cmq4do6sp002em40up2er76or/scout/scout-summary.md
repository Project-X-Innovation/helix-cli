# Scout Summary — helix-cli

## Problem

The CLI interacts with Helix via REST API endpoints, not MCP tools directly. It currently has no MCP tool or feature flag code. The ticket lists helix-cli as a target repo, suggesting it may need admin commands for MCP tool flag management.

## Analysis Summary

### Current CLI Architecture

The CLI is a TypeScript ESM project with no external dependencies. Commands:
- **Tickets**: create, list, get, continue, rerun, artifacts, update-description, bundle
- **Comments**: list, post
- **Goals**: create, list, get, terminate, resume
- **Inspect**: repos, db, logs, api (read-only production inspection)
- **Library**: list, show, comments
- **Playbook**: check, checks
- **Skill**: show, install
- **Auth**: login, token, org

Authentication uses `hxFetch()` with Bearer tokens or `hxi_` API keys. Config from `~/.hlx/config.json` or env vars.

### MCP Tool Relationship

The CLI does **not** invoke MCP tools or interact with the MCP server endpoint. All CLI commands call REST API endpoints via `hxFetch()`. MCP is a separate interface channel (for external AI clients).

The CLI may need:
- Admin commands to manage MCP tool flags (e.g., `hlx admin tools enable/disable`)
- Or no changes at all, if MCP tool flag management is admin-UI-only

### Build & Quality Gates

- `npm run build` — TypeScript compilation
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — `tsc && node --test dist/**/*.test.js`
- No external dependencies; pure TypeScript ESM

## Relevant Files

| File | Role |
|------|------|
| `src/index.ts` | CLI entry point with command registration |
| `src/lib/http.ts` | HTTP client for API calls |
| `src/lib/config.ts` | CLI configuration and auth |
| `package.json` | Build/test scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket requirements | helix-cli listed as target repo for feature-flag design deliverable |
| src/index.ts | Agent exploration | No MCP commands registered |
| src/lib/http.ts | Agent exploration | REST-only API client, no MCP protocol interaction |
| src/lib/config.ts | Agent exploration | Bearer token / API key auth, no MCP OAuth |
| package.json | Agent exploration | Pure TypeScript build, no external dependencies |
