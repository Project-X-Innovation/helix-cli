# Ticket Context

- ticket_id: cmpxdg7e900i1k70umb6sdeic
- short_id: FIX-650
- run_id: cmpxdg7ep00i6k70u8s7c38y1
- run_branch: helix/fix/FIX-650-move-goal-evaluator-into-a-per-goal-sprite
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Move goal evaluator into a per-goal sprite (currently a tool-enabled agent on the trust anchor)

## Description
# Fix: move the goal evaluator into a per-goal sprite (it currently runs as a tool-enabled agent on the trust anchor)

## Why this is urgent — security context

The goal evaluator (`goal-service.ts` → `evaluateGoal` → `runAssessor` :415-426 / `runDecider` :511-522) calls the Claude **Agent SDK** `query()` **in-process on helix-global-server (the trust anchor)** with:
- **default tools enabled** (no `tools: []`) → Bash / filesystem access, and
- **the entire server environment** (`env: { ...process.env, ANTHROPIC_API_KEY ... }`) → every secret: `DATABASE_URL`, `APP_ENCRYPTION_KEY`, `GITHUB_TOKEN`, `SPRITES_TOKEN`, `VERCEL_TOKEN`, `ANTHROPIC_API_KEY`,
- driven by a **user-influenced prompt** (goal title/description + child-ticket run summaries).

That is a prompt-injectable, tool-capable agent with read access to the production server's filesystem and secrets. It is currently **inert only by accident**: the *also*-missing `permissionMode: "dontAsk"` makes every tool call block on an interactive approval that never arrives headless → 90s timeout → `PAUSED`. The same defect that arms it also jams it (and is why goals "never works" — see RSH-630). Introduced 2026-05-23 (helix-bot, PR #621), present since the feature was built.

## ⛔ DO NOT
Do **not** "make goals work" by adding `permissionMode: "dontAsk"` and/or the missing SDK options **on the server**. That unjams a loaded weapon — tools live + full server env + trust anchor. RSH-630 correctly diagnosed the *symptom* (missing SDK options) but the correct fix is **relocation off the server**, not unjamming. The hang and the exposure share one root cause; moving execution into an isolated sprite resolves both.

## Part 1 — Immediate safety (ship first; independent of Part 2)
1. Make "disabled" **intentional**, not accidental — short-circuit / feature-flag `evaluateGoal` so it cannot run in its current armed form (tool-enabled, full-env, on-server) until Part 2 lands.
2. Defense-in-depth while it still exists: **scope the env** on both `query()` calls to strip server secrets — and do **not** add `permissionMode`/tools.
3. **Verify no exploitation:** search production logs for any goal-eval tool execution or unexpected outbound network calls; confirm whether any goal ever advanced past `PAUSED`. Record findings.
4. **Resolve the injection surface:** confirm whether goal descriptions / child content can originate from **external sources** (the "Goal Setup: WhatsApp & Email" pipeline). If external content can reach the evaluator prompt, treat the exposure as externally reachable (higher severity) and **rotate** the high-value secrets listed above.

## Part 2 — The fix: per-goal sprite, tool-using PM agent
Relocate goal evaluation off the trust anchor into a **sprite-per-goal**, mirroring the Host Agent's sprite-per-ticket model (RSH-640, FIX-644/645) and the unified sandbox abstraction (RSH-647):
- The PM agent runs **inside the sprite**, never in helix-global-server. It should **see everything it needs to make powerful decisions** — the cloned codebase plus child-ticket context — **with tools enabled**, which is safe *because the box is isolated and credential-poor* (no server secrets, no server filesystem).
- Apply the Host Agent **no-token / scoped-credential model**: org PAT used only for the provision-time clone via ASKPASS (never persisted, never in the runner env, tokenless remote); a **repo-scoped, short-lived inspection key** for callbacks; the inference key the only durable credential in the box (same accepted/parked posture as the Host Agent and orchestrator).
- Reuse the Host Agent **lifecycle**: hard TTL, credential scrub, reliable teardown + GC (per RSH-646), provisioned through the sandbox abstraction's ephemeral/persistent mode once available (RSH-647).
- Keep the assessor/decider logic; the trigger (`resolveGoalParent`, `orchestrator.ts:1556/2907`) stays, but it now provisions a sprite and runs the agent there instead of calling `query()` in-process.

## Verification
- Goal eval spawns **no** `query()` / CLI subprocess in the helix-global-server process; the `...process.env` spread is gone from `goal-service.ts`.
- A goal with a completed setup ticket runs the PM agent in a sprite, produces a verdict, spawns a child (or completes), and leaves `EVALUATING` end-to-end.
- `printenv` in the sprite runner shows no GitHub token and no server secrets — only the cloned repo + scoped tokens.

## Out of scope
- The five tool-less services (deployment-prep, merge-analysis, walkthrough, transcript, ticket-mode-classifier) → separate Messages-API refactor ticket (they need a one-time message, not the agent loop or a sandbox).
- Building the Host Agent relocation (FIX-644/645) and the sandbox abstraction (RSH-647) — **reuse** them, don't rebuild.

## Sequencing
The Part 2 build reuses the Host Agent's **built** loop relocation (FIX-645) and credential/lifecycle work (FIX-644) — the concrete in-sprite patterns it mirrors. **Chain this after FIX-645** so those patterns have landed as code. Keep the design aligned with the unified sandbox abstraction (RSH-647) **by reference only** — RSH-647 is research (a design, not built code), so do NOT block on it; the eventual abstraction implementation will absorb both the Host Agent and goal sprites. (Part 1 — immediate safety — may be done independently and sooner if needed.)

## Constraints
- Staging first; do not push to main directly. All three repos.

## Referenced Tickets

4 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### RSH-630: Goals Not Quite There
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 18 artifacts
- Path: `.helix-refs/RSH-630/`
- Manifest: `.helix-refs/RSH-630/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-640: Development plan: Host Agent security parity with the Vercel orchestrator
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 18 artifacts
- Path: `.helix-refs/RSH-640/`
- Manifest: `.helix-refs/RSH-640/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-646: Host Agent sprite lifecycle & teardown policy (research)
- Mode: RESEARCH | Status: RUNNING
- Completed runs: 0 ()
- Materialized files: 0 artifacts
- Path: `.helix-refs/RSH-646/`
- Manifest: `.helix-refs/RSH-646/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-647: Research: unified sandbox abstraction over Vercel + sprites (persistent as the single axis)
- Mode: RESEARCH | Status: WAITING
- Completed runs: 0 ()
- Materialized files: 0 artifacts
- Path: `.helix-refs/RSH-647/`
- Manifest: `.helix-refs/RSH-647/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
