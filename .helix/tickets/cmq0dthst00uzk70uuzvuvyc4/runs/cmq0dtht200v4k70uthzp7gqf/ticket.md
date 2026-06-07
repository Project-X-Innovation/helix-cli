# Ticket Context

- ticket_id: cmq0dthst00uzk70uuzvuvyc4
- short_id: BLD-683
- run_id: cmq0dtht200v4k70uthzp7gqf
- run_branch: helix/build/BLD-683-host-agent-3-7-lifecycle-idle-not-destroy-n-day
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [3/7] - Lifecycle: idle-not-destroy + N-day reap

## Description
# Host Agent ③ — Lifecycle: idle-not-destroy + N-day reap

## Context
Today a GC hard-**destroys** the sprite at a 90-min TTL (swept every 10 min) and revokes the key —
throwing away the persistent disk that makes wake/resume possible. Sprites natively idle (warm→cold,
free, disk intact) and wake on request. We want **idle-not-destroy**: persist indefinitely, reap only
after long inactivity. Depends on ② (resume) and ④ (wake) for the full loop, but the lifecycle/GC
change is self-contained.

## Changes
**helix-global-server**
- Remove the 90-min hard-destroy. Introduce a status model: `RUNNING` (process up) → `IDLE`
  (warm/cold, preserved) → reaped.
- Replace the GC: reap only sessions whose `lastActivityAt` exceeds an **N-day inactivity** window
  (config-driven); on reap, revoke the inspection key, scrub secrets, delete the sprite.
- Track `lastActivityAt` on comment delivery / wake.

**helix-global-client / helix-cli**: attached for end-to-end testing per convention.

## Acceptance criteria
- **−** Reap does NOT fire on a recently-active (merely idle) sprite.
- **+** After N-day inactivity: key 401s, secrets scrubbed, sprite deleted, session unrecoverable.
- Gate: confirm with sprites.dev that a cold sprite is NOT auto-evicted before our reap window
  (else wake = data loss) — see G1.

## References
RSH-646 (lifecycle/teardown research), RSH-640. See `host-agent-DoD-and-test-plan.md`.

## Attachments
- (none)
