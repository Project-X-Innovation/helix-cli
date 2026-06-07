# Ticket Context

- ticket_id: cmq0dtiwl00v6k70u6wzjct6d
- short_id: BLD-684
- run_id: cmq0dtiwx00vbk70ur3q1rgvn
- run_branch: helix/build/BLD-684-host-agent-4-7-control-plane-wake-cli-pull-remove
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [4/7] - Control-plane wake + CLI pull (remove public ingress)

## Description
# Host Agent ④ — Control-plane wake + CLI pull (remove public ingress)

## Context
Today inbound delivery POSTs to a **publicly-exposed** sprite URL (`makeHostAgentPublic`). Proven on
real infra: a stopped/cold runner returns 502 — push can't self-heal — and the public endpoint is the
only inbound attack surface in either sandbox system. Flip the model: wake via the control plane and
have the runner **pull**. Depends on ① (provisioning), ② (resume).

## Changes
**helix-global-server**
- On a comment for a not-`RUNNING` session, trigger a **control-plane wake** via the sprites
  `services/runner/restart` REST endpoint (no public port); post an async "warming up" ack.
- Introduce a `WAKING` state and a **last-processed-comment marker** for idempotency.
- **Delete** `makeHostAgentPublic` and the public `/comment` push path.
- On wake, **re-assert the sprite network policy** (`setSpriteNetworkPolicy`) so a woken cold sprite
  is never egress-open (B7 — verify whether policy persists across cold).

**helix-cli**
- Ensure the runner can pull unprocessed comments since the marker (`hlx comments list --since` or
  equivalent), complete and ordered.

**helix-global-client**: attached for end-to-end testing per convention.

## Acceptance criteria
- **+** A comment to a cold sprite wakes it, the runner relaunches, resumes, **pulls the comment
  posted while it was down**, and replies.
- **−** Duplicate delivery / re-wake does not double-reply; a comment arriving during wake is buffered.
- **−** No public sprite endpoint exists anymore.

## References
RSH-646, RSH-647 (unified abstraction), RSH-640, BLD-673. See `host-agent-research-report.md`.

## Attachments
- (none)

## Discussion
- **Usher** (2026-06-05T04:01:56.391Z): Additional hard requirement for this ticket (T4): FAIL LOUD — never silently fall back to the generic reply. When the host agent is enabled but cannot serve (session not ACTIVE, wake/resume fails, SERVER_URL unreachable, provisioning ERROR), surface a VISIBLE error (post an error comment + set an ERROR/failed state). REMOVE the generateHelixReply fallback from the comment-routing else branch AND from the host-agent error handlers in comment-controller.ts. The host agent must never answer silently as the generic/'previous' agent — the user would rather see an error than a degraded silent reply. Negative acceptance check: with the host agent enabled, a serve failure yields a visible error and generateHelixReply is NEVER invoked as a fallback.
