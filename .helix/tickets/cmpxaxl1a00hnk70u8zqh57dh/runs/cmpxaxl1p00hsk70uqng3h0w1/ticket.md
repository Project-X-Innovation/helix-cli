# Ticket Context

- ticket_id: cmpxaxl1a00hnk70u8zqh57dh
- short_id: RSH-648
- run_id: cmpxaxl1p00hsk70uqng3h0w1
- run_branch: helix/research/RSH-648-research-design-layered-egress-allowlist-for
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Research/design: layered egress allowlist for Helix sandboxes (org-level)

## Description
# Research/design: layered egress allowlist for Helix sandboxes (org-level)

Design the egress allowlist system for Helix sandboxes — a default-deny model with a layered, extensible allowlist — to be built **once on the unified sandbox abstraction** (RSH-647) so both fleets (Vercel workflow agents, sprites Host Agent) inherit it. Chained after RSH-647 so it targets the unified interface rather than per-backend code.

## Why default-deny, and why this matters
The cloned **private source code** makes the box a target. Any reachable host that can *ingest* data is a potential exfiltration channel — and a prompt-injected agent can supply its **own** credential (an attacker PAT in the injection), so Helix holding no token does **not** prevent, e.g., pushing the private repo to an attacker's GitHub repo. The only thing that stops that is the host not being reachable. So egress must be **minimal-by-default**, and every opening is a consciously-owned, audited code-exfil channel.

## Layered model (effective policy = union, default-deny)
1. **Built-in default** — ships with Helix, deploy-gated code constant (per RSH-637's starting allowlist + security stance).
2. **Helix-global additions** — what we add across all orgs; deploy-gated code (admin table only if iteration demands it).
3. **Org / customer additions** — DB-backed self-service, heavily guarded (this is the new system).
4. **(Deferred — design for, do NOT build) Ticket-level escalation** — Helix-asks-when-stuck ("I need access to X"), human-approved, ephemeral, ticket-scoped entry in the union. Focus **org-level** now; ensure the model lets this layer on later without rework.

## Guardrails on org/customer additions
- **Permissioned:** org admins only.
- **Validated:** reject overly-broad entries — bare TLDs (`*.com`), `*`, raw IPs / wide CIDRs, Helix-server spoofs. Bounded wildcards only (`*.theircompany.com`).
- **Audited:** who added what, when (security event).
- **Zone-scoped:** apply to **warm/cold only, NEVER the hot zone.** Hot (prod-data steps) stays locked to Anthropic + Helix.
- **Clear UX:** the add action states plainly that agents will be able to send data to the domain — informed opt-in.

## Provisioning vs runtime allowlists (phase-separation)
- **github.com is allowed at PROVISION only** (the clone), removed at **RUNTIME**. The Host Agent does no git network ops after the clone, so runtime github reachability only adds an exfil path.
- **Runtime allowlist is minimal-by-default = Anthropic (inference) + Helix server only.** Anything added at runtime is an explicit decision to open a code-exfil channel for the customer's source.

## egress controls hosts; tokens control repos
Repo-level restriction is **not** achievable at the firewall — SNI/DNS see only the hostname (`github.com`), never the `owner/repo` path (inside TLS). "Allow only certain repos" is a **credential-scoping** concern (scoped GitHub App installation token → ticket repos, read-only). Document this division as a principle. True per-repo network enforcement would require a programmable MITM proxy (neither provider offers it natively — overkill given scoped tokens).

## Open web / browsing
Open egress cannot coexist with the private code in the same context (open egress = open exfil of the source). "Browse the web / run projects needing the internet" requires **phase-separation** — a context without the private repo mounted — or it reopens the exfil hole. Evaluate how the zone model handles this.

## Zones (from RSH-637)
Hot (scout/diagnosis) = Anthropic + Helix only; warm (implementation) adds npm/GitHub/Context7; cold = human-reviewed full access. Org additions apply to warm/cold only.

## Render via the unified abstraction (RSH-647)
One logical allowlist → rendered to Vercel `updateSessionNetworkPolicy` (SNI + CIDR) and sprites `POST /v1/sprites/{name}/policy/network` (DNS). Built once on the abstraction's network-policy surface.

## Deliverable
The layered model; org-additions data model + validation rules + permissions + audit + UX; zone interaction; the provisioning-vs-runtime split; how the allowlist is expressed on the unified sandbox interface; and a dev-ticket-ready plan. Mark ticket-level escalation as designed-for-future.

## Out of scope
Ticket-level escalation (build later); the sandbox abstraction itself (RSH-647); the Anthropic inference-key proxy (parked, though credential-brokering normalization may relate).

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

### RSH-646: Host Agent sprite lifecycle & teardown policy (research)
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 21 artifacts
- Path: `.helix-refs/RSH-646/`
- Manifest: `.helix-refs/RSH-646/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### RSH-647: Research: unified sandbox abstraction over Vercel + sprites (persistent as the single axis)
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 1 (run-1)
- Materialized files: 20 artifacts
- Path: `.helix-refs/RSH-647/`
- Manifest: `.helix-refs/RSH-647/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
