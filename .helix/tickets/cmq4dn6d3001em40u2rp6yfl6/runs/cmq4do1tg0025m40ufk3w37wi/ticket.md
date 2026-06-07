# Ticket Context

- ticket_id: cmq4dn6d3001em40u2rp6yfl6
- short_id: RSH-752
- run_id: cmq4do1tg0025m40ufk3w37wi
- run_branch: helix/research/RSH-752-limit-mcp-actions-to-user-permissible-operations
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Limit MCP actions to user-permissible operations (RBAC parity + blocked state mutations)

## Description
## Goal
Constrain what MCP can do so that, in general, it can only perform actions a user could normally take through the UI — and additionally hard-block certain sensitive state mutations regardless of role. Research BOTH models together and recommend how they combine.

## Two models to research (combine them)
1. **RBAC parity** — MCP respects the acting user's role/permissions, so MCP can never do more than that user could do in the UI. Map current roles/permissions to MCP tool availability and behavior.
2. **Hard-blocked state mutations** — a fixed deny-list of sensitive actions that MCP should never perform directly even when the user's role would technically allow it. Directly changing ticket status is the explicit example; also evaluate deletes and other direct state changes.

## Approval gating — scope it narrowly (important)
Approval prompts must NOT fire on routine/low-risk MCP actions. Concretely, creating or drafting a ticket should require no approval. Approval should be reserved for the genuinely sensitive transition: **when a PREVIEW_READY ticket is being merged into sandbox**. Define exactly which transitions require human approval, with preview-ready → sandbox merge as the canonical case, and ensure everything else flows without an approval prompt.
- Observed problem to fix: MCP create-ticket currently returns "No approval received" and blocks creation. That gate is far too broad and is a concrete example of what this work should correct.

## Research questions
1. Inventory every current MCP tool that performs a mutation (status changes via update-ticket, archive, delete, sprint assignment, deployments, merges, etc.) and classify each as: UI-equivalent/allowed, role-gated, or hard-blocked.
2. Where is enforcement applied (server-side authorization layer), and how does it interact with the feature-flag scoping work (flags = exposure; this = behavior when exposed)?
3. Define the approval-required transition set, narrowly scoped to preview-ready → sandbox merge (and any similarly sensitive transitions surfaced by the inventory).
4. Recommend a single combined permission + approval model.

## Deliverable
A recommended authorization/approval model for MCP actions — combining RBAC parity and a hard-block list, with a narrowly scoped approval gate — across helix-global-client, helix-global-server, helix-cli.

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-07T22:52:52.704Z) [Agent]: Got it — I'm researching this now. I'll get back with what I find in a few minutes.
