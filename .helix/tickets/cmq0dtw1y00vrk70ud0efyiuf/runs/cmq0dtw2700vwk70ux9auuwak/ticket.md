# Ticket Context

- ticket_id: cmq0dtw1y00vrk70ud0efyiuf
- short_id: FIX-687
- run_id: cmq0dtw2700vwk70ux9auuwak
- run_branch: helix/fix/FIX-687-host-agent-7-7-end-to-end-spine-test-acceptance
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [7/7] - End-to-end spine test, acceptance suite & observability

## Description
# Host Agent ⑦ — End-to-end spine test, acceptance suite & observability

## Context
The original failure (EXEC-1) was invisible because tests mocked the sprite client and there was no
real end-to-end test. This ticket makes the **acceptance suite an automated integration test against
a real sprite**, so every assumption is verified at build time and kept as a regression guard.
Depends on ①–⑥.

## Changes
**helix-global-server**
- Implement the **spine test**: provision → reach `ACTIVE` → answer a comment → force cold (stop
  service) → wake via control plane → resume → pull the comment posted while down → reply — asserting
  contextual continuity **and** no duplicate processing.
- Implement the Class-B + **B7 egress-compat** checks as automated assertions (positive + negative):
  PAT-never-in-logs, `hxi_` auth scope (denied subcommands blocked, cross-org 403), `SERVER_URL`
  set/unset behavior, idempotent pull, reap revoke/scrub, and egress-on provisioning + allowlist.
- Add observability: provisioning/wake/resume timings, token usage, comment-dispatch outcomes.

**helix-global-client / helix-cli**: attached for end-to-end testing per convention.

## Acceptance criteria
- The spine test passes end-to-end against a real sprite and runs in CI as a regression guard.
- All Class-B and B7 checks (see `host-agent-DoD-and-test-plan.md`) pass; gates G1–G6 tracked.

## References
RSH-640, RSH-648, BLD-673. See `host-agent-research-report.md`, `host-agent-DoD-and-test-plan.md`.

## Attachments
- (none)
