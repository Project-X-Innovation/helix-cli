# Diagnosis Statement — helix-cli

## Problem Summary

The CLI interacts with Helix via REST API endpoints exclusively and has no MCP tool invocation or feature flag code. The ticket lists helix-cli as a target for the design deliverable, suggesting CLI admin commands for MCP tool flag management may be needed.

## Root Cause Analysis

The CLI has no current gap related to MCP tool gating — it does not invoke MCP tools. However, the ticket scope includes helix-cli in the design deliverable:

1. **No MCP interaction**: The CLI uses `hxFetch()` for REST API calls only. MCP is a separate interface for external AI clients.

2. **No admin commands exist**: The CLI has no admin command category. Adding `hlx admin mcp-tools` would require a new command group.

3. **Lower priority**: Since the admin UI in helix-global-client provides the primary management surface, CLI admin commands are a convenience extension that can be deferred.

### Recommended Design

The CLI changes are optional and lower-priority:
- New `hlx admin mcp-tools list` command to view tool flag state for the current org
- New `hlx admin mcp-tools set <tool-name> --enabled/--disabled` command
- Both would call the same REST admin API endpoints as the client UI
- Can be deferred to a follow-up ticket if time is constrained

## Evidence Summary

| Evidence | Finding |
|----------|---------|
| `src/index.ts` | No MCP or admin commands registered |
| `src/lib/http.ts` | REST-only API client, no MCP protocol |
| ticket.md | helix-cli listed in deliverable scope |

## Success Criteria

1. Design recommendation addresses CLI scope (even if recommending deferral).
2. If implemented: CLI admin commands for listing and toggling MCP tool flags work correctly.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket requirements | helix-cli listed as target for design deliverable |
| scout/reference-map.json (helix-cli) | Scout findings on CLI architecture | No MCP commands, REST-only |
| scout/scout-summary.md (helix-cli) | Scout analysis | CLI uses REST API exclusively, no feature flag code |
