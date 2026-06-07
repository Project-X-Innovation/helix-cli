# Ticket Context

- ticket_id: cmq0dtgrg00usk70ufdpd5th2
- short_id: BLD-682
- run_id: cmq0dtgt400uxk70ujz13cr76
- run_branch: helix/build/BLD-682-host-agent-2-7-persist-resume-the-claude-session
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [2/7] - Persist & resume the Claude session across a restart

## Description
# Host Agent ② — Persist & resume the Claude session across a restart

## Context
Resume is the linchpin of the always-available design. Verified on real infra: the Agent SDK stores
sessions at `/home/sprite/.claude/projects/<cwd>/<id>.jsonl` (persistent HOME) and a **fresh process
resumes prior context**. But today the `session_id` is **memory-only** (exposed on `/health`,
captured in `session.ts`), and provisioning sets `claudeSessionId: null` — so resume across a
restart/cold cycle is **not plumbed**. Depends on ① (provisioning must work first).

## Changes
**helix-global-server**
- Capture `session_id` from the SDK init message and **persist it durably**: write to the sprite
  disk (e.g. `/app/.helix-session`, which survives cold) AND mirror to the `HostAgentSession.
  claudeSessionId` column (replace the `:347` `null`).
- On runner boot, read the persisted id and pass `resume: <id>` to the Agent SDK.
- **Pin cwd and HOME** for the runner process so the SDK session file path is deterministic across
  restarts (the session is keyed by cwd).
- Re-persist the id as the conversation advances.

**helix-global-client / helix-cli**: attached for end-to-end testing per convention.

## Acceptance criteria
- Kill the runner process → restart → it resumes with full prior context (fresh-process resume).
- **+** Resume works after a genuine cold cycle (disk + `.jsonl` restored).
- **−** Resuming a missing/wrong id fails loud (no silent blank "resumed" session).

## References
RSH-640, RSH-646 (lifecycle research). Builds on ① (T-prev). See `host-agent-research-report.md`.

## Attachments
- (none)
