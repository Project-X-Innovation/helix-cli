# Ticket Context

- ticket_id: cmq0dtov600vdk70u1qper2rt
- short_id: BLD-685
- run_id: cmq0dtown00vik70uivo4g4oo
- run_branch: helix/build/BLD-685-host-agent-5-7-credential-hardening-short-lived
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [5/7] - Credential hardening (short-lived key, rotate on wake)

## Description
# Host Agent ⑤ — Credential hardening (short-lived key, rotate on wake)

## Context
The host agent uses a **persisted `hxi_` inspection key with no `expiresAt`** — longer-lived and
broader than the Vercel sandbox's short-lived JWT, on a less-trusted (model-driven) component, and it
sits on a sprite that may now live for days. Aligns with RSH-640 (security parity) and the egress
data-at-rest concern (incl. BLD-680). Depends on ④ (wake) for the rotation hook.

## Changes
**helix-global-server**
- Give the inspection key an `expiresAt` tied to the session/activity window (not unbounded).
- On each **wake**, mint a fresh short-lived key and re-inject it (reuse the runner `/token-refresh`
  endpoint or write via the I/O layer's stdin path) — **never** put the secret in an argv/command
  string or log.
- Revoke the key on reap and on supersede.

**helix-global-client / helix-cli**: attached for end-to-end testing per convention.

## Acceptance criteria
- **−** Secrets never appear in argv, command strings, logs, or stderr.
- **+** On wake, a fresh key is injected; **−** the prior key no longer authenticates (401).
- **+** No long-lived plaintext secret is required to sit on disk through idle.

## References
RSH-640, RSH-648, BLD-680 (account-scoped egress / exfil). See `host-agent-DoD-and-test-plan.md`.

## Attachments
- (none)
