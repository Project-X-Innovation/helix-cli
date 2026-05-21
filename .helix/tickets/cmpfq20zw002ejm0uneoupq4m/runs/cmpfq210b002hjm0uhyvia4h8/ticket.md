# Ticket Context

- ticket_id: cmpfq20zw002ejm0uneoupq4m
- short_id: BLD-545
- run_id: cmpfq210b002hjm0uhyvia4h8
- run_branch: helix/build/BLD-545-restructure-bundled-hlx-cli-skill-progressive
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Description
## Summary

Restructure the bundled `skill-content/` skill to follow Anthropic and OpenAI Codex skill-authoring best practices (progressive disclosure, trigger-heavy description), add operational gotchas and a ticket-prompting reference, refresh install/update for the post-PR-86 GitHub-release-asset flow, and add CI that fails any PR changing the CLI surface without updating the skill.

## Why

`skill-content/SKILL.md` has stale install/update content (PR #86 replaced npm self-update with GitHub release assets — see `src/update/**`, `.github/workflows/build-release.yml`), is missing operational gotchas proven in practice, has no ticket-prompting guidance, is flat instead of progressive-disclosure, and has no sync enforcement.

## Non-Negotiable Invariants

- Bundled skill stays at `skill-content/`. Do not move, rename `SKILL.md`, or change `name:` (`hlx-cli`). One skill, one `name:`.
- `hlx skill show` / `hlx skill install` behavior and flags unchanged.
- `SKILL.md` body (post-frontmatter) ≤5,000 tokens.
- YAML `description` ≤1024 chars; must front-load triggers for BOTH CLI-ops AND ticket-writing.
- Every subcommand and long-form flag from current `hlx --help` and each `hlx <subcommand> --help` must appear as a literal substring in `SKILL.md` or `references/commands.md`.
- Install/update sections describe the GitHub-release-asset flow only. `npm install -g @projectxinnovation/helix-cli@latest`, `npm uninstall -g`, `npm link` must not appear as recommended actions.
- The new CI check must fail the PR (non-zero exit) on missing surface coverage. Soft / warning-only is not acceptable.
- Do not modify CLI binary behavior, `hlx skill *` flags, auth, ticket-ref / repo-ref resolution, `src/update/**`, or `publish.yml`. Document only.
- Do not delete `references/commands.md`. Expand it.

## Required Behavior

1. **Restructure `skill-content/SKILL.md`**. Sections in order:
   - YAML frontmatter — `name: hlx-cli`; trigger-heavy `description` ≤1024 chars covering auth + env vars (`HELIX_API_KEY`, `HELIX_URL`), org switching, all `tickets` subcommands, ticket-ref resolution (numeric / short-id / internal-id), `inspect repos/db/logs/api`, `comments list/post`, `library` family, writing Helix tickets, broken-install recovery.
   - `## Workflow` — smallest command first; trust current `helix-cli/src/**`; pass ticket refs as-given; switch orgs before working in a repo that lives elsewhere.
   - `## Guardrails` — auth required; `hlx inspect *` is read-only; do not log full tokens; verify org with `hlx org current`.
   - `## Commands at a glance` — table of every top-level subcommand → one-line description; link `references/commands.md`.
   - `## Ticket work — gotchas`: `--description "<text>"` vs `--description-file <path>` (CLI errors when `--description <value>` resolves to a readable file path); 10,000-char description cap; dependency flags `--after`, `--reference`, `--implement-from`; `--dry-run` on `tickets continue`; `update-description --file | --text`; for `--mode RESEARCH`, drop implementation-shaped sections and skip "research only" boilerplate.
   - `## Artifact workflow` — terminal statuses `DEPLOYED`, `UNVERIFIED`, `FAILED` may return empty `artifacts` summary; pass `--run <runId>`. `PREVIEW_READY` fixed by PR #36.
   - `## Inspection` — PowerShell: prefer `--query '<sql>'` over positional SQL when SQL contains double-quoted Postgres identifiers.
   - `## Writing tickets` — short pointer → link `references/ticket-prompting.md`.
   - `## Install and update` — install + update download from GitHub release assets (`latest` release); recovery in `references/recovery.md`.
   - `## Source of truth` — link `references/current-state.md`.

2. **Rewrite `skill-content/references/commands.md`** — for every subcommand at every depth: usage line, every long-form flag with its argument, enum values for `--mode` (`AUTO|BUILD|FIX|RESEARCH|EXECUTE`), `--rating` (`thumbs-up|thumbs-down|love`; aliases `up`/`down`/`love`), `--for` on `skill install`, and any other enumerated flag. Cover the full `library` family with `--section`, `--rating`, `--reply-to`, and section-slug-or-heading-text behavior. Cover `login --manual`, `token add --current`, env-var auth, and `org current|list|switch` including switching to a non-default org.

3. **Create `skill-content/references/ticket-prompting.md`** — bundled ticket-authoring guide. Use hard constraints: `must`, `must not`, `do not`, `copy verbatim`, `only`, `exactly`, `fail closed`. Avoid for invariants: `can`, `should`, `ideally`, `we prefer`, `as needed`. Required sections in order:
   - **Core Rule** — what must / must not happen, scope boundaries, invariants, failure behavior, batch/cardinality semantics, source-of-truth files, already-decided tradeoffs. Resolve open questions with user before drafting; never include an `Open Questions` section.
   - **Required Ticket Structure** — exactly these headers in order: `# Ticket: <title>`, `## Summary`, `## Why`, `## Decisions Already Made`, `## Do Not Re-Decide`, `## Non-Negotiable Invariants`, `## In Scope`, `## Out of Scope`, `## Required Behavior`, `## Failure Behavior`, `## Batch / Cardinality Rules`, `## Persistence / Artifact Rules`, `## Acceptance Criteria`. Keep `Failure Behavior` and `Batch / Cardinality Rules` for infrastructure / deployment / queue / workflow / state-machine work.
   - **How To Draft** — separate settled from open; turn fragile requirements into must / must not; forbid post-failure state transitions; state cardinality for multi-entity flows; name exact source-of-truth files; add negative acceptance criteria.
   - **Common Failure Modes** (all five with one example): scope expansion; over-optimization (copy canonical files); fail-open (hard prerequisites fail the workflow); batch/cardinality (forbid `ticketIds[0]` or `latest run across all selected tickets` as proxies); domain vocabulary drift (e.g. `SDF AccountConfiguration is not the same as Objects`).
   - **Deployment / SDF Checklist** — canonical files are source of truth; copy `src/deploy.xml` verbatim; do not generate `deploy.xml` unless fallback defined; package contents define deploy scope; missing baseline and dirty tree are hard failures; production deploys use exact stored base/head metadata; multi-ticket deploys need per-ticket / per-repo or aggregate manifests; failed deploys write failed deploy artifacts.
   - **Good / Bad Prompt Patterns** — good: `Do not redesign this flow.`, `Copy the canonical file verbatim.`, `Fail closed: if the baseline is missing, abort.` Bad: `Implement this however makes the most sense.`, `Feel free to improve related areas while you're there.`, `Use the latest successful run to determine production deploy scope.`
   - **Draft Review Checklist** — decisions vs open; says what Helix must not do; source of truth named; scope constrained; artifact + failure behavior explicit; silent fallback forbidden; cardinality / batch explicit; singleton shortcuts forbidden for multi-entity work; platform terms exact; negative acceptance tests present; no `Open Questions` section.

4. **Create `skill-content/references/recovery.md`** — document the current install/update flow per `src/update/**` and `.github/workflows/build-release.yml`. Cover: how `hlx update` resolves `latest`; tarball download; validation (`dist/index.js` exists, binary runs `--version`); recovery command emitted on validation failure; how to diagnose a broken global install. Do not recommend `npm install -g`, `npm uninstall -g`, or `npm link`.

5. **`skill-content/references/current-state.md`** — append a dated note (today) marking the migration from npm self-update to GitHub-release-asset update; cite PR #86.

6. **Add `.github/workflows/skill-sync.yml`** — runs on `pull_request` and `push: main`. Build via `npm ci`; recursively run `--help` on every subcommand starting from `node dist/index.js --help` and descending into all subcommands found; parse subcommand names, long-form flags, and enum values; assert every parsed token appears as a literal substring (case-sensitive; backticks stripped) in `skill-content/SKILL.md` or `skill-content/references/commands.md`; exit non-zero with the list of missing tokens. Parser script under `scripts/skill-sync/`.

7. **PR template — `.github/pull_request_template.md`** — add (preserving existing content): `- [ ] If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md.`

## Failure Behavior

CI surface check exits non-zero on: failed build; unparseable `--help` output (`unrecognized help output for <subcommand>`); unreadable skill files; missing CLI surface token. If `.github/pull_request_template.md` already exists, append the checkbox; preserve existing content.

## Acceptance Criteria

1. `SKILL.md` frontmatter has `name: hlx-cli` and `description` ≤1024 chars with triggers for CLI ops AND ticket-writing; body ≤5,000 tokens; contains the ten sections from Required Behavior item 1 in order.
2. `references/commands.md` covers every subcommand and long-form flag from current `hlx --help` and `hlx <subcommand> --help`. Verified by the new CI job.
3. `references/ticket-prompting.md` exists with the seven sections from Required Behavior item 3, using the language patterns and examples named.
4. `references/recovery.md` documents the GitHub-release-asset flow. `npm install -g @projectxinnovation/helix-cli@latest`, `npm uninstall -g`, `npm link` do not appear as recommended actions.
5. `.github/workflows/skill-sync.yml` runs on `pull_request` and `push: main` and fails on missing CLI surface elements.
6. `.github/pull_request_template.md` includes the skill-update checkbox.
7. Negative test: deleting one flag mention from `references/commands.md` fails the CI surface check.
8. `hlx skill show` after build emits new `SKILL.md` unchanged; `hlx skill install` continues to copy `skill-content/`.

## Attachments
- (none)
