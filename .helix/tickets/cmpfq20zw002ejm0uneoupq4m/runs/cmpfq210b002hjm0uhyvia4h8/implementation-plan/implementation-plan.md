# Implementation Plan: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Overview

This plan restructures the bundled `skill-content/` skill to follow progressive-disclosure best practices, refreshes documentation for the post-PR-86 GitHub-release-asset update flow, adds three new reference documents, creates a CI workflow that enforces CLI-surface coverage in skill docs, and adds a PR template checkbox. All changes are documentation, scripting, and CI — no CLI binary behavior is modified.

**Files to create/modify (8 total):**
- `skill-content/SKILL.md` — complete rewrite (10-section progressive disclosure)
- `skill-content/references/commands.md` — expand (full CLI surface coverage)
- `skill-content/references/current-state.md` — new file
- `skill-content/references/recovery.md` — new file
- `skill-content/references/ticket-prompting.md` — new file
- `scripts/skill-sync/check-coverage.mjs` — new file (parser script)
- `.github/workflows/skill-sync.yml` — new file (CI workflow)
- `.github/pull_request_template.md` — new file (PR template)

## Implementation Principles

- **Document-only changes.** Do not modify any CLI binary behavior, flags, auth, `src/update/**`, `publish.yml`, or `build-release.yml`.
- **Single source of truth.** All CLI surface tokens are derived from `--help` output. Documentation must match the binary.
- **Progressive disclosure.** SKILL.md body stays concise (<=5,000 tokens). Detailed content lives in linked reference files.
- **Hard enforcement.** CI sync is a hard failure (exit non-zero), not a warning.
- **Zero new dependencies.** Parser script uses only Node.js built-ins (`child_process`, `fs`, `path`).
- **Auto-discovery.** New reference files in `references/` are automatically included by `skill install` via its existing `readdirSync` logic (src/skill/install.ts line 58). No code changes needed.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Create dated migration note | `skill-content/references/current-state.md` |
| 2 | Document install/update/recovery flow | `skill-content/references/recovery.md` |
| 3 | Create ticket-authoring guide | `skill-content/references/ticket-prompting.md` |
| 4 | Expand command reference to full surface | `skill-content/references/commands.md` (rewrite) |
| 5 | Restructure SKILL.md with progressive disclosure | `skill-content/SKILL.md` (rewrite) |
| 6 | Create CI parser script | `scripts/skill-sync/check-coverage.mjs` |
| 7 | Create CI workflow | `.github/workflows/skill-sync.yml` |
| 8 | Create PR template | `.github/pull_request_template.md` |
| 9 | Build and end-to-end verification | Passing build + parser + skill show/install |

## Detailed Implementation Steps

### Step 1: Create `skill-content/references/current-state.md`

**Goal:** Provide a changelog anchor for the npm-to-release-asset migration.

**What to Build:**
- Create new file `skill-content/references/current-state.md`.
- Content: a dated note (today's date: 2026-05-21) marking the migration from npm self-update to GitHub-release-asset update flow, citing PR #86.
- Keep it short — this is a reference changelog, not a narrative.
- Must mention: `hlx update` now downloads from GitHub release assets instead of npm; see `references/recovery.md` for details.

**Verification (AI Agent Runs):**
```bash
test -f skill-content/references/current-state.md && echo "EXISTS" || echo "MISSING"
grep -c "PR #86\|PR-86\|#86" skill-content/references/current-state.md
grep -c "2026-05-21\|May.*2026" skill-content/references/current-state.md
```

**Success Criteria:**
- File exists at `skill-content/references/current-state.md`.
- Contains a dated entry referencing PR #86 and the migration from npm to GitHub release assets.

---

### Step 2: Create `skill-content/references/recovery.md`

**Goal:** Document the GitHub-release-asset install/update flow and broken-install recovery so agents and users can diagnose and fix problems.

**What to Build:**
- Create new file `skill-content/references/recovery.md`.
- Source of truth for content: `src/update/check.ts` (CANONICAL_REPO, GitHub API latest release), `src/update/perform.ts` (staged pipeline: download→extract→validate→swap at `~/.hlx/staging/`), `src/update/validate.ts` (checks `dist/index.js`, `package.json`, runs `--version`), `src/update/index.ts` lines 107-112 (recovery message).
- Required content sections:
  - How `hlx update` works: resolves `latest` release from `Project-X-Innovation/helix-cli` via GitHub API; downloads `helix-cli.tgz` asset; extracts in-process (no external tar binary); validates staged candidate; rename-based atomic swap with `.bak` rollback.
  - How to install from scratch: download tarball from GitHub releases page; extract; ensure `dist/index.js` exists.
  - How to recover a broken install: run `hlx update`; if that fails, manually download from GitHub releases; verify `dist/index.js` exists and `node dist/index.js --version` works.
  - Auth token discovery for GitHub: `GITHUB_TOKEN`, `GH_TOKEN`, or `gh` CLI (from `src/update/check.ts`).
- **Hard constraint:** `npm install -g @projectxinnovation/helix-cli@latest`, `npm uninstall -g`, and `npm link` must NOT appear as recommended actions anywhere in this file.

**Verification (AI Agent Runs):**
```bash
test -f skill-content/references/recovery.md && echo "EXISTS" || echo "MISSING"
# Must NOT contain npm install/uninstall/link recommendations
grep -c "npm install -g" skill-content/references/recovery.md && echo "FAIL: contains npm install -g" || echo "OK"
grep -c "npm uninstall -g" skill-content/references/recovery.md && echo "FAIL: contains npm uninstall -g" || echo "OK"
grep -c "npm link" skill-content/references/recovery.md && echo "FAIL: contains npm link" || echo "OK"
# Must contain key recovery concepts
grep -c "hlx update" skill-content/references/recovery.md
grep -c "GitHub" skill-content/references/recovery.md
```

**Success Criteria:**
- File exists and documents the GitHub-release-asset flow.
- Zero occurrences of `npm install -g`, `npm uninstall -g`, `npm link` as recommendations.
- Covers install, update mechanism, and broken-install recovery.

---

### Step 3: Create `skill-content/references/ticket-prompting.md`

**Goal:** Provide agents with a bundled ticket-authoring guide using hard-constraint language patterns.

**What to Build:**
- Create new file `skill-content/references/ticket-prompting.md`.
- Must contain exactly 7 sections in this order (per ticket Required Behavior item 3):
  1. **Core Rule** — what must/must not happen, scope boundaries, invariants, failure behavior, batch/cardinality semantics, source-of-truth files, already-decided tradeoffs. No `Open Questions` section.
  2. **Required Ticket Structure** — exactly these headers in order: `# Ticket: <title>`, `## Summary`, `## Why`, `## Decisions Already Made`, `## Do Not Re-Decide`, `## Non-Negotiable Invariants`, `## In Scope`, `## Out of Scope`, `## Required Behavior`, `## Failure Behavior`, `## Batch / Cardinality Rules`, `## Persistence / Artifact Rules`, `## Acceptance Criteria`.
  3. **How To Draft** — separate settled from open; turn fragile requirements into must/must not; forbid post-failure state transitions; state cardinality for multi-entity flows; name exact source-of-truth files; add negative acceptance criteria.
  4. **Common Failure Modes** — all five with one example each: scope expansion; over-optimization; fail-open; batch/cardinality; domain vocabulary drift.
  5. **Deployment / SDF Checklist** — canonical files as source of truth; copy `src/deploy.xml` verbatim; missing baseline and dirty tree are hard failures; production deploys use exact stored metadata; multi-ticket deploys need per-ticket manifests; failed deploys write failure artifacts.
  6. **Good / Bad Prompt Patterns** — good examples: `Do not redesign this flow.`, `Copy the canonical file verbatim.`, `Fail closed: if the baseline is missing, abort.` Bad examples: `Implement this however makes the most sense.`, `Feel free to improve related areas.`, `Use the latest successful run to determine production deploy scope.`
  7. **Draft Review Checklist** — decisions vs open; says what Helix must not do; source of truth named; scope constrained; artifact + failure behavior explicit; silent fallback forbidden; cardinality/batch explicit; singleton shortcuts forbidden; platform terms exact; negative acceptance tests present; no `Open Questions` section.
- **Language patterns:** Use hard constraints (`must`, `must not`, `do not`, `copy verbatim`, `only`, `exactly`, `fail closed`). Avoid soft language for invariants (`can`, `should`, `ideally`, `we prefer`, `as needed`).

**Verification (AI Agent Runs):**
```bash
test -f skill-content/references/ticket-prompting.md && echo "EXISTS" || echo "MISSING"
# Check all 7 required section headings exist
grep -c "Core Rule" skill-content/references/ticket-prompting.md
grep -c "Required Ticket Structure" skill-content/references/ticket-prompting.md
grep -c "How To Draft" skill-content/references/ticket-prompting.md
grep -c "Common Failure Modes" skill-content/references/ticket-prompting.md
grep -c "Deployment.*SDF.*Checklist\|Deployment / SDF Checklist" skill-content/references/ticket-prompting.md
grep -c "Good.*Bad.*Prompt.*Patterns\|Good / Bad Prompt Patterns" skill-content/references/ticket-prompting.md
grep -c "Draft Review Checklist" skill-content/references/ticket-prompting.md
```

**Success Criteria:**
- File exists with all 7 sections present.
- Uses hard-constraint language (`must`, `must not`, `do not`) for invariants.
- Contains the required ticket structure headers.
- Contains good/bad prompt pattern examples as specified.

---

### Step 4: Rewrite `skill-content/references/commands.md`

**Goal:** Expand the command reference to cover every subcommand at every depth, every long-form flag, and all enum values.

**What to Build:**
- Rewrite `skill-content/references/commands.md` (currently 127 lines, significant gaps).
- Source of truth: each command's `--help` output as defined by usage functions in source code.
- Must cover the following currently-missing items (identified by scout):
  - `tickets list` full flags: `--search`, `--user`, `--status`, `--status-not-in`, `--archived`, `--sprint`, `--json`
  - `tickets latest` flags: `--status-not-in`, `--archived`, `--sprint`
  - `tickets get --json` flag
  - `tickets update-description` subcommand entirely: `--file`, `--text`
  - `tickets create --mode` enum values: `AUTO`, `BUILD`, `FIX`, `RESEARCH`, `EXECUTE`
  - `tickets create --description-file` flag (separate from `--description`)
  - `tickets continue --dry-run` flag
  - `tickets artifacts --run` flag
  - `tickets artifact` flags: `--step`, `--repo`, `--run`
  - `tickets bundle --out`, `--run` flags
  - Full `library` family: `list`, `show`, `comments list`, `comments post`
  - `library comments post` flags: `--section`, `--rating`, `--reply-to`
  - `--rating` enum values: `thumbs-up` (alias `up`), `thumbs-down` (alias `down`), `love`
  - `--for` enum on `skill install`: `claude`, `codex`
  - `login --manual` flag
  - `token add --current` flag
  - Environment variable auth: `HELIX_API_KEY`, `HELIX_URL`
  - `org current`, `org list`, `org switch` as separate entries
  - `update --enable-auto`, `update --disable-auto` flags
- Keep the overall structure: sections per top-level command, usage lines showing exact flag syntax.
- Every long-form flag must appear as a literal substring (e.g., `--search`, `--description-file`, `--dry-run`).
- Every enum value must appear as a literal substring (e.g., `AUTO`, `BUILD`, `thumbs-up`, `up`).

**Verification (AI Agent Runs):**
```bash
# Spot-check key missing tokens are now present (backtick-stripped)
for token in "--search" "--user" "--status-not-in" "--archived" "--sprint" "--json" \
  "update-description" "--file" "--text" "--dry-run" "--description-file" \
  "AUTO" "BUILD" "FIX" "RESEARCH" "EXECUTE" \
  "thumbs-up" "thumbs-down" "love" "--reply-to" "--section" "--rating" \
  "--step" "--enable-auto" "--disable-auto" "--current" "--manual"; do
  if grep -q "$(echo "$token" | tr -d '`')" skill-content/references/commands.md; then
    echo "OK: $token"
  else
    echo "MISSING: $token"
  fi
done
```

**Success Criteria:**
- Every subcommand and long-form flag from `hlx --help` and each `hlx <subcommand> --help` appears as a literal substring.
- All enum values for `--mode`, `--rating`, and `--for` are present.
- `update-description` subcommand is documented.
- File structure is clear and consistent.

---

### Step 5: Rewrite `skill-content/SKILL.md`

**Goal:** Restructure SKILL.md to 10-section progressive-disclosure format with trigger-heavy description.

**What to Build:**
- Rewrite `skill-content/SKILL.md` (currently 196 lines, flat 5-section layout).
- **YAML frontmatter:**
  - `name: hlx-cli` (immutable — must not change)
  - `description:` ≤1024 chars. Must front-load triggers for BOTH CLI-ops AND ticket-writing. Must mention: auth + env vars (`HELIX_API_KEY`, `HELIX_URL`), org switching, all `tickets` subcommands, ticket-ref resolution (numeric / short-id / internal-id), `inspect repos/db/logs/api`, `comments list/post`, `library` family, writing Helix tickets, broken-install recovery.
- **Body sections (10, in this exact order):**
  1. `## Workflow` — smallest command first; trust current `helix-cli/src/**`; pass ticket refs as-given; switch orgs before working in a different org's repo.
  2. `## Guardrails` — auth required; `hlx inspect *` is read-only; do not log full tokens; verify org with `hlx org current`.
  3. `## Commands at a glance` — table of every top-level subcommand → one-line description; link to `references/commands.md`.
  4. `## Ticket work — gotchas` — `--description "<text>"` vs `--description-file <path>` (CLI errors when `--description <value>` resolves to a readable file path); 10,000-char description cap; dependency flags `--after`, `--reference`, `--implement-from`; `--dry-run` on `tickets continue`; `update-description --file | --text`; for `--mode RESEARCH`, drop implementation-shaped sections and skip "research only" boilerplate.
  5. `## Artifact workflow` — terminal statuses `DEPLOYED`, `UNVERIFIED`, `FAILED` may return empty `artifacts` summary; pass `--run <runId>`. `PREVIEW_READY` fixed by PR #36.
  6. `## Inspection` — PowerShell: prefer `--query '<sql>'` over positional SQL when SQL contains double-quoted Postgres identifiers.
  7. `## Writing tickets` — short pointer → link `references/ticket-prompting.md`.
  8. `## Install and update` — install + update download from GitHub release assets (`latest` release); recovery in `references/recovery.md`.
  9. `## Source of truth` — link `references/current-state.md`.
- **Token budget:** Body (post-frontmatter) ≤5,000 tokens. Keep content concise — detailed info lives in reference files.
- **Hard constraint:** `npm install -g @projectxinnovation/helix-cli@latest`, `npm uninstall -g`, `npm link` must NOT appear as recommended actions.

**Verification (AI Agent Runs):**
```bash
# Check frontmatter name
head -5 skill-content/SKILL.md | grep "name: hlx-cli"

# Check description length (≤1024 chars)
desc=$(sed -n '/^description:/,/^---$/p' skill-content/SKILL.md | head -n -1 | sed '1s/^description: //')
echo "Description length: ${#desc} chars"

# Check 10 sections in order
grep -n "^## " skill-content/SKILL.md

# No npm recommendations
grep -c "npm install -g" skill-content/SKILL.md && echo "FAIL" || echo "OK"
grep -c "npm uninstall -g" skill-content/SKILL.md && echo "FAIL" || echo "OK"
grep -c "npm link" skill-content/SKILL.md && echo "FAIL" || echo "OK"
```

**Success Criteria:**
- Frontmatter has `name: hlx-cli` and `description` ≤1024 chars with triggers for both CLI-ops and ticket-writing.
- Body has exactly 10 sections in the prescribed order.
- Body is ≤5,000 tokens (authoring constraint — keep concise).
- No npm install/uninstall/link recommendations.
- Links to reference files: `commands.md`, `ticket-prompting.md`, `recovery.md`, `current-state.md`.

---

### Step 6: Create `scripts/skill-sync/check-coverage.mjs`

**Goal:** Create the CI parser script that recursively walks `--help` output and asserts coverage in skill docs.

**What to Build:**
- Create directory `scripts/skill-sync/` and file `scripts/skill-sync/check-coverage.mjs`.
- **Language:** Plain Node.js ESM (.mjs). No TypeScript. No npm dependencies. Uses only `child_process`, `fs`, `path` built-ins.
- **Algorithm:**
  1. Run `node dist/index.js --help` (with `HLX_SKIP_UPDATE_CHECK=1` env var) to capture top-level help text.
  2. Parse subcommand names from usage lines matching `hlx <word>` patterns.
  3. For each discovered subcommand, run `node dist/index.js <cmd> --help` and repeat recursively.
  4. At each level, extract three token types:
     - **Subcommand names:** words after `hlx` or `hlx <parent>` in usage lines (excluding `<placeholder>` and `--flags`).
     - **Long-form flags:** patterns matching `--[a-z][a-z0-9-]*`.
     - **Enum values:** pipe-separated values inside angle brackets `<VAL1|VAL2|...>` — split on `|` to get individual values. Only extract from groups containing `|` (to distinguish from single-value placeholders like `<title>`).
  5. Also handle pipe-separated subcommand alternatives on usage lines (e.g., `hlx org current|list|switch` → `current`, `list`, `switch`).
  6. Load `skill-content/SKILL.md` and `skill-content/references/commands.md`, strip all backtick characters.
  7. For each extracted token, check if it appears as a case-sensitive literal substring in the combined doc content.
  8. Collect missing tokens. If any are missing, print them to stderr and exit 1.
- **Exit codes:** 0 = all tokens covered. 1 = missing tokens (listed to stderr). 2 = script error (build failure, unreadable files, unparseable help output — print `unrecognized help output for <subcommand>` per ticket failure behavior).
- **Key edge cases to handle:**
  - Max observed depth: 3 levels (`hlx` → `library` → `comments` → `list/post`). Algorithm must be recursive with no hard depth limit.
  - Help output goes to both stdout and stderr depending on exit code (usage functions write to `console.log` for exit 0, `console.error` for exit 1). Capture both streams.
  - Short flags (`-v`, `-h`) are aliases — do not independently check.
  - Positional arg descriptors (`<title>`, `<ticket-ref>`, `<server-url>`) are excluded — only extract enum groups containing `|`.
  - The `--for` flag's enum values (`claude|codex`) may appear without angle brackets in help text; handle `claude|codex` as subcommand alternatives on the same line.
  - Rating values (`thumbs-up`, `thumbs-down`, `love`) appear in prose text as "Rating values: thumbs-up (up), thumbs-down (down), love" — if a `--rating` flag is found and the help text contains these values in prose, extract them.

**Verification (AI Agent Runs):**
```bash
# Build first
npm ci --prefix /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli

# Run the parser and check exit code
cd /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli && node scripts/skill-sync/check-coverage.mjs
echo "Exit code: $?"
```

**Success Criteria:**
- Script runs without errors against the built CLI.
- Exits 0 when all CLI surface tokens are covered in SKILL.md + commands.md.
- Exits 1 when a token is missing, listing missing tokens to stderr.
- Exits 2 on script errors (unreadable files, unparseable help output).
- Works without auth credentials (uses `HLX_SKIP_UPDATE_CHECK=1`).

---

### Step 7: Create `.github/workflows/skill-sync.yml`

**Goal:** Add CI workflow that enforces CLI-surface coverage on every PR and push to main.

**What to Build:**
- Create `.github/workflows/skill-sync.yml`.
- **Triggers:** `on: { pull_request: {}, push: { branches: [main] } }`.
- **Job:** single job `skill-sync` on `ubuntu-latest`.
- **Steps:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `node-version: '22'` (matches `build-release.yml`)
  3. `npm ci` (triggers `prepare` → `npm run build` → `tsc`)
  4. `node scripts/skill-sync/check-coverage.mjs`
- **No additional dependencies.** No secrets required (help works without auth).
- **Failure behavior:** Non-zero exit from the parser script fails the workflow. Clear error output lists missing tokens.

**Verification (AI Agent Runs):**
```bash
# Check file exists and has correct triggers
test -f /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli/.github/workflows/skill-sync.yml && echo "EXISTS" || echo "MISSING"
grep -q "pull_request" /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli/.github/workflows/skill-sync.yml && echo "pull_request: OK" || echo "MISSING"
grep -q "main" /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli/.github/workflows/skill-sync.yml && echo "push main: OK" || echo "MISSING"
grep -q "check-coverage.mjs" /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli/.github/workflows/skill-sync.yml && echo "parser reference: OK" || echo "MISSING"
```

**Success Criteria:**
- File exists at `.github/workflows/skill-sync.yml`.
- Triggers on `pull_request` and `push` to `main`.
- Uses Node 22, `npm ci`, runs the parser script.
- No additional secrets or dependencies.

---

### Step 8: Create `.github/pull_request_template.md`

**Goal:** Add a PR template with a skill-update checkbox as a contributor reminder.

**What to Build:**
- Create `.github/pull_request_template.md`.
- Content: a simple PR template containing at minimum:
  - `- [ ] If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md.`
- The file does not currently exist, so this is a new file creation.
- If it existed (it doesn't), the checkbox would be appended preserving existing content.

**Verification (AI Agent Runs):**
```bash
test -f /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli/.github/pull_request_template.md && echo "EXISTS" || echo "MISSING"
grep -q "skill-content/SKILL.md" /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli/.github/pull_request_template.md && echo "checkbox: OK" || echo "MISSING"
```

**Success Criteria:**
- File exists at `.github/pull_request_template.md`.
- Contains the skill-update checkbox text.

---

### Step 9: Build and End-to-End Verification

**Goal:** Verify the entire implementation works together: build succeeds, parser passes, negative test fails, skill show/install work.

**What to Build:**
- No new files. This step is verification only.
- Run the full verification sequence described in the Verification Plan below.

**Verification (AI Agent Runs):**
```bash
cd /vercel/sandbox/workspaces/cmpfq210b002hjm0uhyvia4h8/helix-cli

# 1. Build
npm run build

# 2. Typecheck
npm run typecheck

# 3. Tests
npm test

# 4. Parser passes (all tokens covered)
node scripts/skill-sync/check-coverage.mjs
echo "Parser exit code: $?"

# 5. Negative test: remove a flag mention and verify failure
cp skill-content/references/commands.md skill-content/references/commands.md.bak
sed -i 's/--search//g' skill-content/references/commands.md
node scripts/skill-sync/check-coverage.mjs 2>&1 || true
echo "Negative test exit code: $?"
# Restore
cp skill-content/references/commands.md.bak skill-content/references/commands.md
rm skill-content/references/commands.md.bak

# 6. Skill show
node dist/index.js skill show | head -5

# 7. Skill install to tmpdir
TMPDIR=$(mktemp -d)
node dist/index.js skill install --target "$TMPDIR" --force
ls -la "$TMPDIR/hlx-cli/"
ls -la "$TMPDIR/hlx-cli/references/"
rm -rf "$TMPDIR"
```

**Success Criteria:**
- Build, typecheck, and tests all pass.
- Parser script exits 0 with current docs.
- Negative test (removing `--search` from commands.md) causes parser to exit non-zero.
- `hlx skill show` outputs the new SKILL.md content unchanged.
- `hlx skill install --target <tmpdir>` copies SKILL.md plus all reference files including the three new ones (ticket-prompting.md, recovery.md, current-state.md).

---

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js >= 18 available | available | `package.json` engines field; CI runs Node 22; sandbox has Node | CHK-01 through CHK-10 |
| `npm ci` succeeds (installs devDependencies and triggers tsc build) | available | `package.json` scripts.prepare = `npm run build`; verified in build-release.yml | CHK-01, CHK-02, CHK-03, CHK-05, CHK-06, CHK-08, CHK-09, CHK-10 |
| No auth credentials required for `--help` invocations | available | `src/index.ts` lines 24-33: `configOrHelp()` returns stub config for help requests | CHK-05, CHK-06 |
| `skill-content/` directory writable | available | Standard repo checkout | CHK-07, CHK-08, CHK-09 |
| `HLX_SKIP_UPDATE_CHECK=1` env var suppresses network calls | available | `src/update/index.ts` checks this env var; parser script sets it | CHK-05, CHK-06 |

### Required Checks

[CHK-01] TypeScript build succeeds.
- Action: Run `npm run build` in the helix-cli repository root.
- Expected Outcome: tsc compiles without errors; `dist/` directory is populated.
- Required Evidence: Command output showing successful compilation with exit code 0.

[CHK-02] TypeScript typecheck passes.
- Action: Run `npm run typecheck` in the helix-cli repository root.
- Expected Outcome: `tsc --noEmit` exits 0 with no type errors.
- Required Evidence: Command output showing exit code 0.

[CHK-03] Existing tests pass.
- Action: Run `npm test` in the helix-cli repository root.
- Expected Outcome: All existing tests pass, including skill install/show tests in `src/skill/skill.test.ts`.
- Required Evidence: Test runner output showing all tests passed with exit code 0.

[CHK-04] SKILL.md frontmatter has `name: hlx-cli` and description ≤1024 chars with dual triggers.
- Action: Read `skill-content/SKILL.md` and inspect the YAML frontmatter. Count the character length of the `description` field. Check that the description mentions both CLI-operation triggers (e.g., `inspect`, `tickets`, `HELIX_API_KEY`) and ticket-writing triggers (e.g., `writing tickets`, `ticket-prompting`).
- Expected Outcome: `name: hlx-cli` is present; description is ≤1024 characters; description contains trigger keywords for both CLI-ops and ticket-writing.
- Required Evidence: The frontmatter content showing `name: hlx-cli`, the measured character count of the description field, and the presence of both CLI-ops and ticket-writing trigger keywords.

[CHK-05] CI parser script exits 0 with current docs (full CLI surface covered).
- Action: Run `npm ci` to build the CLI, then run `node scripts/skill-sync/check-coverage.mjs` in the helix-cli repository root.
- Expected Outcome: The parser script recursively walks `--help` output, extracts all tokens (subcommands, long-form flags, enum values), checks them against SKILL.md and commands.md, and exits 0.
- Required Evidence: Command output from the parser script showing exit code 0 and summary of tokens checked.

[CHK-06] Negative test: removing a flag from commands.md fails the CI parser.
- Action: Temporarily remove all occurrences of `--search` from `skill-content/references/commands.md`, run `node scripts/skill-sync/check-coverage.mjs`, then restore the file.
- Expected Outcome: The parser script exits non-zero (exit code 1) and its stderr output lists `--search` as a missing token.
- Required Evidence: Command output showing exit code 1 and stderr listing `--search` as missing. The file must be restored after the test.

[CHK-07] `hlx skill show` outputs the new SKILL.md content.
- Action: After building (`npm run build`), run `node dist/index.js skill show` and inspect the output.
- Expected Outcome: Output matches the content of `skill-content/SKILL.md` byte-for-byte. The first few lines show the YAML frontmatter with `name: hlx-cli`.
- Required Evidence: Command output showing the SKILL.md frontmatter and the first section heading.

[CHK-08] `hlx skill install` copies all new reference files.
- Action: After building, run `node dist/index.js skill install --target <tmpdir> --force` where `<tmpdir>` is a fresh temporary directory. List the contents of `<tmpdir>/hlx-cli/` and `<tmpdir>/hlx-cli/references/`.
- Expected Outcome: The installed directory contains `SKILL.md` and `references/` with all files: `commands.md`, `current-state.md`, `recovery.md`, `ticket-prompting.md`.
- Required Evidence: Directory listing showing all expected files present.

[CHK-09] No npm install/uninstall/link recommendations in recovery.md or SKILL.md.
- Action: Search `skill-content/references/recovery.md` and `skill-content/SKILL.md` for the strings `npm install -g`, `npm uninstall -g`, and `npm link`.
- Expected Outcome: Zero matches in both files.
- Required Evidence: grep/search output showing zero matches for all three patterns in both files.

[CHK-10] skill-sync.yml triggers on pull_request and push to main.
- Action: Read `.github/workflows/skill-sync.yml` and inspect the `on:` section.
- Expected Outcome: Workflow triggers include `pull_request` (all branches) and `push` to `branches: [main]`. The job uses Node 22, runs `npm ci`, and executes `node scripts/skill-sync/check-coverage.mjs`.
- Required Evidence: The content of the `on:` trigger section and the job steps from the workflow file.

[CHK-11] PR template includes skill-update checkbox.
- Action: Read `.github/pull_request_template.md` and inspect its content.
- Expected Outcome: File contains the text `If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md`.
- Required Evidence: The file content showing the checkbox text.

[CHK-12] ticket-prompting.md contains all 7 required sections.
- Action: Read `skill-content/references/ticket-prompting.md` and check for the presence of all 7 section headings: Core Rule, Required Ticket Structure, How To Draft, Common Failure Modes, Deployment / SDF Checklist, Good / Bad Prompt Patterns, Draft Review Checklist.
- Expected Outcome: All 7 section headings are present in the file in the correct order.
- Required Evidence: grep or file content showing all 7 section headings.

[CHK-13] SKILL.md body contains 10 sections in prescribed order.
- Action: Read `skill-content/SKILL.md` and extract all `## ` headings from the body (post-frontmatter).
- Expected Outcome: Exactly 10 `## ` sections in this order: Workflow, Guardrails, Commands at a glance, Ticket work — gotchas, Artifact workflow, Inspection, Writing tickets, Install and update, Source of truth. (Note: the 10th section is counted as 9 `## ` headings plus the frontmatter section.)
- Required Evidence: The ordered list of `## ` headings extracted from SKILL.md.

---

## Success Metrics

1. All 8 files created/modified as specified.
2. Build, typecheck, and tests pass (CHK-01, CHK-02, CHK-03).
3. Parser script validates full CLI surface coverage (CHK-05).
4. Negative test confirms parser catches missing tokens (CHK-06).
5. Skill show and install work correctly with new content (CHK-07, CHK-08).
6. No npm install/uninstall/link recommendations in docs (CHK-09).
7. CI workflow and PR template correctly configured (CHK-10, CHK-11).
8. All reference docs have required structure (CHK-04, CHK-12, CHK-13).

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Full ticket requirements, acceptance criteria, non-negotiable invariants | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail; no npm recommendations; parser under scripts/skill-sync/ |
| `scout/reference-map.json` | Detailed file map with all CLI surface tokens cataloged | 34 files; all flag/subcommand gaps enumerated; confirmed consistent help text format; confirmed no existing scripts/ or PR template |
| `scout/scout-summary.md` | Synthesized gap analysis | SKILL.md flat 5-section layout; commands.md ~15 missing flags; no CI enforcement; install auto-includes via readdirSync |
| `diagnosis/diagnosis-statement.md` | Root cause analysis and success criteria | 5-cause compound gap; all changes doc/CI/scripting only; install.ts line 58 readdirSync auto-discovers new files |
| `diagnosis/apl.json` | Structured diagnostic answers | Confirmed auth-free help via configOrHelp stub; help text parseable; no file conflicts |
| `product/product.md` | Product vision, use cases, design principles | Progressive disclosure pattern; trigger-heavy description; hard CI enforcement; 5,000-token body budget is writing constraint |
| `tech-research/tech-research.md` | Technical decisions and architecture | Parser is plain .mjs ESM; recursive --help strategy; token types (subcommands, flags, enums); exit code semantics; HLX_SKIP_UPDATE_CHECK=1 |
| `tech-research/apl.json` | Technical research answers with evidence | configOrHelp stub pattern confirmed; pipe-separated alternatives handling; CI triggers and Node version |
| `repo-guidance.json` | Repo intent metadata | helix-cli is sole target repo; no cross-repo impact |
| `skill-content/SKILL.md` | Current state of primary file | 196 lines, flat 5-section layout, 149-char description; confirms complete rewrite needed |
| `skill-content/references/commands.md` | Current command reference with gaps | 127 lines; missing ~15 flags, update-description, enum values; confirms expansion scope |
| `src/index.ts` | CLI entry point and help format | configOrHelp returns stub for --help (lines 24-33); consistent usage() format (lines 35-63); SKIP_AUTO_UPDATE set |
| `src/tickets/index.ts` | Tickets subcommand router | All 10 subcommands with full flag sets in usage text; consistent format for parser |
| `src/library/comments.ts` | Deepest nesting level (depth 3) | Rating values in prose not angle brackets; consistent commentsUsage() format |
| `src/inspect/index.ts` | Inspect router with PowerShell tips | Consistent help format; --query/--query-file/--limit flags |
| `src/skill/install.ts` | Skill install mechanism | Lines 54-60: readdirSync on references/ auto-discovers new files; no code changes needed |
| `.github/workflows/build-release.yml` | Existing CI pattern | Node 22; npm ci + npm test; tarball includes skill-content/ |
| `package.json` | Build toolchain | type=module (ESM); prepare=build=tsc; engines >=18; zero runtime deps |
| `tsconfig.json` | TypeScript config | rootDir=src, outDir=dist; scripts/ is outside compilation scope |
