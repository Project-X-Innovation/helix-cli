# Ticket Context

- ticket_id: cmq0dtv1a00vkk70uax2shzp5
- short_id: BLD-686
- run_id: cmq0dtv1q00vpk70u95n9rvs9
- run_branch: helix/build/BLD-686-host-agent-6-7-context-compaction-for-long-lived
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [6/7] - Context compaction for long-lived sessions

## Description
# Host Agent ⑥ — Context compaction for long-lived sessions

## Context
An always-available agent accumulates conversation indefinitely; each resume reloads the full
transcript, so per-turn token cost climbs and eventually hits the context ceiling. Compaction is a
hard requirement for the always-on model, not a nice-to-have. Depends on ② (resume).

## Changes
**helix-global-server**
- Enable the Agent SDK's compaction / periodic summarization for the runner session.
- Define ceiling behavior: summarize-and-restart the session (preserving a durable summary) when the
  context approaches the limit.
- Emit per-turn token usage so growth is measurable.

**helix-global-client / helix-cli**: attached for end-to-end testing per convention.

## Acceptance criteria
- **+** Over many resumed turns, context stays under the ceiling and per-turn token growth is bounded
  (measured, with a documented cap/summarize-restart behavior).
- **+** A summarize-restart preserves enough context that the agent stays coherent on the ticket.

## References
RSH-640. Builds on ② (resume). See `host-agent-research-report.md`.

## Attachments
- (none)
