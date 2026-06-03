# Ticket Context

- ticket_id: cmpx9x5tu00h9k70uw6svx122
- short_id: RSH-646
- run_id: cmpx9x5u900hek70uqzslp6nl
- run_branch: helix/research/RSH-646-host-agent-sprite-lifecycle-teardown-policy
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent sprite lifecycle & teardown policy (research)

## Description
# Host Agent sprite lifecycle & teardown policy (research)

Determine the optimal lifecycle/teardown policy for Host Agent sprites: when to destroy a sprite, when to let it hibernate, and when/how to regenerate it on demand. This ticket is chained to run **after** the parity work (FIX-644 credentials/lifecycle, FIX-645 loop relocation) so it can analyze the actually-implemented state — the long-lived in-sprite runner, the no-token credential model, and the existing TTL/GC scaffolding — rather than the pre-change code.

## Stakeholder direction (verbatim)

> They run a ticket. If they archive it, we can very soon destroy the sprites and reawaken it. If they comment similarly to deploy, we can soon after. The point is they might have some questions though. We can soon after get rid of it and reawaken it, rebuild it if necessary. I think in general if there's some time that passes, we can delete it and regenerate it if necessary. Maybe it can always just be a time-based thing.

The leading hypothesis to evaluate: **a purely time-based delete-and-regenerate policy** (delete after some idle time passes; regenerate on demand if the user returns) — versus an event-aware policy. Determine whether pure time-based is sufficient or whether event triggers (archive, deploy, run-complete) warrant their own handling.

## Branches / scenarios to account for

- Run starts → sprite provisioned, agent active.
- Run in progress, user asks `@Helix` questions → sprite must be responsive.
- Run completes / deploys → follow-up questions may arrive soon after.
- Ticket archived → can destroy soon (no further activity expected).
- Idle gap (no comments for a while) → destroy after time; regenerate on next comment.
- User returns after a long gap → re-provision + resume the conversation.
- Crash / server restart → recovery.
- Many concurrent open tickets → many sprites (cost + cleanup pressure).
- Orphaned sprites from failed teardown → must be swept.

## Experience to weigh

- First-reply latency after a gap: wake-from-hibernation (filesystem warm) vs full re-provision (re-clone + reinstall).
- Conversational continuity: the user should not perceive lost context across destroy/regenerate.
- Cost: hibernating sprites bill storage indefinitely and accumulate; deleted sprites cost nothing but pay a cold-start tax on return.

## Verified platform facts (do not re-derive — confirmed June 2026)

- **List for GC:** `GET https://api.sprites.dev/v1/sprites/` returns all sprites with `status`, timestamps, and `labels`. Recommend tagging Host Agent sprites with a `ticketId` label for GC filtering. (`@fly/sprites` wrapper currently exposes only create/get/delete — `services/sprites/client.ts`.)
- **Hibernation is native + automatic:** sprites hibernate on idle and auto-wake on request. Wake tiers: Warm (fast) vs Cold (slow). Billing: compute only while active; **storage persists/bills indefinitely**.
- **Filesystem persists across hibernation; RAM does NOT.** Services auto-restart on wake. Therefore the live in-runner Claude session does not survive hibernation — continuity relies on **`session_id` resume on wake**, which makes resume the routine path for any conversation with idle gaps (not just crash recovery).
- **Checkpoints** (create/list/restore) exist for explicit state save.
- **Vercel contrast:** Vercel sandboxes self-reap via a platform-enforced hard timeout (~45–90 min); sprites have no such backstop, which is why Helix must own the full lifecycle. Consider whether/how to align the two fleets' policies.

## Decisions already made to respect

- **Option X no-token invariant** (FIX-644): the org PAT never persists on the sprite, so a hibernating or zombie sprite is credential-poor — a leaked sprite is low blast-radius. This means imperfect teardown is tolerable; the policy can optimize for UX/cost, not just security.
- **Tiered idea to evaluate:** hibernate for short/medium idle (fast resume, good UX) → reaper idle-deletes after a longer inactivity threshold or on archive (bounded cost/surface), with `session_id` resume making both transparent.
- **Token refresh on wake:** a woken/regenerated sprite's `.helix-env` scoped key may have expired → must refresh before scoped calls.
- **GC by `ticketId` label,** multi-instance-safe (DB optimistic update).

## Deliverable

A recommended sprite lifecycle policy with concrete thresholds (idle-delete timeout, max-lifetime cap, archive handling), the reaper/GC design (list-by-label, orphan detection, multi-instance safety), the regenerate-on-demand flow (re-provision + `session_id` resume + token refresh), a cost model (storage accumulation vs cold-start tax), the UX tradeoffs per scenario above, and a file-level implementation plan across the three repos. Evaluate the "always just time-based" hypothesis explicitly and recommend for or against it.

## Out of scope

Sprite egress allowlist (separate RSH-637 follow-on); Anthropic inference-key proxy (parked).

## Referenced Tickets

4 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### RSH-607: Live Agents Security Measures
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 5 (run-1, run-2, run-3, run-4, run-5)
- Materialized files: 90 artifacts
- Path: `.helix-refs/RSH-607/`
- Manifest: `.helix-refs/RSH-607/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

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

### FIX-644: Host Agent: credentials & lifecycle parity (Workstream A)
- Mode: FIX | Status: PREVIEW_READY
- Completed runs: 1 (run-1)
- Materialized files: 15 artifacts
- Path: `.helix-refs/FIX-644/`
- Manifest: `.helix-refs/FIX-644/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
