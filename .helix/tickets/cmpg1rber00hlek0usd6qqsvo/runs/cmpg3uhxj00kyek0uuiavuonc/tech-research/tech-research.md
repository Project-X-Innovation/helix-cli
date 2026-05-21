# Tech Research — BLD-556: hlx library show --full

## Technology Foundation

- **Language/Runtime**: TypeScript compiled with `tsc`, executed via Node.js
- **Build**: `tsc` (no bundler, no lint, no CI workflow files)
- **Test**: `tsc && node --test dist/**/*.test.js` using `node:test` + `node:assert`
- **CLI Architecture**: Hand-rolled arg-parsing via `src/lib/flags.ts` utilities (`hasFlag`, `getFlag`, `isHelpRequested`, `getPositionalArgs`, `requireFlag`). No external CLI framework (no yargs, commander, etc.)
- **HTTP**: Custom `hxFetch()` wrapper in `src/lib/http.ts`
- **No database, ORM, or state management** — pure CLI tool

## Architecture Decision

### Decision 1: Flag implementation pattern

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. `hasFlag(args, '--full')` | Use established codebase pattern from `src/lib/flags.ts` | Consistent with 7+ existing flag sites; zero new dependencies; well-tested utility | None meaningful |
| B. External CLI framework (yargs, commander) | Adopt a flag parsing library | Rich feature set | Massive scope creep; inconsistent with entire existing codebase; new dependency |

**Chosen: Option A** — Use `hasFlag(args, '--full')`. The codebase consistently uses this pattern across `--json`, `--dry-run`, `--archived`, `--force`, `--current` (evidence: `src/tickets/list.ts:45`, `src/tickets/continue.ts:30`, `src/skill/install.ts:28`, `src/token/add.ts:36`). The `_args` parameter in `cmdShow` (show.ts:23) already receives the CLI args array from the router (library/index.ts:44) — it just needs to be renamed from `_args` to `args`.

**Rationale**: Minimal change, zero new dependencies, follows every existing precedent in the codebase.

### Decision 2: Output structure when --full is set

**Options considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. TOC then separator then full body | Print annotated headings, then `---`, then raw markdown body | Both views in one output; matches ticket's "TOC + full markdown body" language | Slight duplication (headings appear in both TOC and body) |
| B. Full body replaces TOC | When --full is set, skip the TOC loop entirely and just print raw markdown | No duplication | Loses the annotation value (slugs, comment counts) that the TOC provides |
| C. Interleaved: annotated headings with body text between them | Merge heading annotations into the raw body | Single-pass, no duplication | Alters the markdown structure; breaks piping; complex implementation |

**Chosen: Option A** — TOC first, then separator, then full body. The ticket explicitly says `# TOC + full markdown body` and the product spec SCN-01 says "prints the TOC section followed by the full markdown body." The slight heading duplication is acceptable because the TOC provides unique value (slug annotations and comment summaries) that the raw body does not.

**Rationale**: Directly matches the specified behavior from both ticket and product spec. The separator (`---`) provides a clear visual boundary. The duplication is a feature, not a bug — the annotated TOC serves as a navigation index for the full body that follows.

### Decision 3: Separator format

Use a horizontal rule with padding: `\n---\n`. This is idiomatic markdown, visually distinct, and does not interfere with piping or downstream parsing.

### Decision 4: No additional API call needed

The existing `hxFetch` call at `show.ts:24` already returns the complete `LibraryItemDetail` with `item.content: string | null`. The content is in memory after the existing fetch — the handler simply does not print it. The `--full` flag gates a `console.log(item.content)` call after the TOC loop. No conditional fetching, no lazy loading, no new endpoints.

## Core API/Methods

| Method/Utility | Location | Role in change |
|----------------|----------|----------------|
| `hasFlag(args, flag)` | `src/lib/flags.ts:11-13` | Detects `--full` boolean flag in args array |
| `cmdShow(config, resolvedId, args)` | `src/library/show.ts:23` | Main handler — rename `_args` to `args`, add conditional body print |
| `hxFetch(config, path, opts)` | `src/lib/http.ts` | Already fetches full content — no changes needed |
| `isHelpRequested(args)` | `src/lib/flags.ts:24-26` | Already used in library/index.ts for --help detection — no changes needed |

## Technical Decisions

### TD-1: Rename `_args` to `args` in cmdShow signature

The function signature at `show.ts:23` is `cmdShow(config, resolvedId, _args: string[])`. The underscore prefix is a TypeScript convention for unused parameters. Renaming to `args` signals intent to use it and enables `hasFlag(args, '--full')`. No callers need updating — the router at `library/index.ts:44` already passes `rest` as the third argument.

### TD-2: Import hasFlag in show.ts

Add `import { hasFlag } from "../lib/flags.js";` to `show.ts`. This follows the established pattern (e.g., `src/tickets/list.ts:3`, `src/tickets/continue.ts:3`, `src/skill/install.ts:10`).

### TD-3: Print full body after TOC loop, gated by --full

After the existing for-loop (lines 45-64), add:

```
if (hasFlag(args, '--full')) {
  console.log('\n---\n');
  console.log(item.content);
}
```

This placement ensures:
- The TOC always prints first (annotated headings + comment summaries)
- The separator visually divides the two sections
- The raw markdown body follows in full

### TD-4: Help text updates in three locations

1. **`src/library/index.ts:39`** — Expand the show help to include `[--full]` and a description line
2. **`src/index.ts:55`** — Update the usage line to mention `[--full]`
3. **`skill-content/references/commands.md:300-308`** — Add flag table and description for `--full`

### TD-5: Stretch goals explicitly deferred

`--body-only` and `--out <path>` are deferred per product spec. If added later:
- `--body-only` would use `hasFlag(args, '--body-only')` to skip the TOC loop and print only `item.content`
- `--out` would use `getFlag(args, '--out')` to get the path and `writeFileSync` to write content to disk

These are architecturally trivial extensions of the same pattern and do not affect the current MVP design.

### TD-6: No new test file for library commands

No test files exist under `src/library/`. The product spec acknowledges this as a pre-existing gap. Adding a full test harness for the library module is out of scope for this ticket (the change is a simple flag gate on existing data). The `hasFlag` utility itself is already tested in `src/lib/flags.test.ts`.

**Rejected alternative**: Creating `src/library/show.test.ts` — would require mocking `hxFetch` and the module boundary, which is disproportionate to the trivial logic being added (a single `if` + `console.log`).

## Technical Checks

[TCK-01] --full flag detection uses hasFlag pattern
- Decision Reference: "Use hasFlag(args, '--full') from src/lib/flags.ts"
  (from Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `show.ts` imports `hasFlag` from `../lib/flags.js` and calls `hasFlag(args, '--full')`. The `_args` parameter is renamed to `args`.

[TCK-02] Full body printed after TOC with separator
- Decision Reference: "Print TOC then separator then full body"
  (from Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: When `--full` is set, `console.log` outputs a `---` separator followed by `item.content` after the heading-parsing loop. The existing TOC loop remains unchanged.

[TCK-03] Default behavior unchanged without --full
- Decision Reference: "Additive-only change gated by --full flag"
  (from Architecture Decision 1 and 2)
- Verification Method: code-inspection
- Expected Evidence: The existing for-loop and heading rendering logic (lines 45-64 in current source) are not modified. The new body-printing block is conditional on `hasFlag(args, '--full')`.

[TCK-04] Help text documents --full in all required locations
- Decision Reference: "Help text updates in three locations"
  (from TD-4)
- Verification Method: code-inspection
- Expected Evidence: (1) `src/library/index.ts` show help includes `[--full]` with description, (2) `src/index.ts` usage line for library show mentions `--full`, (3) `skill-content/references/commands.md` library show section documents `--full` flag.

[TCK-05] Null content handled gracefully with --full
- Decision Reference: "Existing null-content guard is sufficient"
  (from APL answer 3)
- Verification Method: code-inspection
- Expected Evidence: The early return at lines 27-30 (`if (!item.content)`) exits before both the TOC loop and the `--full` body print. No separate null guard is needed in the new code path.

## Cross-Platform Considerations

Not applicable. This is a Node.js CLI tool. `console.log` and string operations are platform-agnostic. No filesystem writes, no OS-specific APIs, no native modules.

## Performance Expectations

- **No performance impact**: The `--full` flag gates a single `console.log(item.content)` call on data already in memory. No additional network requests, no parsing overhead, no pagination.
- **Large reports**: The full body is a single `console.log` call. Node.js stdout handles multi-megabyte strings efficiently. No evidence of reports large enough to cause issues.

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `src/lib/flags.ts` (`hasFlag`) | Internal utility | Already exists, already tested, already used by 7+ commands |
| `/api/library/items/:id` endpoint | External API | Already called by existing handler; returns `item.content` |
| `node:test` + `node:assert` | Test framework | Already used by existing tests; no new test file needed for MVP |

**No new external dependencies.** No npm packages added. No API changes required.

## Deferred to Round 2

| Item | Reason | Complexity if added later |
|------|--------|--------------------------|
| `--body-only` flag | Product spec defers; ticket marks as stretch | Trivial — `hasFlag` + skip TOC loop |
| `--out <path>` flag | Product spec defers; ticket marks as stretch | Low — `getFlag` + `writeFileSync` |
| Library module test file | Pre-existing gap; no tests exist for any library command | Medium — requires hxFetch mocking setup |
| `src/docs/cli-content.ts` update | Pre-existing gap; library not documented there | Low — add library section to embedded docs |

## Summary Table

| Aspect | Detail |
|--------|--------|
| **Change type** | Additive feature — new `--full` flag |
| **Files changed** | 4: `src/library/show.ts`, `src/library/index.ts`, `src/index.ts`, `skill-content/references/commands.md` |
| **Lines of code (est.)** | ~15 lines of logic + ~20 lines of docs |
| **New dependencies** | None |
| **New API calls** | None — content already fetched |
| **Breaking changes** | None — default output unchanged |
| **Risk level** | Very low — single conditional gate on existing data |
| **Pattern** | `hasFlag(args, '--full')` — same as 7+ existing flags |

## APL Statement Reference

The technical direction is to add a `--full` flag to `cmdShow` in `src/library/show.ts` using the established `hasFlag()` pattern. When set, the handler prints the existing TOC output followed by a `---` separator and the full `item.content` markdown body. No new API calls, dependencies, or architectural changes are needed. The content is already fetched and in memory. Four files require changes: `show.ts` (flag logic + body rendering), `library/index.ts` (help text), `src/index.ts` (usage text), and `skill-content/references/commands.md` (documentation). Stretch goals (`--body-only`, `--out`) are deferred per product spec.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem statement and acceptance criteria | Four acceptance criteria: --full prints body, default unchanged, help updated, skill docs updated |
| scout/reference-map.json | File inventory, key facts, unknowns | Confirmed content already fetched at show.ts:24, _args unused at :23, hasFlag pattern at 7+ sites |
| scout/scout-summary.md | Boundary map and analysis summary | Narrow 4-file change surface; content in memory; established flag pattern |
| diagnosis/apl.json | Answered diagnostic questions with evidence | Body discarded at line 62 with explicit comment; args plumbing in place; null guard sufficient |
| diagnosis/diagnosis-statement.md | Root cause analysis and implementation scope | Deliberate design omission; no new API calls; 4-file change set confirmed |
| product/product.md | Product spec with scenarios and scope | SCN-01 specifies "TOC followed by full body"; stretch goals explicitly out of scope |
| repo-guidance.json | Repo intent classification | helix-cli is sole target repo; no cross-repo changes |
| src/library/show.ts | Direct source inspection | Confirmed _args param, null guard, TOC-only rendering loop, content in memory |
| src/lib/flags.ts | Direct source inspection | hasFlag is `args.includes(flag)`; getFlag extracts value flags; both well-tested |
| src/library/index.ts | Direct source inspection | Help text at line 39; rest args passed to cmdShow at line 44 |
| src/index.ts | Direct source inspection | Usage text at line 55 for library show |
| skill-content/references/commands.md | Direct source inspection | Lines 300-308 document show command without flags |
| src/lib/flags.test.ts | Test pattern reference | node:test + node:assert; describe/it structure; hasFlag and getFlag both tested |
