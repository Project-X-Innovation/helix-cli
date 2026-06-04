# Scout Summary — helix-cli (RSH-662: Audit Trail Brainstorm)

## Problem

Map the CLI's role as an audit event source and potential audit consumer for the enterprise audit trail system.

## Analysis Summary

### CLI as Event Source

The CLI is a thin API client — all operations are HTTP calls to helix-global-server via `src/lib/http.ts`. Audit events from CLI operations would be captured server-side.

**9 command modules** (event-generating operations):
- **tickets**: create, rerun, continue (write operations that trigger server-side ticket lifecycle)
- **goals**: create, terminate, resume (state transitions)
- **comments**: post (creates ticket comments)
- **inspect**: repos, db, logs, api (already audit-logged via InspectionAuditLog)
- **login**: authenticate (auth event)
- **token**: add (credential management)
- **org**: switch (context change)

**Identity signals available server-side**:
- Bearer token or API key in Authorization header
- `X-Helix-Org-ID` header for org-scoped requests
- User-Agent header could differentiate CLI from browser UI (not currently set to a distinct value)

### CLI as Audit Consumer

The CLI currently has no commands to view audit data. Potential future surface:
- `hlx audit log` — view recent audit events for current org
- `hlx audit search` — search/filter audit events
- Integration with `hlx inspect` command family

### No Client-Side Logging
- No local audit log file
- No telemetry or analytics
- Error output via `console.error()` only
- Retry logic (3 attempts, exponential backoff) could mask transient failures from audit perspective

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/lib/http.ts` | Central HTTP layer; all CLI→server communication |
| `src/lib/config.ts` | Credential management (API keys, org context) |
| `src/index.ts` | CLI entry point and command routing |
| `src/inspect/` | Inspection commands (already audit-logged server-side) |
| `src/tickets/` | Ticket lifecycle commands |
| `src/goals/` | Goal state transition commands |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem scope definition | Every request must be auditable; CLI is a request source |
| src/lib/http.ts | API client analysis | All operations go through hxFetch; server-side audit capture is sufficient |
| src/lib/config.ts | Identity analysis | Multi-org config with API keys; identity available in request headers |
| src/index.ts | Command surface mapping | 9 command modules; all generate server-side events |
