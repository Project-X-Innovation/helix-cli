# Implementation Plan — BLD-556: hlx library show --full

## Overview

Add a `--full` flag to `hlx library show` that prints the full markdown body of a library item after the existing TOC output. The content is already fetched by the handler (`item.content`) but only headings are printed today. The change gates a `console.log(item.content)` call behind `hasFlag(args, '--full')`, following the established flag pattern used by 7+ other commands. Four files require changes; no new API calls, dependencies, or architectural changes are needed.

## Implementation Principles

- **Additive only**: The `--full` flag adds a new output path. Default behavior is unchanged.
- **Follow established patterns**: Use `hasFlag()` from `src/lib/flags.ts`, identical to `--json`, `--dry-run`, `--force`, etc.
- **Minimal surface**: One new flag, no new commands, no new dependencies, no new API calls.
- **No over-engineering**: The content is already in memory — print it conditionally. No abstractions, no refactoring.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Add `--full` flag logic to show handler | Modified `src/library/show.ts` with flag detection and body printing |
| 2 | Update show help text | Modified `src/library/index.ts` with `[--full]` in help |
| 3 | Update top-level usage text | Modified `src/index.ts` with `--full` mention |
| 4 | Update skill documentation | Modified `skill-content/references/commands.md` with `--full` docs |
| 5 | Build and verify | Successful `tsc` build, passing tests |

## Detailed Implementation Steps

### Step 1: Add `--full` flag logic to show handler

**Goal**: Make `cmdShow` print the full markdown body after the TOC when `--full` is passed.

**What to Build**:

In `src/library/show.ts`:
1. Add import: `import { hasFlag } from "../lib/flags.js";`
2. Rename the third parameter from `_args` to `args` in the `cmdShow` function signature (line 23).
3. After the existing heading-parsing for-loop (after line 64), add a conditional block:
   - Check `hasFlag(args, '--full')`
   - If true, print a separator (`\n---\n`) followed by `item.content`

The existing null-content guard at lines 27-30 already returns early before both the TOC loop and the new block, so no additional null handling is needed.

**Verification (AI Agent Runs)**:
- Run `npm run typecheck` — should pass with no errors.
- Inspect the modified file to confirm: import added, `_args` renamed to `args`, conditional block added after the for-loop, existing loop unchanged.

**Success Criteria**:
- `hasFlag` imported from `../lib/flags.js`
- `_args` renamed to `args` in the function signature
- Conditional `--full` block added after the TOC loop (not inside it)
- Existing heading-rendering loop is not modified
- TypeScript compiles cleanly

### Step 2: Update show help text

**Goal**: Document `--full` in the `hlx library show --help` output.

**What to Build**:

In `src/library/index.ts`, update the help text block in the `show` case (around line 39):
- Change from: `console.log("Usage: hlx library show <ref>");`
- Change to: A multi-line help text that includes:
  - Usage line: `hlx library show <ref> [--full]`
  - A description of the `--full` flag (e.g., "Include the full markdown body after the TOC")

Follow the same help text style used by other subcommands in the file.

**Verification (AI Agent Runs)**:
- Run `npm run typecheck` — should pass.
- Read the modified file to confirm the help text includes `[--full]` and a flag description.

**Success Criteria**:
- `hlx library show --help` output includes `[--full]` in the usage line
- A description of `--full` is present in the help output

### Step 3: Update top-level usage text

**Goal**: Mention `--full` in the top-level `hlx --help` usage block.

**What to Build**:

In `src/index.ts`, update the usage line for library show (line 55):
- Change from: `hlx library show <ref>          Show report with section annotations`
- Change to: `hlx library show <ref> [--full]   Show report with section annotations`

Keep alignment with surrounding lines.

**Verification (AI Agent Runs)**:
- Run `npm run typecheck` — should pass.
- Read the modified file to confirm the usage line includes `[--full]`.

**Success Criteria**:
- Top-level usage text for `hlx library show` includes `[--full]`
- Line alignment is consistent with surrounding lines

### Step 4: Update skill documentation

**Goal**: Document `--full` in the CLI skill reference so that `hlx skill show` includes it.

**What to Build**:

In `skill-content/references/commands.md`, update the `### hlx library show` section (lines 300-308):
1. Update the code block to show `hlx library show <ref> [--full]`
2. Add a flags table (following the pattern used by `hlx library comments list` and `hlx library comments post` sections):
   - `--full` flag with description: prints the full markdown body after the TOC

**Verification (AI Agent Runs)**:
- Read the modified file to confirm the code block and flag table are present.

**Success Criteria**:
- Code block shows `hlx library show <ref> [--full]`
- A flag table documents `--full` with a description
- Existing description text is preserved

### Step 5: Build and verify

**Goal**: Confirm the full change set compiles and existing tests pass.

**What to Build**: No code changes — this is a verification-only step.

**Verification (AI Agent Runs)**:
1. Run `npm run build` — should compile with zero errors.
2. Run `npm test` — existing tests (flags, resolve-ticket, skill, update) should pass.

**Success Criteria**:
- `tsc` exits with code 0
- All existing test suites pass

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js >= 18 installed | available | package.json `engines` field; sandbox environment | CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, CHK-06 |
| npm dependencies installed (`npm install`) | available | Can be run in sandbox | CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, CHK-06 |
| Environment variables `HELIX_API_KEY` and `HELIX_URL` written to `.env` | available | Dev setup configuration provides values | CHK-05, CHK-06 |
| Network access to Helix staging API (`helix-global-server-staging-3tl6o.ondigitalocean.app`) | unknown | Required for live CLI execution; staging API availability is not guaranteed | CHK-05, CHK-06 |
| At least one library item exists on the staging API | unknown | Required for `hlx library show <ref>` to return content; cannot verify without API access | CHK-05, CHK-06 |

### Required Checks

[CHK-01] TypeScript compilation succeeds
- Action: Run `npm run build` in the helix-cli repository root.
- Expected Outcome: `tsc` exits with code 0 and produces compiled files in `dist/` with no type errors.
- Required Evidence: Terminal output of `npm run build` showing successful completion with exit code 0.

[CHK-02] Existing tests pass
- Action: Run `npm test` in the helix-cli repository root.
- Expected Outcome: All existing test suites (flags, resolve-ticket, skill, update) pass with zero failures.
- Required Evidence: Terminal output of `npm test` showing all tests passing and exit code 0.

[CHK-03] Help text documents --full flag
- Action: Run `node dist/index.js library show --help` after building.
- Expected Outcome: The help output includes `[--full]` in the usage line and a description of the flag's purpose.
- Required Evidence: Terminal output of the help command showing both `[--full]` in the usage line and a description of the --full flag.

[CHK-04] Skill documentation updated
- Action: Read `skill-content/references/commands.md` and locate the `### hlx library show` section.
- Expected Outcome: The section contains an updated code block showing `hlx library show <ref> [--full]` and a flags table with `--full` described.
- Required Evidence: File content of the `### hlx library show` section showing the code block with `[--full]` and a flag table entry for `--full`.

[CHK-05] Default output unchanged (no --full flag)
- Action: Write the `.env` file with the provided `HELIX_API_KEY` and `HELIX_URL` values. Run `node dist/index.js library list` to identify an available library item, then run `node dist/index.js library show <ref>` (without `--full`) against a real library item ref.
- Expected Outcome: The output shows the title/ID header and annotated section headings (TOC) only. No markdown body content or `---` separator is printed.
- Required Evidence: Terminal output of the command showing only the heading/TOC lines, without a `---` separator or body content.

[CHK-06] --full flag prints full markdown body
- Action: Using the same library item ref from CHK-05, run `node dist/index.js library show <ref> --full` against the staging API.
- Expected Outcome: The output includes (1) the title/ID header, (2) annotated section headings (TOC), (3) a `---` separator, and (4) the full markdown body of the report.
- Required Evidence: Terminal output of the command showing the TOC section followed by `---` followed by markdown body content that includes non-heading text (paragraphs, code blocks, lists, etc.).

## Success Metrics

- All 4 acceptance criteria met: `--full` prints body, default unchanged, help text updated, skill docs updated.
- TypeScript compiles cleanly.
- All existing tests pass.
- Change limited to 4 files with approximately 15 lines of logic and 20 lines of documentation.
- No new dependencies added.
- No existing behavior altered.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem statement and acceptance criteria | Four acceptance criteria: --full prints body, default unchanged, help updated, skill docs updated |
| scout/reference-map.json | File inventory and key facts | Content already fetched at show.ts:24; _args unused; hasFlag pattern at 7+ sites; 4 files to change |
| scout/scout-summary.md | Boundary map and analysis | Narrow change surface; content in memory but only headings printed; established flag pattern |
| diagnosis/diagnosis-statement.md | Root cause and implementation scope | Deliberate design omission at line 62; _args param ready; no new API calls needed |
| diagnosis/apl.json | Diagnostic answers with evidence | Body discarded with explicit comment; args plumbing in place; null guard sufficient |
| product/product.md | Product spec with scenarios | SCN-01: TOC followed by full body; stretch goals out of scope; 5 scenarios defined |
| tech-research/tech-research.md | Architecture decisions and technical details | Option A (hasFlag pattern) chosen; TOC-then-body output; separator format `\n---\n`; 4-file change set |
| tech-research/apl.json | Technical answers with evidence | Append body after TOC; reuse existing fetch; null guard sufficient; stretch goals deferred |
| repo-guidance.json | Repo intent classification | helix-cli is sole target repo; no cross-repo changes |
| src/library/show.ts | Direct source inspection | Confirmed _args param (line 23), null guard (lines 27-30), TOC-only loop (lines 43-64), content in memory |
| src/library/index.ts | Direct source inspection | Help text at line 39; rest args passed to cmdShow at line 44 |
| src/index.ts | Direct source inspection | Usage text at line 55 for library show |
| src/lib/flags.ts | Direct source inspection | hasFlag is `args.includes(flag)` — simple, tested |
| skill-content/references/commands.md | Direct source inspection | Lines 300-308 document show without flags; nearby sections show flag table pattern |
| package.json | Build/test scripts | Build: tsc; Test: tsc && node --test; no lint |
