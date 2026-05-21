# Diagnosis Statement

## Problem Summary

The bundled `hlx-cli` skill (`skill-content/`) has accumulated documentation drift and lacks CI enforcement. `SKILL.md` uses a flat 5-section layout instead of the required 10-section progressive-disclosure format; `commands.md` is missing significant CLI surface coverage (flags, subcommands, enum values); install/update documentation does not reflect the post-PR-86 GitHub-release-asset flow; three required reference documents (`recovery.md`, `ticket-prompting.md`, `current-state.md`) do not exist; and no CI workflow enforces that skill documentation stays in sync with the CLI binary's actual surface.

## Root Cause Analysis

This is a compound documentation/CI gap with five distinct causes:

1. **SKILL.md layout never restructured.** The file was created with a flat 5-section layout (Guardrails, Environment Setup, Available Commands, Common Workflows, Flag Conventions at 196 lines). The ticket requires 10 sections in a specific order using progressive disclosure. The frontmatter `description` is 149 chars and lacks trigger keywords for ticket-writing, org switching, and broken-install recovery.

2. **PR #86 update migration not reflected in docs.** `src/update/check.ts` fetches the `latest` GitHub release from `Project-X-Innovation/helix-cli`, `src/update/perform.ts` implements a staged download→extract→validate→swap pipeline to `~/.hlx/staging/`, and `src/update/validate.ts` checks `dist/index.js` existence and `--version` output. None of this is documented in the skill. There is no install/update section in SKILL.md and no `recovery.md` reference document.

3. **commands.md accumulated coverage gaps.** As the CLI grew, `commands.md` (127 lines) was not updated to match. Missing coverage includes: `tickets list` full flags (`--search`, `--user`, `--status`, `--status-not-in`, `--archived`, `--sprint`, `--json`), `tickets latest` flags, `update-description` subcommand entirely, `--mode` enum values (`AUTO|BUILD|FIX|RESEARCH|EXECUTE`), `--rating` enum values and aliases (`thumbs-up`/`up`, `thumbs-down`/`down`, `love`), `artifact` subcommand flags (`--step`, `--repo`, `--run`), `bundle --run` flag, and `tickets get --json`.

4. **No CI sync enforcement.** No `.github/workflows/skill-sync.yml` exists. No `scripts/` directory exists. No mechanism prevents a PR from changing CLI flags or subcommands without updating skill docs. This allows silent drift.

5. **Missing reference documents.** `skill-content/references/` contains only `commands.md`. The required `ticket-prompting.md` (7-section ticket-authoring guide), `recovery.md` (install/update/recovery flow), and `current-state.md` (dated migration notes) do not exist.

**No code changes are needed.** The skill install mechanism (`src/skill/install.ts` line 58: `readdirSync(refsDir)`) automatically copies all files in `references/` — new files will be included without modifying install logic. The `build-release.yml` tarball already includes `skill-content/` (line 37-43). The CLI binary, auth, `src/update/**`, and `publish.yml` must not be modified.

## Evidence Summary

| Evidence Point | Source | Finding |
|---|---|---|
| SKILL.md flat layout | `skill-content/SKILL.md` lines 1-196 | 5 sections; 149-char description; no install/update section; no progressive disclosure |
| commands.md gaps | `skill-content/references/commands.md` (127 lines) vs `src/tickets/index.ts` lines 17-32 | Missing ~15 flags, 1 entire subcommand (update-description), all enum values |
| Update pipeline | `src/update/check.ts`, `src/update/perform.ts`, `src/update/validate.ts` | Full GitHub-release-asset flow implemented; not documented in skill |
| Recovery message | `src/update/index.ts` lines 107-112 | Recovery points to `hlx update` and GitHub releases page |
| Install auto-inclusion | `src/skill/install.ts` lines 54-60 | `readdirSync` on references/ means new files are auto-included |
| No CI or templates | `ls .github/workflows/`, `ls .github/` | Only `build-release.yml` and `publish.yml`; no PR template; no `scripts/` |
| Help text format | `src/index.ts:35-63`, `src/tickets/index.ts:17-32` | Consistent `Usage:` prefix format across all commands; parseable for CI sync |
| CLI surface depth | `src/index.ts`, `src/tickets/index.ts`, `src/library/index.ts`, `src/library/comments.ts` | Max 3 levels: hlx → library → comments → list/post |
| Build pipeline | `package.json` line 19 | `prepare: npm run build` means `npm ci` triggers tsc automatically |
| --description gotcha | `src/tickets/create.ts` lines 48-58 | If `--description` value resolves to a readable file path, CLI errors |
| 10k-char cap | Not found in client code | Server-enforced; document per ticket requirements |

## Success Criteria

1. `SKILL.md` rewritten with 10 sections in prescribed order; frontmatter `description` ≤1024 chars with dual CLI-ops/ticket-writing triggers; body ≤5,000 tokens.
2. `references/commands.md` expanded to cover every subcommand and long-form flag. Verified by CI.
3. `references/ticket-prompting.md` created with all 7 sections using hard-constraint language patterns.
4. `references/recovery.md` created documenting GitHub-release-asset flow. No npm install/uninstall/link recommendations.
5. `references/current-state.md` created with dated PR #86 migration note.
6. `.github/workflows/skill-sync.yml` created; runs on `pull_request` and `push: main`; exits non-zero on missing CLI surface tokens.
7. `scripts/skill-sync/` created with parser script that recursively walks `--help` output and checks token coverage.
8. `.github/pull_request_template.md` created with skill-update checkbox.
9. Negative test: removing a flag mention from `commands.md` fails the CI sync check.
10. `hlx skill show` and `hlx skill install` continue to work unchanged after build.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|---|---|---|
| ticket.md | Full ticket requirements and acceptance criteria | 7-item required behavior spec; 10-section SKILL.md structure; CI must exit non-zero on gaps |
| scout/reference-map.json | Map of all relevant files with analysis | 34 files identified; all critical flags/subcommands cataloged per source file; 5 unknowns documented |
| scout/scout-summary.md | Synthesized current-vs-target gap analysis | Confirmed flat SKILL.md, commands.md gaps, missing reference docs, no CI enforcement |
| skill-content/SKILL.md | Primary file to restructure | 196 lines, flat 5-section layout, 149-char description lacking trigger keywords |
| skill-content/references/commands.md | Command reference with coverage gaps | 127 lines; missing ~15 flags, update-description subcommand, all enum values |
| src/index.ts | CLI entry point and top-level command router | 10 top-level commands; consistent help text format; auto-update skip list |
| src/tickets/index.ts | Tickets subcommand router with all flags | 10 subcommands; full usage text shows all flags for CI parsing |
| src/tickets/create.ts | --description gotcha and VALID_MODES enum | File-path detection on --description value; VALID_MODES=['AUTO','BUILD','FIX','RESEARCH','EXECUTE'] |
| src/tickets/list.ts | List command flags | 7 flags (--search, --user, --status, --status-not-in, --archived, --sprint, --json) all missing from commands.md |
| src/update/index.ts | Update command handler with recovery message | Recovery message points to hlx update and GitHub releases page |
| src/update/check.ts | Release checking mechanism | CANONICAL_REPO constant; GitHub API for latest release; auth token discovery |
| src/update/perform.ts | Staged update pipeline | Download→extract→validate→swap at ~/.hlx/staging/ with .bak rollback |
| src/update/validate.ts | Staged validation checks | Checks dist/index.js, package.json, runs --version with HLX_SKIP_UPDATE_CHECK=1 |
| src/skill/install.ts | Skill install behavior | readdirSync on references/ auto-includes new files; --target/--for/--force flags |
| .github/workflows/build-release.yml | Build and release pipeline | Tarball includes skill-content/; npm ci + npm test; Node 22 |
| package.json | Build toolchain and scripts | prepare=build=tsc; test=tsc+node --test; Node >=18; ESM module type |
