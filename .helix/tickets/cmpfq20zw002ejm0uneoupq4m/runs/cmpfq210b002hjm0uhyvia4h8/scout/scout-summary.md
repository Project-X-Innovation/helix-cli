# Scout Summary

## Problem

The bundled `skill-content/` skill for `hlx-cli` needs restructuring: its `SKILL.md` is flat (5 sections) instead of progressive-disclosure (10 required sections), `references/commands.md` has significant flag and subcommand coverage gaps, install/update docs are stale (still referencing npm-era flow), and three new reference documents plus a CI enforcement workflow are missing. No CI check currently prevents CLI surface changes from drifting out of sync with skill documentation.

## Analysis Summary

### Current State of skill-content/

- **SKILL.md** (196 lines): has `name: hlx-cli` frontmatter with a 149-char description. Body has 5 flat sections (Guardrails, Environment Setup, Available Commands, Common Workflows, Flag Conventions). Ticket requires 10 sections in a specific order with progressive disclosure.
- **references/commands.md** (127 lines): covers login, token add, org, tickets (partial), inspect, comments, update, skill, --version. Significant gaps:
  - Missing `tickets list` full flags (`--search`, `--user`, `--status`, `--status-not-in`, `--archived`, `--sprint`, `--json`)
  - Missing `tickets latest` flags (`--status-not-in`, `--archived`, `--sprint`)
  - Missing `update-description` subcommand entirely
  - Missing `--mode` enum values (`AUTO|BUILD|FIX|RESEARCH|EXECUTE`) in create section
  - Missing `--rating` enum values and aliases in library section
  - Missing `library` family detail (`--section`, `--rating`, `--reply-to`, section-slug-or-heading-text auto-slugify)
  - Missing `artifact` subcommand flags (`--step`, `--repo`, `--run`)
  - Missing `bundle --run` flag
- **Does NOT exist**: `current-state.md`, `recovery.md`, `ticket-prompting.md`

### CLI Surface (from source code)

9 top-level commands with 30+ subcommands total. Manual flag parsing (no yargs/commander). Key sources of truth are the usage() functions and help text in each command's index.ts.

### Update Flow (post-PR-86)

GitHub API fetches `latest` release from `Project-X-Innovation/helix-cli`. Downloads `helix-cli.tgz` asset to `~/.hlx/staging/{sha}/`. In-process tar/gzip extraction (no external binary). Validates staged candidate (`dist/index.js` exists, `node --version` succeeds). Atomic rename-based swap with `.bak` rollback. Recovery: `hlx update` or manual download from GitHub releases page.

### CI and Workflow Gaps

- No `skill-sync.yml` workflow exists
- No `scripts/` directory exists at repo root
- No `.github/pull_request_template.md` exists
- Existing workflows: `build-release.yml` (push to main -> latest release), `publish.yml` (v* tags -> npm)

### Skill Install Behavior (must remain unchanged)

`cmdInstall` in `src/skill/install.ts` copies `SKILL.md` and iterates `references/` via `readdirSync`. Adding new files to `references/` (recovery.md, ticket-prompting.md, current-state.md) will be automatically picked up by the install logic without code changes.

## Relevant Files

| File | Role |
|------|------|
| `skill-content/SKILL.md` | Primary file to restructure (rewrite) |
| `skill-content/references/commands.md` | Command reference to expand (rewrite) |
| `skill-content/references/current-state.md` | New file: dated migration note |
| `skill-content/references/ticket-prompting.md` | New file: 7-section ticket-authoring guide |
| `skill-content/references/recovery.md` | New file: install/update/recovery docs |
| `.github/workflows/skill-sync.yml` | New file: CI surface coverage check |
| `.github/pull_request_template.md` | New file: PR template with skill-update checkbox |
| `scripts/skill-sync/` | New directory: parser script for CI |
| `src/index.ts` | Source of truth: top-level commands and help text |
| `src/tickets/index.ts` | Source of truth: all tickets subcommands and flags |
| `src/tickets/create.ts` | Source of truth: --mode enums, --description gotcha |
| `src/tickets/update-description.ts` | Source of truth: --file/--text flags |
| `src/tickets/continue.ts` | Source of truth: --dry-run flag |
| `src/tickets/list.ts` | Source of truth: list flags (--search, --user, etc.) |
| `src/tickets/artifacts.ts` | Source of truth: --run flag, empty artifact behavior |
| `src/tickets/artifact.ts` | Source of truth: --step, --repo, --run flags |
| `src/tickets/bundle.ts` | Source of truth: --out, --run flags |
| `src/inspect/index.ts` | Source of truth: inspect subcommands, PowerShell quoting |
| `src/comments/index.ts` | Source of truth: comments subcommands and flags |
| `src/library/index.ts` | Source of truth: library subcommands |
| `src/library/comments.ts` | Source of truth: library comments subcommands |
| `src/library/comments-post.ts` | Source of truth: RATING_MAP, --reply-to, auto-slugify |
| `src/login.ts` | Source of truth: --manual flag |
| `src/org/index.ts` | Source of truth: org subcommands |
| `src/token/index.ts` | Source of truth: token add flags |
| `src/update/index.ts` | Source of truth: update flags, recovery message |
| `src/update/check.ts` | Source of truth: CANONICAL_REPO, release fetching |
| `src/update/perform.ts` | Source of truth: staged update pipeline, swap/rollback |
| `src/update/validate.ts` | Source of truth: staged validation checks |
| `src/skill/install.ts` | Must-not-change: install behavior, references/ copy logic |
| `src/skill/skill.test.ts` | Existing tests: byte-for-byte copy validation |
| `.github/workflows/build-release.yml` | Tarball contents: dist/, skill-content/, package.json |
| `.github/workflows/publish.yml` | Must-not-change: npm publish workflow |
| `package.json` | Build/test scripts: tsc, node --test |
| `tsconfig.json` | Compiler config: outDir=dist, rootDir=src, ES2022, Node16 |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket requirements and acceptance criteria | Detailed 7-item required behavior spec with 10-section SKILL.md structure, CI workflow requirements, and non-negotiable invariants |
| skill-content/SKILL.md | Current state of primary file to restructure | 196-line flat layout with 5 sections; frontmatter description is 149 chars; needs complete rewrite to 10-section progressive-disclosure format |
| skill-content/references/commands.md | Current state of command reference | 127 lines with significant flag coverage gaps; needs expansion to cover all subcommands and flags |
| src/index.ts | CLI entry point and top-level router | 10 top-level commands; usage() text is canonical help; auto-update skip list for --version, update, skill, help |
| src/tickets/index.ts | Tickets command router | 10 subcommands including update-description (missing from commands.md); canonical usage text with all flags |
| src/tickets/create.ts | Ticket creation implementation | --description file-path detection gotcha; VALID_MODES enum; relationship flags --after, --reference, --implement-from |
| src/tickets/continue.ts | Continue command implementation | --dry-run flag; continuation context as required positional arg |
| src/tickets/update-description.ts | Update description implementation | --file and --text mutually exclusive flags |
| src/tickets/list.ts | List command implementation | 7 flags (--search, --user, --status, --status-not-in, --archived, --sprint, --json) missing from commands.md |
| src/library/comments-post.ts | Rating enum and slug behavior | RATING_MAP with 5 entries (thumbs-up, up, thumbs-down, down, love); auto-slugify; --reply-to makes --rating optional |
| src/update/index.ts | Update command and auto-update | Recovery message pattern; --enable-auto/--disable-auto flags; GitHub release asset flow |
| src/update/check.ts | Release checking | CANONICAL_REPO constant; GitHub API endpoint for latest release; auth token discovery |
| src/update/perform.ts | Staged update pipeline | Full download-extract-validate-swap-rollback flow; staging at ~/.hlx/staging/; critical for recovery.md |
| src/update/validate.ts | Staged validation | Checks dist/index.js, package.json, runs --version; critical for recovery.md |
| src/skill/install.ts | Skill install behavior | readdirSync on references/ means new files are auto-included; --target/--for/--force flags |
| src/inspect/index.ts | Inspect command router | PowerShell quoting tips in help text; --repo, --query, --query-file, --limit flags |
| .github/workflows/build-release.yml | Build and release pipeline | Tarball includes skill-content/; triggers on push to main; npm ci + npm test pattern |
| .github/workflows/publish.yml | npm publish pipeline | Validates skill-content/SKILL.md in tarball; must not be modified |
| package.json | Build toolchain | scripts: build=tsc, test=tsc+node --test, prepare=npm run build; Node >=18 |
