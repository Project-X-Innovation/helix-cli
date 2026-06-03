# Ticket Context

- ticket_id: cmpxav9gi00hgk70u5wjo66t3
- short_id: RSH-647
- run_id: cmpxav9h400hlk70usfifhmgb
- run_branch: helix/research/RSH-647-research-unified-sandbox-abstraction-over-vercel
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Research: unified sandbox abstraction over Vercel + sprites (persistent as the single axis)

## Description
# Research: unified sandbox abstraction over Vercel + sprites

Design a unified sandbox API that abstracts over Helix's two sandbox backends — Vercel Sandbox (workflow execution) and sprites.dev/Fly (Host Agent, previews) — so cross-cutting concerns are built **once**, not twice. Chained to run after the parity + lifecycle work (FIX-644, FIX-645, RSH-646) so it abstracts over the settled code rather than code mid-change.

## Central design principle (stakeholder direction)
**`persistent: true | false` should be the single meaningful variable.** Everything else — command exec, file I/O, egress allowlist, credential handling, lifecycle/teardown — should be uniform across both modes. The research's core job is to determine **what it would take to make persistence literally the only variable.**

## Capability bundles that must be normalized
Today these ride along with the lifecycle/provider choice and would leak through the abstraction unless explicitly normalized:
- **Credential brokering** — Vercel-native (`injectionRules`), absent on sprites. To keep it from silently disappearing in persistent mode, normalize it (e.g., a common Helix broker/proxy) or document the gap as a known mode-dependent capability.
- **Auto-reap / teardown** — Vercel has a platform-enforced hard TTL (self-reaping); sprites need the reaper designed in RSH-646. The interface must provide guaranteed teardown for **both** modes.
- **Command execution** — Vercel structured `runCommand({cmd,args})` vs sprites `exec(string)` + `execFile`. Expose one structured interface (no raw shell).
- **Network policy** — Vercel SNI + CIDR + `updateSessionNetworkPolicy`; sprites DNS-level `POST /v1/sprites/{name}/policy/network`. One logical allowlist model, rendered to each backend.
- **File I/O, reconnect, identity/naming** — minor; unify.

## Provider-mapping finding to evaluate
The `persistent` flag does **not** map symmetrically to providers: **sprites can serve both modes** (persistent = hibernate/resume; non-persistent = delete-on-idle per RSH-646), while **Vercel can only do ephemeral** (~45–90 min hard TTL, self-reaping). The research should note this but NOT treat it as license to consolidate (see scope boundary).

## Scope boundary (stakeholder direction)
The near-term goal is an **abstraction OVER both existing backends** — adapters behind one interface, preserving current behavior. It is **NOT** a migration/rewrite of everything onto sprites. Single-backend consolidation is a large, regression-prone effort that would require re-testing the entire workflow path; it is **explicitly deprioritized** and should be mentioned only as a possible eventual direction, not the recommended plan. The migration path must preserve existing behavior to avoid regressions.

## The payoff to validate
Would this interface let us implement the **egress allowlist, credential isolation, lifecycle/teardown, and exec safety once**, with both fleets/modes inheriting them? If yes, that is the justification for the abstraction. If the controls would still need per-backend code, say so — the abstraction's value drops.

## Existing modules that would move behind the interface
`helix-workflow/orchestrator/sandbox-runtime.ts`, `command-runtime.ts`, `repositories.ts`, `git-ops.ts`, `step-executor/*`, `services/host-agent-service.ts`, `services/sprites/client.ts`.

## Deliverable
The interface surface + adapter pattern; a capability-normalization plan (esp. brokering + teardown); a concrete answer to "what it takes to make `persistent` the only variable"; an effort estimate; a regression-safe migration path that keeps both backends working; and a recommendation (abstract-over-both now; consolidation deferred). A development ticket implementing the design follows separately.

## Out of scope
The single-backend consolidation rewrite; building the egress allowlist itself (separate ticket — but the abstraction should be designed to HOST it); the Anthropic inference-key proxy (parked — though brokering normalization may inform it).

## Referenced Tickets

4 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### RSH-637: Egress Access
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 14 artifacts
- Path: `.helix-refs/RSH-637/`
- Manifest: `.helix-refs/RSH-637/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-640: Development plan: Host Agent security parity with the Vercel orchestrator
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 18 artifacts
- Path: `.helix-refs/RSH-640/`
- Manifest: `.helix-refs/RSH-640/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### FIX-645: Host Agent: loop placement parity (Workstream B)
- Mode: FIX | Status: PREVIEW_READY
- Completed runs: 1 (run-1)
- Materialized files: 15 artifacts
- Path: `.helix-refs/FIX-645/`
- Manifest: `.helix-refs/FIX-645/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-646: Host Agent sprite lifecycle & teardown policy (research)
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 21 artifacts
- Path: `.helix-refs/RSH-646/`
- Manifest: `.helix-refs/RSH-646/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
