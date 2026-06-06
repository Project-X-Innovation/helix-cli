# Product Specification — Goals Feature Flag

## Problem Statement

The Goals feature is only partially gated. A narrow `GOAL_EVAL_ENABLED` env var on the server controls only evaluation sprite provisioning and GC startup (2 code paths). The remaining Goals surface — 16+ server API routes, 3 client routes, navigation items, 8+ UI components, and 5 CLI commands — is always accessible. There is no mechanism for the server to communicate feature-flag state to the client or CLI, so even if the server gated its endpoints, downstream consumers would have no way to adapt their UI or error handling.

## Product Vision

A single server-side environment variable controls the entire Goals feature across all surfaces. When Goals is disabled, the feature is invisible to users: no navigation, no routes, no API access. When enabled, everything works as today. This establishes a reusable pattern for future feature flags.

## Users

- **Platform administrators** who deploy the server and set env vars to control which features are available.
- **End users** (web client) who see or don't see Goals based on the flag.
- **CLI users** (developers/operators) who run `hlx goals` commands against the server.

## Use Cases

1. **Disable Goals for an environment**: An administrator sets a single env var to `false` and redeploys. Goals disappears across all surfaces.
2. **Enable Goals for an environment**: An administrator sets the env var to `true`. Goals appears in navigation, routes, and CLI commands work.
3. **Gradual feature rollout**: Goals can be tested in staging (enabled) while remaining hidden in production (disabled).
4. **CLI user tries Goals while disabled**: The CLI displays a clear, user-friendly message instead of raw HTTP errors.

## Core Workflow

1. Administrator sets `GOALS_ENABLED` env var on the server (`true` or `false`).
2. Server reads the flag at startup and applies it to all goal API endpoints.
3. Server includes the flag state in the `/auth/me` response.
4. Client reads the flag from auth data and conditionally renders Goals navigation and routes.
5. CLI continues to send requests as normal; when the server returns a "feature disabled" response, the CLI displays a friendly message.

## Essential Features (MVP)

1. **Server env var**: A new `GOALS_ENABLED` env var (default `false`) that controls the entire Goals feature.
2. **Server API gating**: All goal API endpoints return an appropriate error (e.g., 404) when `GOALS_ENABLED=false`.
3. **Server-to-client flag channel**: The `/auth/me` response includes feature flag state (at minimum a `goalsEnabled` boolean) so downstream consumers can adapt.
4. **Client navigation gating**: Goals nav items (desktop sidebar and mobile menu) are hidden when the flag is false.
5. **Client route gating**: Goals routes are inaccessible when disabled (redirect or "not available" treatment).
6. **CLI graceful error handling**: When the server returns a feature-disabled response, the CLI shows "Goals feature is not enabled" instead of a raw error.
7. **Existing `GOAL_EVAL_ENABLED` preserved**: The evaluation sub-flag remains functional as a separate toggle within Goals (only meaningful when `GOALS_ENABLED` is also true).

## Features Explicitly Out of Scope (MVP)

- Per-organization or per-user feature flag granularity (this is a global server-level toggle).
- A generic feature flag management UI or admin panel.
- Database schema changes or data migration (existing goal data remains in the database, just inaccessible when disabled).
- Removing or refactoring any existing Goals code (components, routes, API functions stay in the codebase).
- Adding feature flags for other features (though the pattern should be reusable).
- Client-side env var for Goals (the server is the single source of truth).

## Success Criteria

1. Setting `GOALS_ENABLED=false` (or omitting it) hides Goals from all surfaces: no nav items, no accessible routes, no API responses, CLI shows friendly message.
2. Setting `GOALS_ENABLED=true` restores full Goals functionality exactly as it works today.
3. The `/auth/me` response includes a `goalsEnabled` field reflecting the server flag.
4. `GOAL_EVAL_ENABLED` continues to function independently for evaluation gating.
5. All quality gates pass across all three repos (`build`, `typecheck`, `lint`, `test`).
6. No breaking changes to existing functionality outside Goals.

## User Scenarios

[SCN-01] Goals hidden when feature is disabled
- Precondition: Server is running with `GOALS_ENABLED=false`; user is logged in
- Action: User views the application navigation (desktop or mobile)
- Expected Outcome: No Goals menu item appears in the navigation

[SCN-02] Goals routes inaccessible when disabled
- Precondition: Server is running with `GOALS_ENABLED=false`; user is logged in
- Action: User navigates directly to a Goals URL (e.g., `/goals`)
- Expected Outcome: User is redirected away or sees a "not available" indication; they cannot access Goals content

[SCN-03] Goals visible when feature is enabled
- Precondition: Server is running with `GOALS_ENABLED=true`; user is logged in
- Action: User views the application navigation
- Expected Outcome: Goals menu item appears in the navigation and all Goals pages are accessible

[SCN-04] Server API rejects goal requests when disabled
- Precondition: Server is running with `GOALS_ENABLED=false`
- Action: Any client sends a request to a goals API endpoint (e.g., list goals, create goal)
- Expected Outcome: Server responds with an error indicating the feature is not available (not a server error or crash)

[SCN-05] Server API accepts goal requests when enabled
- Precondition: Server is running with `GOALS_ENABLED=true`
- Action: Authenticated user sends a request to any goals API endpoint
- Expected Outcome: The endpoint behaves exactly as it does today (no regressions)

[SCN-06] CLI shows friendly message when Goals is disabled
- Precondition: Server is running with `GOALS_ENABLED=false`; CLI is configured and authenticated
- Action: User runs `hlx goals list`
- Expected Outcome: CLI displays a message like "Goals feature is not enabled" instead of a raw HTTP error

[SCN-07] CLI works normally when Goals is enabled
- Precondition: Server is running with `GOALS_ENABLED=true`; CLI is configured and authenticated
- Action: User runs `hlx goals list`
- Expected Outcome: CLI returns the list of goals as expected

[SCN-08] Auth response includes feature flag state
- Precondition: Server is running (either `GOALS_ENABLED=true` or `false`)
- Action: Client fetches `/auth/me`
- Expected Outcome: Response includes a `goalsEnabled` field matching the server's env var value

[SCN-09] Existing goal data preserved when feature is disabled
- Precondition: Goals were previously created while `GOALS_ENABLED=true`; server is now running with `GOALS_ENABLED=false`
- Action: Administrator re-enables Goals (`GOALS_ENABLED=true`)
- Expected Outcome: All previously created goals are visible and intact

[SCN-10] Goal evaluation sub-flag still works independently
- Precondition: Server is running with `GOALS_ENABLED=true` and `GOAL_EVAL_ENABLED=false`
- Action: User creates a goal and triggers evaluation
- Expected Outcome: Goal is created successfully but evaluation transitions to PAUSED (existing behavior preserved)

## Key Design Principles

- **Server is the single source of truth**: The feature flag is a server env var. The client and CLI derive their behavior from server responses, not local configuration.
- **Follow existing patterns**: Use the same patterns already present in the codebase (user property hooks on client, env var config on server).
- **Data preservation**: Disabling the flag hides the feature; it does not delete or modify existing data.
- **Graceful degradation**: All surfaces handle the disabled state with user-friendly messaging, not raw errors.

## Scope & Constraints

- **Three repos affected**: helix-global-server (flag source + API gating + auth response), helix-global-client (UI gating), helix-cli (error handling).
- **No database changes**: The Goal table and related models remain unchanged.
- **Default off**: `GOALS_ENABLED` defaults to `false` to match current intent (Goals is not yet generally available).
- **Backward compatible**: Enabling the flag restores exact current behavior with no regressions.

## Future Considerations

- Extend the feature-flag pattern to other features (e.g., `HOST_AGENT_ENABLED` follows a similar partial-gating pattern that could benefit from the same treatment).
- Consider a dedicated `/api/features` endpoint if more flags are added, to avoid overloading the `/auth/me` response.
- Per-organization feature flags for multi-tenant deployments.
- Admin UI for toggling features without redeployment.

## Open Questions / Risks

| # | Question / Risk | Notes |
|---|----------------|-------|
| 1 | Should disabled endpoints return 404 or a specific feature-disabled error code? | 404 is simplest and matches "feature doesn't exist" semantics. A custom code would give clients richer handling but adds complexity. |
| 2 | Should the flag be exposed via MeResponse directly or a nested `featureFlags` object? | A nested object is more extensible for future flags but adds a new type. |
| 3 | Does the unauthenticated eval-callback route (routes/api.ts:293) also need gating? | This is called by external services during evaluation; gating it when Goals is disabled seems correct but needs confirmation. |
| 4 | Should `GOAL_EVAL_ENABLED` become subordinate to `GOALS_ENABLED` (i.e., auto-disabled when Goals is off)? | Diagnosis recommends keeping them independent; `GOAL_EVAL_ENABLED` is only meaningful when `GOALS_ENABLED=true`. |
| 5 | Should `GOALS_ENABLED` be documented in `.env.example` alongside the undocumented `GOAL_EVAL_ENABLED`? | Both should be documented; `GOAL_EVAL_ENABLED` is currently missing from `.env.example`. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-global-client) | Understand ticket scope and intent | Whole Goals concept behind a single server flag, client-server everywhere |
| scout/scout-summary.md (helix-global-server) | Map server-side Goals surface and existing flag | `GOAL_EVAL_ENABLED` only gates 2 code paths; 16+ routes ungated; no flag in auth response |
| scout/scout-summary.md (helix-global-client) | Map client-side Goals surface and auth data shape | 3 routes, nav always visible, MeResponse has no feature flag fields |
| scout/scout-summary.md (helix-cli) | Map CLI goals commands and error handling | 5 commands always available, no feature flag mechanism |
| scout/reference-map.json (helix-global-server) | Detailed file map and facts for server | 16 authenticated routes, 1 unauthenticated route, getMe has no flags |
| scout/reference-map.json (helix-global-client) | Detailed file map and facts for client | Existing patterns: useIsPxOrg hook, PlatformConfig.capabilities |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause and success criteria | Confirmed partial gating is the root cause; defined 7 success criteria |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client-specific root cause | No flag data in MeResponse; existing conditional rendering patterns available |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI-specific root cause | No feature flag mechanism; CLI should react to server responses |
| repo-guidance.json | Repo intent and rationale | All three repos are change targets with distinct roles |
| /tmp/helix-inspect/manifest.json | Check runtime inspection availability | DATABASE and LOGS available for helix-global-server |
