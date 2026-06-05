# Ticket Context

- ticket_id: cmq0dsmf500ujk70uzjv7di78
- short_id: BLD-681
- run_id: cmq0dsmfj00uok70uwz55c4mu
- run_branch: helix/build/BLD-681-host-agent-1-7-fix-sprite-provisioning-exec-1-no
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent [1/7] - Fix sprite provisioning (EXEC-1): no-shell I/O layer + integration test

## Description
# Host Agent ① — Fix sprite provisioning (EXEC-1) via a no-shell I/O layer + integration test

## Context
The host agent has **never reached `ACTIVE`** in prod (flag-off). Root cause, proven on live
sprites: `@fly/sprites` `sprite.exec(string)` does `split(/\s+/)` + `execFile` — **no shell**. The
provisioning in `host-agent-service.ts` uses `exec()` with heredocs, `&&`, pipes, and
`GIT_ASKPASS=… git clone`, so the askpass write, repo clone, `.helix-env` write, and runner deploy
all silently fail → runner boots into an empty dir → health check fails → `ERROR`. Invisible because
the tests mock the sprite client (exec semantics never exercised).

This is greenfield (no prod usage). This ticket lands **`--after` the Egress Lockdown chain** and
builds on enforced egress.

## Changes
**helix-global-server**
- Add a thin sprite I/O helper that mirrors the Vercel sandbox interface: `run(cmd, args, env)` via
  `execFile` (argv, no shell), and `writeFile(path, bytes)` via **stdin streaming** (pipe to `tee`),
  plus `setEnv` via the SDK `env` option. **Do NOT blanket-wrap in `sh -c`** — that reintroduces a
  shell-injection surface on a PAT-handling component; reserve `sh -c` only for an irreducible pipe.
- Rewrite all provisioning steps in `host-agent-service.ts` (clone, `.helix-env`, runner deploy,
  scrub) onto this helper. Credentials go via `env`/stdin, **never** in an argv/command string.
- Remove the dead fnm node-install fallback (node/npm/git are preinstalled at `/.sprite/bin`); create
  `/app` explicitly (absent by default; non-root uid 1001).
- Fix the credential scrub so the glob actually matches (run under shell or enumerate paths).
- Preserve `setSpriteNetworkPolicy()` (BLD-673) — the refactor must not drop/bypass it.

**helix-global-client / helix-cli**: attached for end-to-end testing per convention.

## Acceptance criteria (run against a real sprite)
- Private ticket repo(s) clone with a working askpass; runner deploys, boots, reaches `ACTIVE`.
- **−** PAT/`GITHUB_TOKEN` appears in neither the runner process env nor any log/stderr.
- **−** Provision failure → `ERROR` + cleanup; no orphaned sprite or inspection key.
- **B7 egress-compat:** with `sandboxEgressEnforce` ON, provisioning still reaches `ACTIVE` (all
  clones/installs in the setup phase before lock; reuse BLD-669 pattern); `setSpriteNetworkPolicy()`
  still invoked; a non-allowlisted host is blocked. This suite also completes BLD-673's end-to-end
  verification (first run where provisioning succeeds).

## References
RSH-640 (parity dev plan), RSH-648 (egress design), BLD-668 (policy module), BLD-673 (sprite egress).
See repo: `host-agent-research-report.md`, `host-agent-DoD-and-test-plan.md`.

## Attachments
- (none)
