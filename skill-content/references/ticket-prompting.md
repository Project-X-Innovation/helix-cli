# Helix Ticket Authoring Guide

## Core Rule

Every Helix ticket must be a self-contained contract. The ticket must state what the system must do, what it must not do, and what happens when something fails. Do not leave decisions open for the implementing agent to resolve at build time. Resolve all open questions with the user before drafting. Never include an `Open Questions` section in the final ticket.

Scope boundaries must be explicit. Name the files, APIs, and behaviors that are in scope. Name those that are out of scope. If a behavior is borderline, place it explicitly in one list.

Invariants must use hard-constraint language: `must`, `must not`, `do not`, `copy verbatim`, `only`, `exactly`, `fail closed`. Do not use soft language for invariants: avoid `can`, `should`, `ideally`, `we prefer`, `as needed`.

Failure behavior must be defined. State what happens when a prerequisite is missing, a network call fails, or validation rejects input. The default posture is fail closed: if a hard prerequisite fails, the workflow must stop.

Batch and cardinality semantics must be explicit. If the ticket involves multiple entities (tickets, repos, files), state whether the operation applies per-entity or in aggregate. Do not use singleton shortcuts (`ticketIds[0]`, `latest run across all selected tickets`) as proxies for multi-entity work.

Source-of-truth files must be named. If a file is canonical, say so: `src/deploy.xml is the source of truth for deploy scope`. Do not leave the implementing agent to infer which file to trust.

Already-decided tradeoffs must be stated in the ticket. If a decision was made during research or conversation, record it so the agent does not re-decide.

## Required Ticket Structure

Every ticket must contain exactly these headers in this order:

```
# Ticket: <title>

## Summary
## Why
## Decisions Already Made
## Do Not Re-Decide
## Non-Negotiable Invariants
## In Scope
## Out of Scope
## Required Behavior
## Failure Behavior
## Batch / Cardinality Rules
## Persistence / Artifact Rules
## Acceptance Criteria
```

Keep `Failure Behavior` and `Batch / Cardinality Rules` for infrastructure, deployment, queue, workflow, and state-machine work. For simple feature tickets, these sections may be brief but must not be omitted.

## How To Draft

1. **Separate settled from open.** List decisions that are final under `Decisions Already Made` and `Do Not Re-Decide`. Anything not settled must be resolved before the ticket is filed.

2. **Turn fragile requirements into must / must not.** Replace "Try to keep the response under 1000 characters" with "The response must not exceed 1000 characters. If the content exceeds the limit, truncate at the last complete sentence before the limit."

3. **Forbid post-failure state transitions.** If a step fails, the workflow must not advance to the next step. State this explicitly: "If validation fails, do not proceed to deployment. Write a failure artifact and exit."

4. **State cardinality for multi-entity flows.** "For each selected ticket, generate one deploy manifest. Do not generate a single manifest covering all tickets."

5. **Name exact source-of-truth files.** "The deploy scope is defined by `src/deploy.xml`. Copy it verbatim. Do not regenerate it from package contents."

6. **Add negative acceptance criteria.** "The system must not create a deploy artifact when the baseline commit is missing." Negative criteria catch silent failures that positive criteria miss.

## Common Failure Modes

### 1. Scope expansion

The implementing agent fixes related issues it discovered while working on the ticket.

**Example:** A ticket asks to fix the date format on the dashboard. The agent also refactors the date utility and updates three unrelated components. The fix is correct, but the PR is unreviewable.

**Prevention:** Add to `Out of Scope`: "Do not modify components outside the dashboard date display. Do not refactor shared utilities."

### 2. Over-optimization

The agent rewrites canonical files instead of copying them.

**Example:** A ticket says to add a field to the deploy config. The agent regenerates the entire config from inferred state instead of copying the canonical file and adding the field.

**Prevention:** "Copy `src/deploy.xml` verbatim. Do not regenerate the file from package contents or inferred state."

### 3. Fail-open

A hard prerequisite fails silently and the workflow continues.

**Example:** The baseline commit is missing from the repository. Instead of aborting, the agent guesses a baseline and proceeds with deployment.

**Prevention:** "Fail closed: if the baseline commit is missing, abort the deploy workflow. Write a failure artifact with the reason. Do not fall back to a guessed baseline."

### 4. Batch/cardinality

The agent uses singleton shortcuts for multi-entity work.

**Example:** A ticket processes three repos. The agent uses `repos[0]` to test the logic and ships it, leaving repos 1 and 2 unprocessed.

**Prevention:** "For each repository in the selected set, run the full pipeline independently. Do not use `repos[0]` or `selectedRepos.at(-1)` as a proxy for the full set."

### 5. Domain vocabulary drift

The agent conflates platform terms that have distinct meanings.

**Example:** The agent treats "SDF AccountConfiguration" as equivalent to "SDF Objects" and deploys configuration changes through the object pipeline.

**Prevention:** "SDF AccountConfiguration is not the same as SDF Objects. AccountConfiguration uses `sdfcli deploy` with a configuration manifest. Objects use `sdfcli deploy` with an object manifest. Do not route AccountConfiguration changes through the Objects pipeline."

## Deployment / SDF Checklist

- Canonical files are the source of truth for deploy scope. Do not infer deploy scope from directory listings or package contents.
- Copy `src/deploy.xml` verbatim into the deploy package. Do not generate `deploy.xml` from inferred state unless a fallback generation strategy is explicitly defined in the ticket.
- Package contents define the deploy scope. Only files listed in the manifest are deployed.
- A missing baseline commit is a hard failure. Do not fall back to a guessed baseline. Abort the workflow and write a failure artifact.
- A dirty working tree is a hard failure. Do not auto-stash or ignore uncommitted changes. Abort and report.
- Production deploys must use exact stored base and head commit metadata. Do not resolve "latest" at deploy time.
- Multi-ticket deploys must produce per-ticket or per-repo manifests, or a single aggregate manifest with per-ticket attribution. Do not collapse multiple tickets into an unlabeled aggregate.
- Failed deploys must write a failed deploy artifact containing the failure reason, the deploy manifest used, and the point of failure. Do not silently discard the failure.

## Good / Bad Prompt Patterns

**Good patterns:**

- `Do not redesign this flow.`
- `Copy the canonical file verbatim.`
- `Fail closed: if the baseline is missing, abort.`
- `For each ticket, generate one artifact. Do not merge across tickets.`
- `The source of truth for deploy scope is src/deploy.xml.`
- `Do not add, remove, or rename any fields not specified in this ticket.`

**Bad patterns:**

- `Implement this however makes the most sense.`
- `Feel free to improve related areas while you're there.`
- `Use the latest successful run to determine production deploy scope.`
- `Handle errors appropriately.`
- `Should work for most cases.`
- `Ideally keep it under the limit, but it's okay if it goes over.`

## Draft Review Checklist

Before filing the ticket, verify:

- [ ] All decisions are recorded as settled. No open questions remain in the ticket.
- [ ] The ticket says what Helix must not do, not only what it must do.
- [ ] Source-of-truth files are named explicitly.
- [ ] Scope is constrained: `In Scope` and `Out of Scope` are both populated.
- [ ] Artifact behavior is explicit: what artifacts are produced, where they are written, and what they contain.
- [ ] Failure behavior is explicit: what happens on each failure mode, and post-failure state transitions are forbidden.
- [ ] Silent fallbacks are forbidden. Every fallback is either explicit or absent (fail closed).
- [ ] Cardinality and batch semantics are explicit for multi-entity work.
- [ ] Singleton shortcuts are forbidden: no `ticketIds[0]`, `latest run across all selected tickets`, or `repos.at(-1)` as proxies.
- [ ] Platform terms are exact: SDF AccountConfiguration vs Objects, deploy manifest vs object manifest, ticket vs run vs step.
- [ ] Negative acceptance criteria are present: the ticket says what must not happen.
- [ ] No `Open Questions` section exists in the final ticket.
