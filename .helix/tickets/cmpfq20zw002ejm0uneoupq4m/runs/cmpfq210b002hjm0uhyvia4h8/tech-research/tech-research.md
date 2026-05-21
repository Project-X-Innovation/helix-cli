# Tech Research: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Technology Foundation

| Aspect | Detail |
|--------|--------|
| Runtime | Node.js >= 18 (CI uses Node 22) |
| Language | TypeScript (src/) compiles to ESM JavaScript (dist/). New parser script is plain ESM JS (.mjs) under scripts/. |
| Module system | ESM (`"type": "module"` in package.json) |
| Build | `npm ci` triggers `prepare` → `npm run build` → `tsc`. Output in `dist/`. |
| Test runner | `node --test` (Node built-in, no external test framework) |
| CI platform | GitHub Actions (ubuntu-latest, Node 22) |
| Existing workflows | `build-release.yml` (push to main → latest release), `publish.yml` (v* tags → npm) |

The repo has **zero runtime dependencies** — only `@types/node` and `typescript` as devDependencies. The CLI uses manual flag parsing (no yargs/commander). This means the parser script can also be dependency-free, using only Node.js built-ins.

---

## Architecture Decision 1: CI Sync Parser Script Language

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **A: Plain Node.js ESM (.mjs)** | No build step; runs directly with `node`; same runtime as CLI; full regex support; consistent with ESM repo | Not type-checked |
| B: TypeScript under src/ | Type-checked; consistent with main codebase | Couples parser to main build; adds to dist/ output; complicates tarball (must exclude from release) |
| C: Bash script | Simpler for basic string matching | Poor regex support; less portable; harder to maintain for structured parsing; Windows incompatible |

### Chosen: Option A — Plain Node.js ESM script

**Rationale:** The parser script lives under `scripts/skill-sync/`, outside the TypeScript `rootDir: src` scope (tsconfig.json line 8). Using `.mjs` avoids coupling to the main build pipeline and keeps the tarball unchanged. The parsing logic is regex-heavy but not complex enough to benefit from TypeScript — it processes text output and checks string containment. Zero dependencies needed; `child_process.execSync` and `fs.readFileSync` cover all requirements.

**File:** `scripts/skill-sync/check-coverage.mjs`

---

## Architecture Decision 2: Help Text Parsing Strategy

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **A: Recursive --help invocation with regex parsing** | Works from actual CLI output; self-correcting as CLI evolves; matches ticket requirement | Depends on help text format consistency; slower than source parsing |
| B: Static analysis of source files | Faster; no runtime needed | Fragile if source patterns change; would need to understand TypeScript AST; complex to maintain |
| C: Export a machine-readable surface manifest from the CLI | Most reliable; structured data | Requires modifying CLI binary (violates invariant); adds coupling |

### Chosen: Option A — Recursive --help invocation

**Rationale:** The ticket explicitly requires "recursively run `--help` on every subcommand starting from `node dist/index.js --help`". The help text format is highly consistent across all commands — every usage function follows the `hlx <parent> <child> [flags]` pattern (verified across src/index.ts:35-63, src/tickets/index.ts:17-31, src/inspect/index.ts:11-29, src/library/comments.ts:8-16). Auth is not required for `--help` invocations because `configOrHelp()` (src/index.ts:24-33) returns a stub config when help is requested.

**Recursive discovery algorithm:**
1. Run `node dist/index.js --help` → capture stdout+stderr
2. Parse lines matching `hlx <word>` to extract top-level command names
3. For each command, run `node dist/index.js <cmd> --help`
4. Parse for sub-subcommands (words after `hlx <cmd> <subcmd>`)
5. Recurse until no new subcommands are found
6. At each level, extract: command names, long-form flags (`--flag-name`), enum values (from `<VAL1|VAL2|...>` patterns)

**Max observed depth:** 3 levels (`hlx` → `library` → `comments` → `list/post`). The algorithm is unbounded but practically tested to this depth.

---

## Architecture Decision 3: Token Extraction and Matching

### Token Types

| Type | Regex Pattern | Example | Notes |
|------|---------------|---------|-------|
| Subcommand names | Word after `hlx` or `hlx <parent>` in usage lines | `login`, `tickets`, `list`, `create` | Filter out `<placeholder>` and `--flags` |
| Long-form flags | `--[a-z][a-z0-9-]*` | `--search`, `--description-file` | Boolean and value-taking flags |
| Enum values | Values inside `<VAL1\|VAL2\|...>` (with `\|` separator) | `AUTO`, `BUILD`, `FIX`, `RESEARCH`, `EXECUTE` | Distinguish from single-value placeholders like `<title>` by presence of `\|` |

### Matching Rules

- **Case-sensitive** literal substring match in `skill-content/SKILL.md` or `skill-content/references/commands.md`
- **Backtick stripping**: Remove all backtick characters from doc files before matching (so `` `--repo` `` matches `--repo`)
- **Exclusions**: Short flags (`-v`, `-h`) are aliases and not independently checked. Positional arg descriptors (`<title>`, `<ticket-ref>`, `<server-url>`) are not checked — only enum groups containing `|` are extracted.

### Pipe-Separated Alternatives

Help text uses `|` in two contexts:
1. **Subcommand alternatives on a single line:** `hlx org current|list|switch` → split on `|` to get `current`, `list`, `switch` as separate subcommand tokens
2. **Enum values in angle brackets:** `<AUTO|BUILD|FIX|RESEARCH|EXECUTE>` → split on `|` within the `<>` group to get individual enum values

The parser must handle both patterns. The distinguishing feature is that subcommand alternatives appear as bare words in the usage line, while enum values are wrapped in `<>`.

---

## Architecture Decision 4: SKILL.md Structure — Progressive Disclosure

### Chosen Structure (per ticket requirement)

The SKILL.md body follows a 10-section progressive-disclosure layout. Content flows from highest-frequency agent tasks (Workflow, Guardrails, Commands) to specialized topics (gotchas, inspection, install).

| Section | Purpose | Disclosure Level |
|---------|---------|-----------------|
| YAML frontmatter | Trigger matching (description <= 1024 chars) | Activation |
| Workflow | Smallest-command-first flow | Primary (most used) |
| Guardrails | Safety constraints | Primary |
| Commands at a glance | One-line table + link to commands.md | Primary |
| Ticket work — gotchas | Operational traps proven in practice | Secondary |
| Artifact workflow | Terminal status / --run patterns | Secondary |
| Inspection | PowerShell quoting tips | Secondary |
| Writing tickets | Pointer to ticket-prompting.md | Tertiary |
| Install and update | GitHub release asset flow | Tertiary |
| Source of truth | Link to current-state.md | Tertiary |

**Token budget:** Body (post-frontmatter) <= 5,000 tokens. This is a writing constraint verified at authoring time. No automated token counting is added in this round.

---

## Architecture Decision 5: New Reference Files Auto-Discovery

### Mechanism

The skill install logic (`src/skill/install.ts` lines 54-60) uses `readdirSync(refsDir)` to iterate all files in `references/` and copies each one. Adding new files (`ticket-prompting.md`, `recovery.md`, `current-state.md`) to `skill-content/references/` requires **zero code changes** — the install mechanism auto-discovers them.

**Evidence:** `src/skill/install.ts` line 58: `for (const file of readdirSync(refsDir))`.

The `build-release.yml` tarball already includes `skill-content/` (line 37-38), so new reference files will be included in releases automatically.

**Risk:** Existing tests (`src/skill/skill.test.ts`) validate byte-for-byte copy of SKILL.md and references/. New reference files will be included in the copy and validated by the same logic — no test changes needed.

---

## Core API/Methods

### Parser Script Interface

```
scripts/skill-sync/check-coverage.mjs

Input:  node dist/index.js (built CLI)
        skill-content/SKILL.md
        skill-content/references/commands.md
Output: exit 0 (all tokens covered) or exit 1 (missing tokens listed to stderr)
```

**Key functions (conceptual, not implementation code):**

| Function | Purpose |
|----------|---------|
| `runHelp(cmdPath)` | Execute `node dist/index.js <cmdPath> --help`, capture output |
| `parseTokens(helpText, prefix)` | Extract subcommands, flags, enum values from help text |
| `discoverSubcommands(helpText, prefix)` | Find sub-subcommand names to recurse into |
| `loadDocContent(paths)` | Read SKILL.md + commands.md, strip backticks |
| `checkCoverage(tokens, docContent)` | Assert each token appears as substring; collect missing |

### CLI Help Text Contract

Every command's help is accessible via `--help` or `-h` without auth. The output follows this consistent pattern (verified across all 9 top-level commands):

```
Usage:
  hlx <cmd> <subcmd> [flags]      Description text
  hlx <cmd> <subcmd> [flags]      Description text
```

---

## Technical Decisions

### TD-1: Parser script is a single .mjs file

**Chosen:** Single file `scripts/skill-sync/check-coverage.mjs`.
**Rejected:** Multiple files with a shared module — the parsing logic is not complex enough to warrant splitting. A single file is easier to review and maintain.

### TD-2: CI workflow uses npm ci (not npm install)

**Chosen:** `npm ci` for deterministic installs, consistent with `build-release.yml`.
**Rejected:** `npm install` — less deterministic; `npm ci` already handles the `prepare` → `build` chain.

### TD-3: No additional npm dependencies for the parser

**Chosen:** Use only Node.js built-ins (`child_process`, `fs`, `path`).
**Rejected:** Adding a CLI argument parser (e.g., `yargs`) or test framework — unnecessary for a single focused script.

### TD-4: Exit code semantics for the CI script

**Chosen:** Exit 0 = all tokens covered. Exit 1 = missing tokens (listed to stderr with clear labels). Exit 2 = script error (build failure, unreadable files, unparseable help output).
**Rejected:** Warning-only mode — the ticket explicitly requires "exit non-zero with the list of missing tokens" and states "Soft / warning-only is not acceptable."

### TD-5: Backtick stripping in doc files

**Chosen:** Strip all backtick characters from SKILL.md and commands.md content before substring matching.
**Rationale:** Markdown docs wrap CLI tokens in backticks (e.g., `` `--repo` ``). The ticket specifies "case-sensitive; backticks stripped".

### TD-6: HLX_SKIP_UPDATE_CHECK=1 for parser invocations

**Chosen:** Set `HLX_SKIP_UPDATE_CHECK=1` environment variable when invoking `node dist/index.js --help` to suppress auto-update checks during CI parsing.
**Rationale:** The CLI has an auto-update check that runs before command dispatch (src/index.ts:68-75). While `--help` is in the `SKIP_AUTO_UPDATE` set, subcommand-level help (e.g., `hlx tickets list --help`) is not skipped by this set — it reaches the subcommand handler before the set check. Setting the env var ensures no network calls during CI.

### TD-7: PR template is additive

**Chosen:** Create `.github/pull_request_template.md` with the skill-update checkbox. If the file already exists (it doesn't), append the checkbox preserving existing content.
**Evidence:** No `.github/pull_request_template.md` exists in the repo currently.

### TD-8: current-state.md is a new file

**Chosen:** Create `skill-content/references/current-state.md` as a new file with a dated migration note.
**Evidence:** The file does not exist. The ticket says "append a dated note" but since the file doesn't exist, creation is the correct action.

---

## Technical Checks

[TCK-01] CI sync script exits non-zero on missing CLI surface tokens
- Decision Reference: "Exit 1 = missing tokens (listed to stderr with clear labels)"
  (from TD-4: Exit code semantics)
- Verification Method: behavioral
- Expected Evidence: Removing a flag mention (e.g., `--search`) from commands.md and running the parser script results in exit code 1 and stderr output listing `--search` as a missing token.

[TCK-02] Parser discovers all subcommand levels via recursive --help
- Decision Reference: "Recursive --help invocation with regex parsing"
  (from Architecture Decision 2)
- Verification Method: behavioral
- Expected Evidence: Parser output (in verbose/debug mode or via token listing) includes tokens from all 3 nesting levels: top-level (`login`, `tickets`), depth-2 (`list`, `create`, `repos`), and depth-3 (`library comments list`, `library comments post`).

[TCK-03] Help invocations work without auth credentials
- Decision Reference: "Auth is not required for --help invocations because configOrHelp() returns a stub config"
  (from Architecture Decision 2)
- Verification Method: behavioral
- Expected Evidence: Running the parser script in CI (no HELIX_API_KEY, no ~/.hlx/config.json) succeeds without auth errors.

[TCK-04] Skill install auto-discovers new reference files
- Decision Reference: "Adding new files to skill-content/references/ requires zero code changes"
  (from Architecture Decision 5)
- Verification Method: behavioral
- Expected Evidence: After build, `hlx skill install --target <tmpdir>` copies SKILL.md plus all files in references/ including ticket-prompting.md, recovery.md, and current-state.md.

[TCK-05] SKILL.md frontmatter description is <= 1024 characters with dual triggers
- Decision Reference: "Trigger matching (description <= 1024 chars)"
  (from Architecture Decision 4)
- Verification Method: code-inspection
- Expected Evidence: The `description:` field in SKILL.md YAML frontmatter is <= 1024 characters and contains trigger keywords for both CLI-ops (e.g., `inspect`, `tickets`, `HELIX_API_KEY`) and ticket-writing (e.g., `writing tickets`, `ticket-prompting`).

[TCK-06] No npm install/uninstall/link recommendations in recovery.md or SKILL.md
- Decision Reference: "Install/update sections describe the GitHub-release-asset flow only"
  (from ticket non-negotiable invariants)
- Verification Method: code-inspection
- Expected Evidence: Searching recovery.md and SKILL.md for `npm install -g`, `npm uninstall -g`, and `npm link` returns zero matches.

[TCK-07] skill-sync.yml workflow triggers on pull_request and push to main
- Decision Reference: "skill-sync.yml should trigger on pull_request and push to main"
  (from APL Q5 answer)
- Verification Method: code-inspection
- Expected Evidence: `.github/workflows/skill-sync.yml` has `on: { pull_request: {}, push: { branches: [main] } }` (or equivalent YAML).

---

## Cross-Platform Considerations

| Platform | Impact | Mitigation |
|----------|--------|------------|
| **CI (ubuntu-latest)** | Primary execution environment for skill-sync workflow | Node 22, `child_process.execSync` with `{ encoding: 'utf8' }` |
| **Windows contributors** | May run parser locally; `child_process.execSync` works cross-platform | Use `path.join` instead of hardcoded `/` in file paths. The `.mjs` script uses `node` command which is cross-platform. |
| **PowerShell quoting** | Documented in SKILL.md Inspection section and inspect help text | The parser runs `--help` programmatically, not through a shell — no quoting issues |

The parser script itself has no platform-specific concerns since it uses `execSync` which handles process invocation cross-platform. The `HLX_SKIP_UPDATE_CHECK` env var is set via the `env` option on `execSync`, not via shell syntax.

---

## Performance Expectations

| Metric | Expected | Notes |
|--------|----------|-------|
| CI workflow total time | ~30-60 seconds | Dominated by `npm ci` (install + tsc build). The recursive --help walk adds < 5 seconds. |
| Number of --help invocations | ~15-20 | 1 top-level + ~10 depth-1 + ~5 depth-2 + ~3 depth-3 |
| Token count to check | ~50-70 | ~12 subcommand names + ~30 flags + ~10 enum values |
| Doc file size | < 100KB total | SKILL.md (<= 5,000 tokens) + commands.md (expanded but still < 500 lines) |

Performance is not a concern for this CI check. It runs infrequently (per PR and push to main) and the entire parsing+matching step is < 5 seconds.

---

## Dependencies

### New Files Created

| File | Type | Purpose |
|------|------|---------|
| `skill-content/SKILL.md` | Rewrite | 10-section progressive-disclosure skill |
| `skill-content/references/commands.md` | Rewrite | Full CLI surface reference |
| `skill-content/references/ticket-prompting.md` | New | 7-section ticket-authoring guide |
| `skill-content/references/recovery.md` | New | GitHub-release-asset install/update/recovery |
| `skill-content/references/current-state.md` | New | Dated migration note (PR #86) |
| `.github/workflows/skill-sync.yml` | New | CI surface coverage check |
| `scripts/skill-sync/check-coverage.mjs` | New | Parser + matcher script |
| `.github/pull_request_template.md` | New | PR template with skill-update checkbox |

### External Dependencies

None. The parser script uses only Node.js built-ins. No new npm packages are required.

### Build Pipeline Dependencies

| Step | Depends On | Notes |
|------|-----------|-------|
| `skill-sync.yml` | `npm ci` completing (which runs tsc) | Parser needs `dist/index.js` to exist |
| Parser script | `dist/index.js` being executable | Must run `node dist/index.js --help` successfully |
| Parser script | `skill-content/SKILL.md` and `skill-content/references/commands.md` | Reads both files for coverage checking |

### Invariant Dependencies (must not change)

| Item | Constraint |
|------|-----------|
| `name: hlx-cli` in SKILL.md frontmatter | Immutable |
| `hlx skill show` / `hlx skill install` behavior | No code changes |
| `src/update/**` | No modifications |
| `publish.yml` | No modifications |
| `build-release.yml` | No modifications |
| `references/commands.md` | Expanded, not deleted |

---

## Deferred to Round 2

| Item | Reason |
|------|--------|
| Automated token counting for 5,000-token SKILL.md body budget | Requires a tokenizer dependency; ticket treats this as a writing constraint. Product doc (Open Questions #2) notes this as a future consideration. |
| Broken-link checking for reference doc links in SKILL.md | Useful but out of scope — ticket focuses on CLI surface coverage |
| YAML frontmatter schema validation in CI | Would catch description length violations; not in ticket scope |
| Rating enum values from prose text (not angle brackets) | The `thumbs-up (up), thumbs-down (down), love` values appear in prose in help text, not in `<>` syntax. They are documented in commands.md but the parser may not auto-extract them from help output. The CI check will verify their presence if they appear as long-form flag values. Manual verification ensures they're documented. |

---

## Summary Table

| Decision | Choice | Key Rationale |
|----------|--------|---------------|
| Parser language | Plain Node.js ESM (.mjs) | No build step; outside tsconfig rootDir; zero dependencies |
| Parser strategy | Recursive --help invocation | Matches ticket requirement; self-correcting; auth-free via configOrHelp stub |
| Token types | Subcommands + long-form flags + enum values | Covers the full "CLI surface" per ticket definition |
| Token matching | Case-sensitive substring with backtick stripping | Matches ticket specification |
| CI Node version | 22 | Matches build-release.yml |
| CI triggers | pull_request + push: main | Matches ticket requirement |
| Exit semantics | 0=pass, 1=missing tokens, 2=script error | Hard failure per ticket invariant |
| Reference file delivery | Auto-discovered by readdirSync | Zero code changes to install.ts |
| SKILL.md structure | 10-section progressive disclosure | Per ticket specification |
| Additional dependencies | None | Keep the zero-dependency pattern |

---

## APL Statement

The technical direction is to create a single Node.js ESM parser script (`scripts/skill-sync/check-coverage.mjs`) that recursively discovers CLI surface tokens from `--help` output and asserts their presence in skill docs. The script requires no additional dependencies, leverages the existing build pipeline (`npm ci` triggers tsc), and runs without auth credentials due to the CLI's `configOrHelp()` stub pattern. The CI workflow (`skill-sync.yml`) mirrors the existing `build-release.yml` setup (Node 22, ubuntu-latest). All documentation changes (SKILL.md rewrite, commands.md expansion, three new reference files, PR template) are additive and leverage the skill install mechanism's auto-discovery of new files in `references/`.

---

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Full ticket requirements, acceptance criteria, non-negotiable invariants | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail; no npm recommendations; parser under scripts/skill-sync/ |
| `scout/reference-map.json` | Detailed file map with all CLI surface tokens and source locations | 34 files identified; all flag/subcommand gaps enumerated per source file; confirmed consistent help text format; confirmed no existing scripts/ or PR template |
| `scout/scout-summary.md` | Synthesized gap analysis between current state and target | SKILL.md flat 5-section layout; commands.md ~15 missing flags; no CI enforcement; install auto-includes via readdirSync |
| `diagnosis/apl.json` | Structured diagnostic answers with evidence | Confirmed auth-free help invocation via configOrHelp stub; help text parseable with consistent format; no file conflicts for new additions |
| `diagnosis/diagnosis-statement.md` | Root cause analysis and success criteria | 5-cause compound gap; all changes are documentation/CI/scripting — no CLI binary changes; install.ts line 58 readdirSync auto-discovers new files |
| `product/product.md` | Product vision, use cases, design principles | Progressive disclosure pattern; trigger-heavy description for agent activation; hard CI enforcement; 5,000-token body budget is writing constraint |
| `repo-guidance.json` | Repo intent metadata | helix-cli is sole target repo; no cross-repo impact |
| `src/index.ts` | CLI entry point with configOrHelp() and usage() | Confirmed help works without auth (lines 24-33); canonical top-level help text format (lines 35-63); SKIP_AUTO_UPDATE set (line 69) |
| `src/tickets/index.ts` | Tickets command router with all usage text | ticketsUsage() at lines 17-31 shows consistent format; all 10 subcommands enumerated; flag patterns confirmed |
| `src/tickets/create.ts` | Ticket creation with --description gotcha and VALID_MODES | Lines 48-58: file-path detection on --description value; VALID_MODES enum (line 13); --mode help text uses angle-bracket enum syntax |
| `src/inspect/index.ts` | Inspect command router with PowerShell quoting tips | Lines 11-29: consistent help format; --query vs positional SQL; --query-file variant |
| `src/library/index.ts` | Library command router (depth 2) | Lines 8-16: consistent help format; comments sub-subcommand handling at lines 48-64 |
| `src/library/comments.ts` | Library comments router (depth 3) | Lines 6-16: consistent help format at deepest nesting level; rating enum in prose not angle brackets |
| `src/comments/index.ts` | Comments command router | Lines 7-14: consistent help format; --ticket, --helix-only, --since flags |
| `src/skill/install.ts` | Skill install mechanism | Lines 54-60: readdirSync on references/ confirms auto-discovery; --target/--for/--force flags |
| `.github/workflows/build-release.yml` | Existing CI pipeline | Node 22; npm ci + npm test pattern; tarball includes skill-content/ |
| `package.json` | Build toolchain and config | type=module (ESM); prepare=build=tsc; engines >=18; zero runtime deps |
| `tsconfig.json` | TypeScript compiler config | rootDir=src, outDir=dist — scripts/ is outside compilation scope |
