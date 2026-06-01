# Diagnosis Statement: ns-gm Server-Side Migration (helix-cli)

## Problem Summary

After ns-gm moves server-side, sandbox agents need a CLI command to access NetSuite data through the server-side inspection proxy. Currently, helix-cli has no ns-gm or NetSuite-related code — all inspect subcommands (repos, db, logs, api) target existing inspection proxy types. A new `netsuite` subcommand must be added to route NetSuite queries through the server.

## Root Cause Analysis

This is new functionality, not a bug. The helix-cli currently has zero ns-gm or NetSuite references (confirmed by grep). The existing inspect module provides a clean, consistent pattern for adding new subcommands. The work is a direct extension of the existing architecture.

## Evidence Summary

### CLI architecture is trivially extensible
`src/inspect/index.ts` dispatches to subcommand handlers via switch/case. Each handler is ~12 lines following the same pattern: parse flags → resolveRepo → hxFetch POST → display JSON. `db.ts` serves as the template.

### Transport and auth infrastructure is reusable
`src/lib/http.ts` handles auth (hxi_ API keys via X-API-Key header or Bearer tokens via Authorization header), retry logic (3 attempts, exponential backoff on 429/5xx), and 30s timeout. No transport changes needed.

### Zero existing NetSuite code
No ns-gm, nsgm, or NetSuite references exist in helix-cli src/ (confirmed by grep). This is entirely new functionality with no migration concerns.

## Success Criteria

1. `hlx inspect netsuite --repo <name> --query "<SuiteQL>"` subcommand works from inside sandboxes
2. Follows the established pattern of db/logs/api subcommands
3. Documentation in skill-content/references/commands.md is updated
4. Help text for `hlx inspect` includes the netsuite subcommand

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (helix-cli) | Map CLI architecture | 4 existing subcommands, consistent pattern, zero NetSuite code |
| scout/scout-summary.md (helix-cli) | Architecture overview | Each subcommand is ~12 lines following parse → resolve → fetch → display |
| src/inspect/index.ts (direct read) | Verify dispatcher | switch/case routing, clean extension point |
| src/inspect/db.ts (direct read) | Verify handler pattern | 12-line template: resolveRepo + hxFetch POST to server endpoint |
| ticket.md (Research Report RSH-633) | Primary specification | Agents in sandboxes use hlx inspect instead of ns-gm CLI directly |
