# Ticket Context

- ticket_id: cmq4dmmud0012m40ufjio8sfl
- short_id: RSH-750
- run_id: cmq4do6sp002em40up2er76or
- run_branch: helix/research/RSH-750-scope-mcp-tools-via-feature-flags
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Scope MCP tools via feature flags

## Description
## Goal
Add the ability to enable/disable specific MCP tools via feature flags, so the full MCP tool set (~39 tools today) isn't uniformly exposed to every org/user. Some tools should be gated off.

## Research questions
1. **Granularity**: should flags operate per-tool, per-org, per-user, and/or per-role? Recommend a model (and whether multiple levels compose, e.g. org default overridden per-user).
2. **Evaluation point**: are disabled tools hidden at tool-discovery/list time, blocked at invocation time, or both? Trade-offs for each (a hidden tool never tempts the client; a blocked tool gives a clear error).
3. **Management surface**: admin UI in helix-global-client for toggling flags, plus enforcement in helix-global-server. What does the admin experience look like?
4. **Existing infra**: is there an existing feature-flag system to reuse rather than building new?
5. **Defaults & safety**: sensible default on/off state per tool; how new tools are introduced (default-off?).

## Relationship to related ticket
This is about availability (a tool is on or off). It is distinct from the separate "Limit MCP actions" ticket, which constrains what an *enabled* tool is allowed to do (permission parity + blocked mutations). Design the two to compose cleanly: flags decide exposure, the permission model decides behavior when exposed.

## Deliverable
A recommended feature-flag design for scoping MCP tool exposure, with the management UI and server enforcement approach, across helix-global-client, helix-global-server, helix-cli.

## Attachments
- (none)
