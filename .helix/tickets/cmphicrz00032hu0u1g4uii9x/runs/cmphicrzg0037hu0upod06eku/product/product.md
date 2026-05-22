# Product: Enable Full CLI Capabilities for Helix Agents

## Problem Statement

Helix agents cannot create tickets, look up other tickets, or post comments via the CLI. The agent sandbox installs `@projectxinnovation/helix-cli@1.2.0` from npm, which is an inspection-only build containing only `login` and `inspect` commands. Running `hlx tickets create` or `hlx comments post` returns "Unknown command."

The full CLI at v1.3.4 in the source repo has all these write capabilities, the server API fully supports write operations via hxi_ API keys, and there are no auth restrictions -- but agents simply don't have the commands available because the npm package was never updated after v1.2.0.

Additionally, env var naming (`HELIX_INSPECT_TOKEN`, `HELIX_INSPECT_BASE_URL`) implies inspection-only access, and the CLI provides no indication of which environment (production vs staging) is being targeted.

## Product Vision

Agents should have full read-write CLI access to the Helix platform, enabling them to self-serve ticket creation, comment posting, ticket lookup, and production inspection -- all targeting the correct environment with clear signals.

## Users

- **Helix Agents** (primary): Automated agents running in sandbox environments that need to create tickets, post comments, and inspect production data via the CLI.
- **Helix Platform Users** (secondary): Humans who rely on agents completing CLI-based workflows (ticket creation, cross-ticket lookup, comment posting) autonomously.

## Use Cases

1. An agent creates a follow-up ticket from within an existing workflow.
2. An agent looks up details of a referenced ticket (not just its own).
3. An agent posts a comment on a ticket to communicate findings or status.
4. An agent inspects production logs and database for diagnostics.
5. An agent lists and searches tickets to understand project context.

## Core Workflow

1. Agent receives a task that requires CLI interaction (e.g., create a ticket, post a comment, look up another ticket).
2. Agent runs the appropriate `hlx` command (e.g., `hlx tickets create`, `hlx comments post`, `hlx tickets get`).
3. CLI authenticates using the configured API key and targets the correct (production) server.
4. CLI executes the command and returns a result the agent can act on.

## Essential Features (MVP)

1. **Publish current CLI to npm**: The v1.3.4 CLI must be published so agent sandboxes receive the full command set (tickets, comments, library, org, token, skill, update, preview). The existing `^1.2.0` semver range in `helix-workflow-step-agent` will automatically pick up v1.3.x.
2. **All write commands available**: `hlx tickets create`, `hlx tickets update-description`, `hlx comments post`, `hlx tickets rerun`, `hlx tickets continue` must all work in agent sandboxes.
3. **All read commands available**: `hlx tickets list`, `hlx tickets get`, `hlx tickets latest`, `hlx comments list`, `hlx inspect db/logs/api` must all work.
4. **Environment clarity**: Agents should be able to determine which environment (production or staging) their CLI is targeting, reducing the confusion reported in the ticket.

## Features Explicitly Out of Scope (MVP)

- **Permission/scoping system for API keys**: The server currently has no read/write distinction for hxi_ API keys. Adding granular permissions is not needed for this ticket.
- **Staging environment testing infrastructure**: The ticket mentions staging access but the primary ask is production CLI access.
- **CLI UX redesign**: Broader CLI UX improvements beyond what is needed to resolve the identified issues.
- **New CLI commands**: No new commands need to be authored; all required commands already exist in the v1.3.4 source.

## Success Criteria

1. Agents can run `hlx tickets create` in the sandbox and successfully create a ticket against production.
2. Agents can run `hlx comments post` and successfully post comments to any ticket.
3. Agents can run `hlx tickets list` and `hlx tickets get` to look up any ticket, not just the current one.
4. No "Unknown command" errors for any documented CLI command in agent sandboxes.
5. Agents have a clear signal about which environment (production) their configured token targets.

## User Scenarios

[SCN-01] Agent creates a follow-up ticket via CLI
- Precondition: Agent is running in a sandbox with the hlx CLI installed and an API key configured
- Action: Agent runs `hlx tickets create` with title, description, and repos
- Expected Outcome: A new ticket is created in the production Helix system and the agent receives the ticket ID in the CLI output

[SCN-02] Agent looks up a referenced ticket
- Precondition: Agent has a ticket short ID (e.g., RSH-534) from a ticket description or reference
- Action: Agent runs `hlx tickets get` with the referenced ticket identifier
- Expected Outcome: The agent receives the full ticket details (title, description, status) for the referenced ticket

[SCN-03] Agent posts a comment on a ticket
- Precondition: Agent is working on a task and needs to communicate findings on a ticket
- Action: Agent runs `hlx comments post` with a ticket ID and comment body
- Expected Outcome: The comment appears on the target ticket and is visible to users

[SCN-04] Agent lists and searches tickets
- Precondition: Agent needs to find tickets matching certain criteria
- Action: Agent runs `hlx tickets list` with optional search/filter flags
- Expected Outcome: Agent receives a list of matching tickets with IDs, titles, and statuses

[SCN-05] Agent inspects production logs
- Precondition: Agent is diagnosing an issue and needs to see production log data
- Action: Agent runs `hlx inspect logs` for the relevant repository
- Expected Outcome: Agent receives recent production log entries for analysis

[SCN-06] Agent inspects production database
- Precondition: Agent needs to query production data for diagnostics
- Action: Agent runs `hlx inspect db` with a query for the relevant repository
- Expected Outcome: Agent receives query results from the production database

[SCN-07] Agent updates a ticket description
- Precondition: Agent has new information to add to an existing ticket
- Action: Agent runs `hlx tickets update-description` with the ticket ID and new description content
- Expected Outcome: The ticket description is updated in the production system

[SCN-08] Agent re-runs a ticket workflow
- Precondition: Agent determines a ticket needs to be re-processed
- Action: Agent runs `hlx tickets rerun` with the ticket ID
- Expected Outcome: The ticket workflow is re-initiated and the agent receives confirmation

[SCN-09] Agent identifies target environment
- Precondition: Agent starts a task and needs to confirm which environment the CLI is targeting
- Action: Agent checks the CLI configuration or output for environment information
- Expected Outcome: Agent can clearly determine it is operating against the production environment

## Key Design Principles

- **Minimal change**: The full CLI already exists in source (v1.3.4). The fix is a publish operation, not new development.
- **Backward compatibility**: The `^1.2.0` semver constraint in `helix-workflow-step-agent` must remain satisfied; publishing v1.3.x meets this requirement.
- **No auth changes needed**: The server already supports full read-write access for hxi_ API keys with no restrictions. No server changes are required for the core fix.
- **Environment transparency**: The CLI should make it obvious which server/environment it targets.

## Scope & Constraints

- **Primary repo**: `helix-cli` -- needs npm publish of v1.3.4 (or current version).
- **Server repo** (`helix-global-server`): Reference only. No server changes needed -- the server already accepts write operations from API keys.
- **Consumer** (`helix-workflow-step-agent`): No changes needed. Its `^1.2.0` dependency will pick up the new version automatically.
- **Constraint**: The npm publish must include the compiled `dist/` directory with all commands.
- **Constraint**: The 10,000-character server-enforced description limit for tickets should be documented for agents.

## Future Considerations

- **Env var renaming**: Consider supporting `HELIX_API_KEY` as the primary env var name in agent sandboxes (alongside the legacy `HELIX_INSPECT_TOKEN` alias) to reduce confusion about access scope.
- **Granular API key permissions**: If needed in the future, the server could add scopes/permissions to the `InspectionApiKey` model, but this is not required now.
- **Staging token self-service**: Agents working on Helix source code could be given guidance or automation for obtaining staging tokens.
- **CLI environment indicator**: A persistent indicator (e.g., in CLI output headers) showing "Connected to: production" or "Connected to: staging".

## Open Questions / Risks

| # | Question / Risk | Notes |
|---|-----------------|-------|
| 1 | Has the npm publish process been documented or automated? | Unknown whether there is a CI/CD pipeline for publishing helix-cli to npm, or if it requires manual steps. |
| 2 | Will the `helix-workflow-step-agent` pick up the new version automatically on next sandbox provision? | The `^1.2.0` semver range should resolve to v1.3.x, but this depends on npm cache behavior in the sandbox provisioning pipeline. |
| 3 | Are there breaking changes between v1.2.0 and v1.3.4? | The diagnosis did not identify any, but the npm publish should be validated. |
| 4 | Could the 10,000-char ticket description limit cause silent failures for agent-generated content? | Server enforces this via Zod validation; the CLI should surface the error clearly. |
| 5 | Does `hlx skill install` consistently work in all agent sandbox environments? | Unknown whether the skill installation path is writable in all sandbox configurations. |
| 6 | What specific errors did agents encounter in RSH-534? | The referenced ticket reported failed ticket creation attempts but the exact error context was not fully diagnosed. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | Understand full problem statement and user expectations | Agents expected to create tickets, post comments, look up tickets; reported confusion about prod vs staging |
| scout/scout-summary.md (helix-cli) | Map CLI capabilities from source code | CLI v1.3.4 has both read and write commands; HELIX_INSPECT_TOKEN is an alias for HELIX_API_KEY |
| scout/reference-map.json (helix-cli) | Detailed file-by-file evidence of CLI code | 10 commands in source; auth is environment-agnostic; no built-in read-only mode |
| diagnosis/diagnosis-statement.md (helix-cli) | Root cause identification | Stale npm package (v1.2.0) is the primary cause; agents get "Unknown command" for all post-v1.2.0 commands |
| diagnosis/apl.json (helix-cli) | Structured diagnosis answers and evidence | Confirmed sandbox has v1.2.0 with only login+inspect; server has no read-only restriction; env var naming contributes to confusion |
| scout/scout-summary.md (helix-global-server) | Server-side auth verification | hxi_ API keys get full AuthContext; no permission downgrading; POST /api/tickets returns 201 in production |
