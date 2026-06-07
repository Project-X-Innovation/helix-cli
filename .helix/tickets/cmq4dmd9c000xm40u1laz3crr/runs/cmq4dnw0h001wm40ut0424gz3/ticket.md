# Ticket Context

- ticket_id: cmq4dmd9c000xm40u1laz3crr
- short_id: RSH-749
- run_id: cmq4dnw0h001wm40ut0424gz3
- run_branch: helix/research/RSH-749-mcp-tool-converse-with-the-helix-comment-agent
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
MCP tool: converse with the Helix comment agent (synchronous, tracked as comments)

## Description
## Goal
Add an MCP tool that lets a user send a message/request directly to the Helix comment agent about a specific ticket (its run, report, artifacts, errors, etc.) and receive Helix's reply back in the same call. Support deeper, multi-turn discussions with Helix.

## Design decisions already made
- **Synchronous**: the tool should block and wait for Helix's reply, then return it. Account for agent latency, request timeouts, long responses, streaming vs. single reply, and a graceful fallback if no reply arrives in the window (return a handle + the posted comment to poll later).
- **Tracked as comments**: messages and replies persist as ticket comments, visible in the UI. Inbound message attributed to the acting user and marked as MCP-originated; reply attributed to the comment agent.

## Key problem / context
Today the comment-posting path (post-comment tool) does NOT trigger a Helix reply because reply-triggering is currently client-side. An MCP-posted comment alone gets no response. Map the current comment-agent trigger flow and determine what's required to invoke the agent server-side (or via a dedicated endpoint) so an MCP-originated message reliably gets a reply.

## Research questions
1. How is the comment agent currently triggered (client-side)? What invokes it, with what context? Map end-to-end across client/server.
2. What's needed to trigger from a server-side / MCP path? New endpoint vs. server-side hook on comment creation.
3. Conversation/context model for multi-turn: how prior comments, the run report, and artifacts are fed in; how follow-ups keep context.
4. Synchronous mechanics: timeouts, streaming vs. single reply, long-response handling, async fallback.
5. Persistence & attribution as comments (acting user, MCP origin marker, agent attribution, notifications).
6. Scope of what the agent should answer about a run.

## Deliverable
Implementation plan with recommended approach and components affected across helix-global-client, helix-global-server, helix-cli.

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-07T22:52:45.200Z) [Agent]: On it — diving into the research now. I'll have my take shortly.
- **Helix** (2026-06-07T23:23:27.030Z) [Agent]: Got it — I'm researching this now. I'll get back with what I find in a few minutes.
