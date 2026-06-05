# Ticket Context

- ticket_id: cmq0bwger00trk70ucyy82w2v
- short_id: BLD-679
- run_id: cmq0bwgf300twk70ugtp9828m
- run_branch: helix/build/BLD-679-playbook-ui-polish-and-flair
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook UI polish and flair

## Description
# Ticket: Playbook UI polish and flair

## Summary
Apply the helix-ns-lp landing-page design language across the Playbook surface — serif "nice field" authoring input, warm-neutral + teal palette, semantic result coloring, cascade/reveal animation, and refined empty/loading/status states — without changing any behavior or data flow.

## Why
The functional tickets prioritize correctness and verifiability and ship plain UI. This pass brings the Playbook up to the product's visual standard in one coherent sweep.

## Decisions Already Made
- The design language source of inspiration is the helix-ns-lp repo: warm neutrals (surface #F8F7F5, border #E8E5E1), deep teal #0D7377 primary, semantic mint=passing / clay=violations, Source Serif for the rule text, cascade-in stagger, reveal-on-scroll.
- This ticket is presentation-only. No behavior, routes, endpoints, or data shapes change.

## Do Not Re-Decide
- Do not change any API, hook, route, or DB behavior.
- Do not add new features, fields, or states.
- Do not add the org-wide monitoring ticker (future).

## Non-Negotiable Invariants
- This ticket must not alter network calls, state logic, routing, or persisted data. Only styling, markup, and animation may change.
- Styling must use Tailwind v4 utilities per the client CLAUDE.md (no CSS files; no inline styles where the codebase forbids them).
- All existing behavior and acceptance criteria from the foundation and check-UI tickets must continue to pass unchanged.

## In Scope
- Client only: authoring field restyle (serif, warm surface, teal focus), list page polish (status badges, spacing, empty state), detail page rule echo card, result status band semantic coloring (mint passing / clay violations), collapsible section styling, example table styling, cascade-in stagger on evidence rows, reveal-on-scroll, refined loading/empty/error visuals.

## Out of Scope
- Server, CLI, schema; any behavioral change; new components beyond styling wrappers; the monitoring ticker.

## Required Behavior
- The Playbook list, new, and detail/result screens reflect the design language while behaving identically to the prior tickets.

## Failure Behavior
- If a visual treatment would require a behavioral change, do not make it; leave behavior intact.

## Batch / Cardinality Rules
- Not applicable (presentation only).

## Persistence / Artifact Rules
- No persistence changes.

## Acceptance Criteria
- The Playbook screens match the described design language.
- All foundation and check-UI behavioral acceptance criteria still pass.
- Negative: no API/hook/route/schema changes; no new features; no behavioral diffs.

## Attachments
- (none)
