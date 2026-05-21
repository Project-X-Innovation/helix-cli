# Verification Actual: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Outcome

**implementation_wrong**

The implementation is partially complete. The CI/scripting infrastructure (parser script, CI workflow, PR template) is present and correct. However, the core documentation files in `skill-content/` are missing or have their old (pre-implementation) content. Specifically:

- `skill-content/SKILL.md` — has OLD content (195 lines, flat 5-section layout) instead of the new 10-section progressive-disclosure format (expected ~83 lines)
- `skill-content/references/commands.md` — has OLD content (126 lines) instead of the expanded full CLI surface reference (expected ~387 lines)
- `skill-content/references/current-state.md` — MISSING (expected: new file with dated PR #86 migration note)
- `skill-content/references/recovery.md` — MISSING (expected: new file documenting GitHub-release-asset flow)
- `skill-content/references/ticket-prompting.md` — MISSING (expected: new file with 7-section ticket-authoring guide)

The documentation files are the primary deliverable of this ticket. Without them, 8 of 13 required checks fail.

## Cascade Results

### Layer 1: Plan Adherence — FAIL

| Check ID | Status | Evidence |
|----------|--------|----------|
| CHK-01 | pass | `npm run build` exits 0; `dist/` populated with compiled JS |
| CHK-02 | pass | `npm run typecheck` (`tsc --noEmit`) exits 0; no type errors |
| CHK-03 | pass | `npm test` exits 0; 63/63 tests pass (22 suites, 0 fail) |
| CHK-04 | **fail** | SKILL.md has old 149-char description ("Operational guidance for AI agents..."), not the new 481-char trigger-heavy description. Sections are: Guardrails, Environment Setup, Available Commands, Common Workflows, Flag Conventions (old 5-section flat format, not the prescribed 10-section progressive-disclosure format). |
| CHK-05 | **fail** | `node scripts/skill-sync/check-coverage.mjs` exits 1 with 18 missing tokens: `--archived`, `--description-file`, `--dry-run`, `--file`, `--mode`, `--run`, `--search`, `--sprint`, `--status`, `--status-not-in`, `--text`, `--user`, `AUTO`, `BUILD`, `EXECUTE`, `FIX`, `RESEARCH`, `update-description`. These tokens are absent from the old commands.md. |
| CHK-06 | **fail** | Cannot perform negative test because the baseline (CHK-05) already fails. The parser exits 1 with the current docs even without removing `--search`. |
| CHK-07 | **fail** | `hlx skill show` outputs the old SKILL.md content (description: "Operational guidance for AI agents...", flat format). Not the new progressive-disclosure format. |
| CHK-08 | **fail** | `hlx skill install --target <tmpdir> --force` copies only `SKILL.md` and `references/commands.md`. The 3 new reference files (current-state.md, recovery.md, ticket-prompting.md) are absent because they don't exist in `skill-content/references/`. |
| CHK-09 | **fail** | `recovery.md` does not exist; cannot verify no-npm-recommendation constraint. SKILL.md exists but has old content (old SKILL.md does not contain npm install/uninstall/link, but this is the old file, not the new one). |
| CHK-10 | pass | `.github/workflows/skill-sync.yml` has `on: { pull_request: {}, push: { branches: [main] } }`. Uses Node 22, `npm ci`, runs `check-coverage.mjs`. |
| CHK-11 | pass | `.github/pull_request_template.md` contains "If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md." |
| CHK-12 | **fail** | `skill-content/references/ticket-prompting.md` does not exist. File not found anywhere in the repository tree. |
| CHK-13 | **fail** | SKILL.md body has 5 `##` headings (Guardrails, Environment Setup, Available Commands, Common Workflows, Flag Conventions). Expected 9 `##` headings in order: Workflow, Guardrails, Commands at a glance, Ticket work -- gotchas, Artifact workflow, Inspection, Writing tickets, Install and update, Source of truth. |

**Result: 5 pass, 8 fail. Layer 1 FAILED.**

### Layer 2: Technical Validation — SKIPPED (early exit)

Not executed due to Layer 1 failure.

### Layer 3: Scenario Acceptance — SKIPPED (early exit)

Not executed due to Layer 1 failure.

## Steps Taken

1. [CHK-01] Ran `npm run build` in helix-cli root. Exit code 0. `dist/` populated.
2. [CHK-02] Ran `npm run typecheck` in helix-cli root. Exit code 0. No type errors.
3. [CHK-03] Ran `npm test` in helix-cli root. 63/63 tests pass, 0 fail, 0 skipped.
4. [CHK-04] Read `skill-content/SKILL.md` and inspected frontmatter. Found `name: hlx-cli` (correct) but description is the old 149-char version, not the new 481-char trigger-heavy description. Body has 5 old sections instead of 9 new sections.
5. [CHK-05] Ran `node scripts/skill-sync/check-coverage.mjs`. Exit code 1 with 18 missing tokens. The old commands.md (126 lines) does not contain the expanded flag/subcommand coverage.
6. [CHK-06] Skipped — cannot perform negative test when baseline (CHK-05) already fails.
7. [CHK-07] Ran `HLX_SKIP_UPDATE_CHECK=1 node dist/index.js skill show`. Output shows old SKILL.md content.
8. [CHK-08] Ran `node dist/index.js skill install --target <tmpdir> --force`. Only `SKILL.md` and `references/commands.md` were copied. The 3 new reference files do not exist.
9. [CHK-09] Checked for existence of `recovery.md` — file not found. Cannot verify no-npm constraint.
10. [CHK-10] Read `.github/workflows/skill-sync.yml`. Confirmed triggers: `pull_request`, `push: branches: [main]`. Uses Node 22, `npm ci`, runs `check-coverage.mjs`.
11. [CHK-11] Read `.github/pull_request_template.md`. Contains skill-update checkbox text.
12. [CHK-12] Checked for `ticket-prompting.md` — file not found. Searched entire repo tree with `find` — no matches.
13. [CHK-13] Extracted `## ` headings from SKILL.md. Found 5 old headings, not 9 new headings.
14. Verified `scripts/skill-sync/check-coverage.mjs` exists and has correct content (262 lines, recursive --help walker, correct exit codes).
15. Verified `.github/workflows/skill-sync.yml` exists with correct triggers and job steps.
16. Verified `.github/pull_request_template.md` exists with correct checkbox.

## Findings

### What is correct (3 of 8 implementation files)

1. **`scripts/skill-sync/check-coverage.mjs`** (262 lines) — Present and functional. Recursively discovers 75 CLI tokens (29 subcommands, 39 flags, 7 enums) from `--help` output. Correctly reports 18 missing tokens against the old docs. Exit codes work as specified (0/1/2).

2. **`.github/workflows/skill-sync.yml`** (22 lines) — Present with correct triggers (`pull_request`, `push: branches: [main]`). Uses Node 22, `npm ci`, and runs the parser script.

3. **`.github/pull_request_template.md`** (7 lines) — Present with the required skill-update checkbox.

### What is wrong (5 of 8 implementation files)

1. **`skill-content/SKILL.md`** — Contains the OLD pre-implementation content (195 lines, flat 5-section layout with old 149-char description). The implementation was supposed to rewrite this to a 10-section progressive-disclosure format (~83 lines) with a 481-char trigger-heavy description.

2. **`skill-content/references/commands.md`** — Contains the OLD pre-implementation content (126 lines). The implementation was supposed to expand this to ~387 lines with full CLI surface coverage including all missing flags, enum values, and the `update-description` subcommand.

3. **`skill-content/references/current-state.md`** — File does not exist. The implementation was supposed to create this as a new file with a dated (2026-05-21) migration note citing PR #86.

4. **`skill-content/references/recovery.md`** — File does not exist. The implementation was supposed to create this as a new file documenting the GitHub-release-asset install/update/recovery flow.

5. **`skill-content/references/ticket-prompting.md`** — File does not exist. The implementation was supposed to create this as a new file with a 7-section ticket-authoring guide using hard-constraint language.

### Impact

- The CI parser (`check-coverage.mjs`) correctly detects 18 missing tokens, meaning if this branch is merged, the `skill-sync` CI workflow will fail on every subsequent PR.
- The `hlx skill show` and `hlx skill install` commands output/install the old documentation, defeating the purpose of the ticket.
- None of the 10 user scenarios (SCN-01 through SCN-10) can be satisfied with the current file state.

## Remediation Guidance

The implementation agent needs to re-apply the documentation changes to the 5 missing/wrong files in `skill-content/`:

1. **Rewrite `skill-content/SKILL.md`** to the 10-section progressive-disclosure format with the trigger-heavy description (<=1024 chars) as specified in the implementation plan Step 5.

2. **Expand `skill-content/references/commands.md`** to cover all subcommands, long-form flags, and enum values as specified in implementation plan Step 4. The current file is missing 18 tokens that the parser detects.

3. **Create `skill-content/references/current-state.md`** with a dated migration note per Step 1.

4. **Create `skill-content/references/recovery.md`** documenting the GitHub-release-asset flow per Step 2.

5. **Create `skill-content/references/ticket-prompting.md`** with 7 sections per Step 3.

After writing all files, run `node scripts/skill-sync/check-coverage.mjs` to verify the parser exits 0 (all 75 tokens covered).

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Primary requirements source | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail; no npm recommendations |
| `implementation-plan/implementation-plan.md` | Verification plan with 13 required checks | CHK-01 through CHK-13 define what to verify; 9 steps define file deliverables |
| `implementation/implementation-actual.md` | Context for what implementation agent claimed | Claims all 8 files written, 75 tokens covered, 63 tests pass — 5 of 8 files not present in current state |
| `code-review/code-review-actual.md` | Code review findings | Claimed no issues found; no code fixes applied; all 13 checks pass — contradicted by current file state |
| `product/product.md` | Product scenarios | 10 user scenarios (SCN-01 through SCN-10); none can be satisfied without correct skill-content files |
| `tech-research/tech-research.md` | Technical decisions and architecture | Parser is plain .mjs ESM; recursive --help strategy; token types; exit code semantics |
