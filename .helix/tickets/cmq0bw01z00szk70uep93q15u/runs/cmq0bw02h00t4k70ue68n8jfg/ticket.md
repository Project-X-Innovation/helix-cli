# Ticket Context

- ticket_id: cmq0bw01z00szk70uep93q15u
- short_id: BLD-675
- run_id: cmq0bw02h00t4k70ue68n8jfg
- run_branch: helix/build/BLD-675-playbook-foundation-rule-data-model-crud-api-and
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook foundation — rule data model, CRUD API, and management UI

## Description
# Ticket: Playbook foundation — rule data model, CRUD API, and management UI

## Summary
Add a new "Playbook" feature: a typeless, plain-language business-rule entity with full CRUD and a management UI (list, create, detail with edit/activate/delete), plus a sibling table to hold check results for a later ticket. There is no live-data-check behavior in this ticket — the Check action is present but disabled.

## Why
The Playbook lets a user write a business rule in plain English and later check it against live NetSuite data. This ticket builds the structural foundation (data model, service, API, UI) that the check engine (later tickets) populates. It mirrors the existing Library module almost 1:1.

## Decisions Already Made
- A rule has no "type". There is no Constraint/Workflow/Monitor concept. One kind of rule only.
- Rule fields: `summary` (plain-language rule text), `status` (DRAFT or ACTIVE), `domain` (optional tag), `source` (USER_CREATED).
- Two tables are created in one additive migration: `PlaybookRule` and `PlaybookRuleCheck`. This ticket writes only `PlaybookRule`; `PlaybookRuleCheck` is created but receives no writes here.
- Status lifecycle is DRAFT -> ACTIVE only. No reverse transition.
- Only DRAFT rules may be deleted.
- UI follows the Library module pattern: flat list + detail page, lazy routes. No hierarchy/tree/breadcrumbs.
- The Check button exists on the detail page but is disabled in this ticket (wired in a later ticket).

## Do Not Re-Decide
- Do not add a `type` column or enum. Do not add `detail` or `parentId`. Do not add hierarchy UI.
- Do not implement the live data check, the PLAYBOOK_CHECK run mode, or any ns-gm querying here.
- Do not write to `PlaybookRuleCheck` in this ticket.

## Non-Negotiable Invariants
- The `PlaybookRule` model must contain exactly: id, organizationId, summary, status, domain (nullable), source, latestCheckId (nullable), createdAt, updatedAt. Do not add fields not listed.
- All rule queries must be organization-scoped. A rule must only be readable/writable by its owning organization.
- `createRule` must set status=DRAFT and source=USER_CREATED.
- `updateRule` must allow only the DRAFT -> ACTIVE status transition; it must reject every other status transition with HttpError 400.
- `deleteRule` must reject any rule whose status is not DRAFT with HttpError 400.
- The migration must be additive only (new tables + enum). It must not alter or drop existing tables.

## In Scope
- Server: Prisma schema additions (`PlaybookRule`, `PlaybookRuleCheck`, `PlaybookRuleStatus` enum DRAFT/ACTIVE), one migration, `src/services/playbook-service.ts` (listRules, getRule, createRule, updateRule, deleteRule), HTTP routes in `src/routes/api.ts`: GET /playbook/rules, GET /playbook/rules/:ruleId, POST /playbook/rules, PATCH /playbook/rules/:ruleId, DELETE /playbook/rules/:ruleId. Zod validation in the controller. Org platform exposed to the client via the existing org context.
- Client: `src/api/playbook.ts` (types + TanStack Query hooks following `src/api/library.ts`), `src/types/api.ts` const-as-enum `PlaybookRuleStatus`, sidebar nav item between Pipeline and Library, routes `/playbook`, `/playbook/new`, `/playbook/:ruleId` lazy-loaded in `src/App.tsx`, pages for list / new / detail with edit, activate (DRAFT only), delete (DRAFT only, confirm dialog). Check button rendered disabled.
- CLI: include `helix-cli` repo for end-to-end verification; `hlx playbook list` and `hlx playbook create` are optional, not required for acceptance.

## Out of Scope
- The live data check, PLAYBOOK_CHECK mode, query fragments, ns-gm querying, result ingestion.
- Check results UI / interpretation / examples display.
- UI flair / design-language polish.
- Any monitoring, inference, MCP tools, hierarchy, or notifications.
- Writing to `PlaybookRuleCheck`.

## Required Behavior
- A user can create a rule with summary (required) and domain (optional); it appears in the list in DRAFT.
- A user can open a rule, edit its summary/domain, activate it (DRAFT->ACTIVE), and delete it (DRAFT only).
- The list shows each rule's summary, status, and a "last check" placeholder ("never") since no checks exist yet.
- The Check button is visibly disabled with no behavior.

## Failure Behavior
- Invalid create/update payloads (missing summary, invalid status transition) must return HttpError 400 and must not persist partial state.
- Deleting a non-DRAFT rule must return HttpError 400 and must not delete.
- A rule lookup for a different org must return HttpError 404. Do not leak cross-org rows.

## Batch / Cardinality Rules
- All operations are single-rule, single-org. No batch operations in this ticket.

## Persistence / Artifact Rules
- The migration file is the source of truth for schema. It must create both tables and the enum.
- No rows are written to `PlaybookRuleCheck` in this ticket.

## Acceptance Criteria
- Creating, listing, reading, editing, activating, and deleting a rule works end-to-end across server and client.
- `PlaybookRule` has exactly the specified fields; there is no `type`, `detail`, or `parentId` anywhere.
- An attempt to set any status transition other than DRAFT->ACTIVE returns 400.
- An attempt to delete a non-DRAFT rule returns 400.
- The Check button renders disabled and triggers no request.
- The migration applies cleanly and is additive only.
- Negative: the system must not expose rules across organizations; must not write to PlaybookRuleCheck; must not add a rule type.

## Attachments
- (none)
