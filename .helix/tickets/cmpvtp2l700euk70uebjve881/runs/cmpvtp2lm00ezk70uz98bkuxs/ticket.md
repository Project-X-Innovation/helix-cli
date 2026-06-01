# Ticket Context

- ticket_id: cmpvtp2l700euk70uebjve881
- short_id: RSH-640
- run_id: cmpvtp2lm00ezk70uz98bkuxs
- run_branch: helix/research/RSH-640-development-plan-host-agent-security-parity-with
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Development plan: Host Agent security parity with the Vercel orchestrator

## Description
# Development plan: bring the Host Agent to security parity with the Vercel orchestrator

## Context

The Host Agent (built in BLD-577, `helix-global-server/src/services/host-agent-service.ts`) is a persistent, sprite-backed agent per ticket. A pre-deployment security audit (RSH-607) found 11 flaws. The feature is gated behind `HOST_AGENT_ENABLED=false` and is NOT deployed to production.

The root cause of those findings is that the Host Agent is a security *regression* from patterns the team already built, tested, and deployed in the Vercel-sandbox orchestrator (`helix-global-server/src/helix-workflow/orchestrator/**` and `src/helix-workflow/step-executor/**`). The orchestrator already solves the hardest problems the Host Agent gets wrong: it never lets the agent hold a durable broad credential, it isolates the agent loop inside the disposable sandbox, and it manages credentials and lifecycle safely.

The goal of this ticket is to produce a concrete **development plan** to bring the Host Agent to parity with the orchestrator's proven architecture. This is a research/planning ticket — the deliverable is the plan, not the implementation. Build tickets will follow.

## Objective

Produce a sequenced, file-level development plan covering two workstreams that together bring the Host Agent to credential, lifecycle, and architectural parity with the orchestrator. The agent must keep its full capabilities (exec, codebase access, etc.) — parity is about the security posture of the box and the placement of the loop, NOT about restricting what the agent can do.

### Workstream A — Credentials & lifecycle parity

Port the orchestrator's proven patterns into the Host Agent:

- **Credential handling (FLAW-03):** Replace the PAT-in-clone-URL approach (`host-agent-service.ts:501-505`, which embeds the org PAT in the clone URL where it persists in `.git/config` and is readable by the agent's own tools) with the orchestrator's `GIT_ASKPASS` pattern (`orchestrator/repositories.ts:173-221`): the token is supplied per-command via env, never written to the URL or git config, and the askpass script is scrubbed afterward.
- **Scoped inspection key (FLAW-05):** Mint the Host Agent inspection key scoped to the ticket's repositories (`host-agent-service.ts:522` currently omits `repos`, yielding org-wide access), and make empty-scope a *deny*, not a grant-all, in the middleware (`auth/middleware.ts:294-295, 369-376`).
- **Lifecycle (FLAW-06):** Add a hard sprite TTL (mirroring `vercelSandboxTimeoutMs`, `config/env.ts:168`), scrub credential files from the sprite, and make teardown reliable — retry with backoff plus a garbage-collection sweep for orphaned `ha-` sprites. Current teardown is fire-and-forget (`services/sprites/client.ts:40-49`, `host-agent-service.ts:840`).

### Workstream B — Loop placement parity

Relocate the agent reasoning loop out of the helix-global-server process (the trust anchor — it holds the DB connection, the org-PAT decryption keys, and key-minting) and into the disposable sprite, mirroring how the orchestrator runs its step agents inside the Vercel sandbox (`step-executor/execute.ts:209-235`, `step-executor/runtime-assets.ts`):

- A **long-lived host-agent-runner** that runs inside the sprite for the ticket's active lifetime, hosting the **live** `query()` session and the MCP tools. Tools execute local shell directly in the box instead of round-tripping `sprite.exec` from the server. The Claude session stays active in the sprite for the ticket lifetime — there is no per-comment context rebuild.
- The control plane launches the runner in the sprite with the scoped tokens and the inference key in env (the inference key in the box is accepted — see Parked).
- New `@Helix` comments are delivered into the already-running live session (e.g., via the Agent SDK streaming-input mode), not by spawning a fresh loop per comment.
- Replies are posted back via the callback API; the control plane owns comment attribution under a dedicated agent/system identity, removing the current reporter-impersonation (`host-agent-service.ts:405, 619, 797`). (Closes FLAW-07.)
- Moving the loop out of the trust anchor and ensuring the box holds no durable broad credential downgrades the shell-injection and error-leakage findings (FLAW-01, 02, 04, 09, 10): a compromised box has nothing of cross-tenant value to reach or exfiltrate.

### Session / persistence model (decided — plan must detail it)

The Claude session is **held live in the long-running in-sprite runner for the ticket lifetime**; it is NOT resumed per comment under normal operation. The plan must specify:

- **(a) Comment delivery:** how new comments are fed into the live session (control-plane push via SDK streaming input vs. runner polling the callback API).
- **(b) Recovery:** crash/restart handling — persisted `session_id` resume re-enters only as a recovery path when the live runner is lost, not as the normal flow.
- **(c) Token refresh:** a long-lived runner with short-lived scoped tokens requires the control plane to refresh the GitHub and inspection tokens into the live runner periodically; the sprite TTL is a max-lifetime bound with re-launch-on-expiry if the ticket is still active.

## Cross-repo scope

- **helix-global-server** — the bulk: provisioning, the in-sprite runner, in-box MCP tools, credential handling, lifecycle/TTL/teardown, the callback path, and comment attribution.
- **helix-cli** — any changes to the callback surface the in-sprite runner uses (e.g., `hlx comments post`, `hlx inspect`) and how the runner authenticates with a scoped, refreshable token.
- **helix-global-client** — rendering of agent-authored comments under a dedicated agent identity (FLAW-07 remediation UX).

## Explicitly out of scope (separate / parked work)

- **Inference-key (Anthropic) exposure / inference proxy** — parked. The in-sprite loop accepts the inference key in the box, the same posture as the orchestrator. Worst case is bounded to inference cost/availability, not data or cross-tenant access. A separate report will cover an inference proxy.
- **Egress phase-separation and the inspection-API containment waist** (result-size caps, audit logging, distributed rate limiting, capability scoping) — beyond parity; neither agent fleet has it today. Separate future work.
- **The orchestrator's own findings** — the Anthropic key sitting in the sandbox agent's env, and `sh -c` filename-injection in merge/conflict handling (`orchestrator/git-ops.ts:649-652, 696-699, 734-738`). Note these for separate tickets; do not address here.

## Deliverable

A development plan that includes: the target architecture with the session/persistence model fully specified; a file-by-file change list across all three repos; new modules and DB migrations required; a sequenced implementation order across the two workstreams (and what can ship independently); a test plan covering multi-instance behavior, credential-scrub verification, token refresh, and teardown/GC; and a rollout plan behind `HOST_AGENT_ENABLED`. Use RSH-607 as the findings baseline and the orchestrator (`orchestrator/**`, `step-executor/**`) as the reference implementation to port from.

## Referenced Tickets

2 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### BLD-577: Final Live Host Agent
- Mode: BUILD | Status: DEPLOYED
- Completed runs: 1 (run-1)
- Materialized files: 17 artifacts
- Path: `.helix-refs/BLD-577/`
- Manifest: `.helix-refs/BLD-577/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-607: Live Agents Security Measures
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 5 (run-1, run-2, run-3, run-4, run-5)
- Materialized files: 90 artifacts
- Path: `.helix-refs/RSH-607/`
- Manifest: `.helix-refs/RSH-607/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
