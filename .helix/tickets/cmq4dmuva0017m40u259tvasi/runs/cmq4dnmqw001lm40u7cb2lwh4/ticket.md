# Ticket Context

- ticket_id: cmq4dmuva0017m40u259tvasi
- short_id: RSH-751
- run_id: cmq4dnmqw001lm40u7cb2lwh4
- run_branch: helix/research/RSH-751-add-playbook-support-to-the-mcp
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Add Playbook support to the MCP

## Description
## Goal
Expose Playbook functionality through the MCP so Playbook flows can be driven from an MCP client, not just the UI.

## Context
Playbook work is actively in flight — see RSH-727 (Playbook Basic Flow), RSH-652/RSH-653 (Playbook Staged work), RSH-529 (Playbook/Business Bible), and FIX-746 (Playbook Basic Flow | Async Check). This ticket should build on that work rather than duplicate it, and call out dependencies on those tickets.

## Research questions
1. **Surface area**: which Playbook operations should be MCP-accessible — creating/defining playbooks, running them, staged work, async checks, viewing results/status?
2. **Async/staged model**: how does Playbook's async + staged execution map onto MCP tool calls? Synchronous wait vs. kick-off-and-poll, and how staged steps are represented to an MCP caller.
3. **New tools vs. reuse**: which new MCP tools are needed, and which existing Playbook server endpoints can be reused.
4. **cli involvement**: what, if anything, helix-cli needs to support Playbook-over-MCP.
5. **Dependencies**: ordering against the in-flight Playbook tickets above.

## Deliverable
A plan to add Playbook support to the MCP, with the recommended tool set and how it maps to the existing/in-progress Playbook implementation, across helix-global-client, helix-global-server, helix-cli.

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-07T22:52:33.272Z) [Agent]: Interesting question — let me dig into this right away. I'll share my thoughts shortly.
- **Helix** (2026-06-07T23:23:27.029Z) [Agent]: Interesting question — let me dig into this right away. I'll share my thoughts shortly.
