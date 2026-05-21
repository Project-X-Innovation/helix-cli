# Product: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Problem Statement

AI agents (Claude, Codex) that consume the bundled `hlx-cli` skill receive stale, flat documentation that does not match the CLI's actual surface. Specifically:

- **SKILL.md is flat and incomplete.** It has 5 generic sections instead of the 10-section progressive-disclosure format that front-loads the most common agent workflows. The frontmatter description (149 chars) omits trigger keywords for ticket-writing, org switching, and install recovery, reducing agent activation accuracy.
- **commands.md has ~15 missing flags and an entire missing subcommand** (`update-description`), plus missing enum values for `--mode` and `--rating`. Agents that rely on it will produce incorrect or incomplete CLI invocations.
- **Install/update docs are stale.** PR #86 migrated the update mechanism from npm to GitHub release assets, but neither SKILL.md nor any reference doc reflects this. Agents cannot guide users through recovery from a broken install.
- **No ticket-prompting reference exists.** Agents authoring Helix tickets lack a bundled guide for constraint language, required sections, and failure-mode avoidance.
- **No CI enforcement.** CLI surface changes (new flags, subcommands, renamed options) silently drift out of sync with skill docs because no automated check exists.

## Product Vision

The bundled skill becomes a reliable, self-maintaining contract between the CLI binary and the AI agents that operate it. Progressive disclosure lets agents find the right command fast; CI sync ensures the docs never fall behind the binary; and reference documents cover the operational gotchas and ticket-writing patterns proven in practice.

## Users

| User | Interaction |
|------|-------------|
| **AI agents (Claude, Codex)** | Primary consumers. Read the skill to discover commands, flags, gotchas, and ticket-writing guidance during agentic workflows. |
| **CLI contributors** | Receive CI feedback when a PR changes CLI surface without updating skill docs. Consult the PR template checkbox as a reminder. |
| **End users** | Consult the skill (via `hlx skill show` or installed copy) for install/update/recovery guidance and operational gotchas. |

## Use Cases

1. **Agent discovers commands.** An agent reads SKILL.md to find the right `hlx` subcommand and flags for a user's request.
2. **Agent writes a ticket.** An agent follows the ticket-prompting reference to draft a well-constrained Helix ticket.
3. **Agent recovers a broken install.** An agent reads the recovery reference to guide a user through diagnosing and fixing a broken `hlx` binary.
4. **Contributor changes CLI surface.** A developer adds a new flag; CI detects the skill docs lack coverage and fails the PR.
5. **Agent handles ticket gotchas.** An agent reads the gotchas section to avoid the `--description` file-path trap, the 10k-char cap, and `--mode RESEARCH` boilerplate.

## Core Workflow

1. Agent activation: agent matches trigger keywords in the YAML `description` field.
2. Progressive reading: agent reads the concise SKILL.md body (<= 5,000 tokens) for workflow guidance, guardrails, and a command overview.
3. Deep dive: agent follows links to `references/commands.md` for full flag details, `references/ticket-prompting.md` for ticket authoring, or `references/recovery.md` for install/update recovery.
4. CI enforcement: on every PR and push to main, the skill-sync workflow builds the CLI, walks `--help` recursively, and asserts every parsed token appears in SKILL.md or commands.md. Missing tokens fail the build.

## Essential Features (MVP)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **SKILL.md rewrite** (10 sections, progressive disclosure, trigger-heavy description <= 1024 chars, body <= 5,000 tokens) | Agents activate more reliably and read relevant content faster. |
| 2 | **commands.md expansion** (every subcommand, every long-form flag, all enum values) | Agents produce correct CLI invocations for the full surface. |
| 3 | **ticket-prompting.md** (7 sections with hard-constraint language) | Agents author well-structured tickets that avoid common failure modes. |
| 4 | **recovery.md** (GitHub-release-asset flow, no npm recommendations) | Agents and users can diagnose and fix broken installs without out-of-date npm steps. |
| 5 | **current-state.md update** (dated PR #86 migration note) | Provides a changelog anchor for the npm-to-release-asset migration. |
| 6 | **skill-sync CI workflow** (`skill-sync.yml` + `scripts/skill-sync/` parser) | Prevents future CLI-surface drift by failing PRs with missing doc coverage. |
| 7 | **PR template checkbox** (skill-update reminder in `.github/pull_request_template.md`) | Lightweight contributor nudge before CI catches gaps. |

## Features Explicitly Out of Scope (MVP)

- Modifying CLI binary behavior, flags, auth, or `src/update/**`.
- Modifying `publish.yml` or `build-release.yml`.
- Moving or renaming `skill-content/`, `SKILL.md`, or changing `name: hlx-cli`.
- Changing `hlx skill show` / `hlx skill install` behavior or flags.
- Recommending `npm install -g`, `npm uninstall -g`, or `npm link` as install/update actions.
- Adding a soft/warning-only CI mode (must be hard failure).
- Token-counting tooling for SKILL.md body length enforcement (manual verification at authoring time; the 5,000-token budget is a writing constraint, not a runtime check).

## Success Criteria

1. `SKILL.md` frontmatter has `name: hlx-cli` and `description` <= 1024 chars with triggers for both CLI-ops and ticket-writing; body <= 5,000 tokens; contains the 10 prescribed sections in order.
2. `references/commands.md` covers every subcommand and long-form flag from `hlx --help` and each `hlx <subcommand> --help`, verified by the new CI job.
3. `references/ticket-prompting.md` exists with all 7 prescribed sections using hard-constraint language.
4. `references/recovery.md` documents the GitHub-release-asset flow with no npm install/uninstall/link recommendations.
5. `references/current-state.md` includes a dated note citing PR #86.
6. `.github/workflows/skill-sync.yml` runs on `pull_request` and `push: main`, exiting non-zero on missing CLI surface tokens.
7. `.github/pull_request_template.md` includes the skill-update checkbox.
8. Negative test: removing a flag mention from `commands.md` causes the CI sync check to fail.
9. `hlx skill show` emits the new SKILL.md unchanged after build; `hlx skill install` continues to copy all of `skill-content/` including new reference files.

## User Scenarios

[SCN-01] Agent discovers the right command for a ticket operation
- Precondition: Agent has the hlx-cli skill loaded and a user requests a ticket-related CLI action.
- Action: Agent reads SKILL.md's "Commands at a glance" table and follows the link to commands.md for full flag details.
- Expected Outcome: Agent finds the correct subcommand, all available flags, and enum values, and produces a valid CLI invocation.

[SCN-02] Agent avoids the --description file-path gotcha
- Precondition: Agent needs to create a ticket with a description that happens to match a readable file path.
- Action: Agent reads the "Ticket work -- gotchas" section of SKILL.md before constructing the command.
- Expected Outcome: Agent uses `--description-file` instead of `--description` when the value is a file path, avoiding the CLI error.

[SCN-03] Agent writes a well-structured Helix ticket
- Precondition: Agent is asked to draft a new Helix ticket.
- Action: Agent reads `references/ticket-prompting.md` for the required ticket structure, constraint language, and common failure modes.
- Expected Outcome: Agent produces a ticket with all required sections, hard-constraint language, and no open-questions section.

[SCN-04] Agent guides user through broken-install recovery
- Precondition: User reports `hlx` is broken or not responding after an interrupted update.
- Action: Agent reads `references/recovery.md` for the GitHub-release-asset recovery flow.
- Expected Outcome: Agent provides step-by-step recovery instructions using `hlx update` or manual GitHub release download, without recommending npm commands.

[SCN-05] Contributor adds a new CLI flag and forgets to update docs
- Precondition: A developer adds a new `--verbose` flag to `hlx tickets list` and opens a PR.
- Action: The skill-sync CI workflow builds the CLI, parses `--help` output, and checks token coverage in SKILL.md and commands.md.
- Expected Outcome: CI fails with a clear message listing `--verbose` as a missing token, blocking the PR until docs are updated.

[SCN-06] Agent activates the skill from trigger keywords
- Precondition: Agent receives a user request mentioning "hlx tickets", "HELIX_API_KEY", "org switch", or "broken hlx install".
- Action: Agent's skill-matching system compares the request against the YAML `description` field in SKILL.md frontmatter.
- Expected Outcome: The trigger-heavy description matches and the agent loads the skill, regardless of whether the request is about CLI operations or ticket writing.

[SCN-07] Agent handles RESEARCH mode ticket creation
- Precondition: Agent needs to create a ticket with `--mode RESEARCH`.
- Action: Agent reads the "Ticket work -- gotchas" section for RESEARCH mode guidance.
- Expected Outcome: Agent drops implementation-shaped sections and skips "research only" boilerplate in the ticket description.

[SCN-08] Contributor uses PR template as doc-update reminder
- Precondition: A contributor opens a PR that changes CLI behavior.
- Action: Contributor sees the skill-update checkbox in the PR template.
- Expected Outcome: Contributor is reminded to update SKILL.md or commands.md before CI runs, reducing failed-then-fixed round-trips.

[SCN-09] Agent reads install instructions for a new user
- Precondition: A user asks how to install `hlx` for the first time.
- Action: Agent reads the "Install and update" section of SKILL.md.
- Expected Outcome: Agent provides instructions using the GitHub release asset download flow, not npm install.

[SCN-10] Skill install copies new reference files automatically
- Precondition: A user runs `hlx skill install` after updating to the new version.
- Action: The install command copies SKILL.md and all files in `references/` to the target directory.
- Expected Outcome: All new reference files (ticket-prompting.md, recovery.md, current-state.md) are copied alongside the existing commands.md without any code changes to the install logic.

## Key Design Principles

- **Progressive disclosure.** SKILL.md body stays concise (<= 5,000 tokens). Detailed content lives in linked reference files.
- **Trigger-heavy description.** The YAML `description` field front-loads keywords that match both CLI-operations and ticket-writing agent requests.
- **Hard enforcement.** CI sync is a hard failure, not a warning. Missing coverage blocks the PR.
- **Document-only changes.** No CLI binary behavior is modified. The skill install mechanism auto-discovers new reference files.
- **Single source of truth.** CLI `--help` output is the canonical surface. The CI sync script derives tokens from it and checks docs against it.

## Scope & Constraints

- **Token budget:** SKILL.md body (post-frontmatter) must be <= 5,000 tokens; description <= 1024 chars.
- **Section order:** SKILL.md must contain 10 sections in the prescribed order.
- **Language patterns:** ticket-prompting.md must use hard constraints (`must`, `must not`, `do not`) and avoid soft language (`should`, `ideally`, `as needed`) for invariants.
- **No npm recommendations:** recovery.md and all install/update guidance must reference GitHub release assets only.
- **Existing file preserved:** `references/commands.md` is expanded, not deleted.
- **Name immutable:** `name: hlx-cli` in frontmatter must not change.
- **CI runs on:** `pull_request` and `push: main`.
- **Parser script location:** `scripts/skill-sync/`.

## Future Considerations

- Automated token counting in CI to enforce the 5,000-token SKILL.md body budget.
- Extending skill-sync to validate that reference doc links in SKILL.md are not broken.
- Adding a skill-content linting step for YAML frontmatter schema validation.

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|----------------|--------|
| 1 | The 10,000-char description cap for `tickets create` is not enforced client-side (not found in `src/tickets/create.ts`). It appears to be server-enforced. | Document per ticket requirements but note the cap is not client-validated. Agents relying on this limit may hit unexpected server errors if the cap changes. |
| 2 | The 5,000-token body budget for SKILL.md cannot be verified by CI without a tokenizer. | Token count is a writing constraint verified manually at authoring time. Consider adding automated token counting in a future iteration. |
| 3 | PR #36 (`PREVIEW_READY` fix) and PR #86 (release-asset migration) are referenced in the ticket but full PR descriptions are not accessible from repo state alone. | Content for these references must rely on the ticket description and current code behavior rather than PR metadata. |
| 4 | The CI `--help` parser must handle arbitrary nesting depth. Current max is 3 levels (`hlx -> library -> comments -> list/post`). | Parser script must be recursive without a hard depth limit, but testing is practical only up to current max depth. |
| 5 | The CI workflow should match the Node version used in `build-release.yml` (Node 22) for consistency, but this is not explicitly required by the ticket. | Minor risk of version-specific behavior differences if versions diverge. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Full ticket requirements, acceptance criteria, and non-negotiable invariants | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail on gaps; no npm recommendations |
| `scout/scout-summary.md` | Synthesized current-vs-target gap analysis | SKILL.md is flat (5 sections, 196 lines); commands.md has ~15 missing flags; no CI, PR template, or scripts/ directory |
| `scout/reference-map.json` | Detailed file map with all CLI surface tokens cataloged | 34 relevant files identified; all flag/subcommand gaps enumerated per source file; 5 unknowns |
| `diagnosis/diagnosis-statement.md` | Root cause analysis and success criteria | Compound 5-cause gap (flat layout, stale update docs, commands.md gaps, no CI, missing reference docs); all doc-only changes |
| `diagnosis/apl.json` | Structured diagnostic answers with evidence | Confirmed: install auto-includes new reference files via readdirSync; no conflicts with existing workflows/templates; help text is parseable |
| `repo-guidance.json` | Repo intent metadata | helix-cli is the sole target repo; no cross-repo impact |
