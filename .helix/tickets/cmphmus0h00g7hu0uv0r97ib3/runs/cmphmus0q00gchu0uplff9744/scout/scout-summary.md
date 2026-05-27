# Scout Summary: T7 CLI Goals Namespace

## Problem

Add `hlx goals` CLI command namespace with 4 commands (create, list, get, terminate) to helix-cli. These commands call existing server API endpoints at `/api/goals`. Goals are a separate entity from tickets -- VALID_MODES and existing ticket commands must not be modified.

## Analysis Summary

**Target repo**: helix-cli (primary and only repo requiring changes).

The helix-cli repository follows a consistent command namespace pattern: each namespace has a directory under `src/` with an `index.ts` router file and individual command files. The `src/goals/` directory does not exist and must be created from scratch.

All 11 server-side Goal API endpoints are already implemented and registered in helix-global-server (goal-controller.ts, api.ts:436-447). The CLI commands are thin wrappers around these API calls using the shared `hxFetch` client.

**New files needed** (following existing patterns):
- `src/goals/index.ts` -- namespace router (`runGoals`)
- `src/goals/create.ts` -- `hlx goals create` (POST /api/goals)
- `src/goals/list.ts` -- `hlx goals list` (GET /api/goals)
- `src/goals/get.ts` -- `hlx goals get` (GET /api/goals/:id)
- `src/goals/terminate.ts` -- `hlx goals terminate` (POST /api/goals/:id/terminate)

**Existing files to modify**:
- `src/index.ts` -- add `goals` case to command switch (import `runGoals`, register case)
- `src/docs/cli-content.ts` -- add Goals section to documentation

**Key patterns to follow**:
- `src/tickets/index.ts` for router structure (switch on subcommand, help text, config passthrough)
- `src/tickets/create.ts` for create command (requireFlag, resolveAllRepos, POST body, structured output)
- `src/tickets/list.ts` for list command (query params, formatted table output)
- `src/tickets/get.ts` for detail command (printGoalDetail, formatted console output)
- All API calls use `hxFetch(config, path, { basePath: "/api", ... })`

**Key constraints**:
- VALID_MODES at `src/tickets/create.ts:13` stays at 5 values (AUTO, BUILD, FIX, RESEARCH, EXECUTE)
- Zero runtime dependencies -- all code is plain TypeScript with node built-ins
- ES modules with `.js` extensions in imports
- Strict TypeScript mode

**Quality gates**: `npm run typecheck` (tsc --noEmit), `npm run build` (tsc), `npm run test` (tsc + node --test).

## Relevant Files

| File | Role | Lines |
|------|------|-------|
| `src/index.ts` | Main entry point, command router | 152 |
| `src/tickets/index.ts` | Reference: namespace router pattern | 150 |
| `src/tickets/create.ts` | Reference: create command pattern, VALID_MODES (line 13) | 185 |
| `src/tickets/list.ts` | Reference: list command pattern | 115 |
| `src/tickets/get.ts` | Reference: get/detail command pattern | 125 |
| `src/lib/http.ts` | Shared HTTP client (hxFetch) | 135 |
| `src/lib/flags.ts` | Shared flag parsing utilities | 36 |
| `src/lib/config.ts` | HxConfig type definition | 222 |
| `src/lib/resolve-repo.ts` | Repository name/ID resolution | 81 |
| `src/docs/cli-content.ts` | CLI documentation content | 350 |
| `package.json` | Build scripts, ES module config | 44 |
| `tsconfig.json` | TypeScript strict config | 15 |

**Server-side (context only, no changes needed)**:

| File | Role |
|------|------|
| `helix-global-server/src/controllers/goal-controller.ts` | Goal API handlers with Zod schemas |
| `helix-global-server/src/routes/api.ts:436-447` | Goal route registration |
| `helix-global-server/prisma/schema.prisma:155-165` | GoalStatus enum (9 values) |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report, Section 8) | Primary specification for T7 CLI commands | 4 commands (create, list, get, terminate) with exact flag specs; VALID_MODES unchanged; docs update required |
| ticket.md (Research Report, Section 5) | API endpoint specification | 11 endpoints at /api/goals with request/response shapes |
| ticket.md (Section 13, T7 description) | T7 deliverables checklist | src/goals/ directory, 4 command files, index.ts registration, docs update |
| helix-cli/src/index.ts | Command registration pattern | Switch-based routing, configOrHelp, usage text |
| helix-cli/src/tickets/ | Full command implementation patterns | Router index.ts, create/list/get patterns, flag parsing, API calls |
| helix-cli/src/lib/ | Shared utilities | hxFetch (basePath: "/api"), getFlag/requireFlag/hasFlag, resolveAllRepos, HxConfig type |
| helix-cli/src/docs/cli-content.ts | Documentation structure | Exported object with markdown content, command tables, worked examples |
| helix-global-server/src/controllers/goal-controller.ts | Server API response shapes | { goal } for single, { items } for lists; Zod input schemas; latestEvaluation transform |
| helix-global-server/src/routes/api.ts | Route registration confirmation | All 11 goal endpoints registered at lines 436-447 |
