# Scout Summary - helix-cli

## Problem

Map the CLI command surface area as the reference interface for Email and WhatsApp interface design. The ticket specifies interfaces "similar to CLI" and requires an appendix comparing all three interfaces (CLI, MCP, Email/WhatsApp).

## Analysis Summary

### CLI Command Surface
The CLI (`hlx`) exposes 12 top-level commands with ~30 distinct operations total. The command tree is:

**Ticket Lifecycle** (10 subcommands):
- `tickets list` / `tickets latest` / `tickets get` - Discovery and inspection
- `tickets create` - Create with title, description, repos, mode
- `tickets rerun` / `tickets continue` - Re-execution and context addition
- `tickets artifacts` / `tickets artifact` - Step artifact inspection
- `tickets bundle` - Codex export
- `tickets update-description` - Description editing

**Communication** (2 subcommands):
- `comments list` - With --ticket, --helix-only, --since filters
- `comments post` - With --ticket context flag

**Production Inspection** (4 subcommands):
- `inspect repos` - List available repositories
- `inspect db` - SQL query execution
- `inspect logs` - Log query execution
- `inspect api` - API GET requests

**Library** (4 subcommands):
- `library list` / `library show` - Content browsing
- `library comments list` / `library comments post` - Section-level feedback

**Administration** (6 commands):
- `login` / `token add` - Authentication
- `org current` / `org list` / `org switch` - Multi-org context
- `preview db-url` - Neon preview branch URI

**Maintenance** (3 commands):
- `skill show` / `skill install` - Agent skill management
- `update` - Self-update

### Communication Pattern
Pure request-response HTTP via `hxFetch()` with 3-attempt retry, exponential backoff (2s base), 30s timeout. No streaming, WebSocket, or push capability. Users must poll for updates.

### Auth Model
Multi-org support with API keys (`hxi_*`) or Bearer tokens. Config stored in `~/.hlx/config.json`. Environment variable overrides: HELIX_API_KEY, HELIX_URL.

### Output Formatting
Two modes: human-readable aligned text tables (default) and structured JSON (`--json` flag). Email/WhatsApp would need a third formatting mode optimized for messaging.

### Reference Resolution
Flexible ticket resolution: exact ID, short ID (RSH-596), or numeric suffix. This pattern is important for natural language message parsing in email/WhatsApp.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/index.ts` | Entry point and command router - full command surface |
| `src/tickets/index.ts` | Ticket subcommand router (10 operations) |
| `src/comments/index.ts` | Comment subcommands (list, post) |
| `src/inspect/index.ts` | Inspect subcommands (repos, db, logs, api) |
| `src/library/index.ts` | Library subcommands (list, show, comments) |
| `src/org/index.ts` | Org management (current, list, switch) |
| `src/lib/http.ts` | HTTP client with retry logic |
| `src/lib/config.ts` | Config management and multi-org support |
| `src/lib/resolve-ticket.ts` | Flexible ticket reference resolution |
| `src/lib/flags.ts` | Flag/argument parsing utilities |
| `src/preview/index.ts` | Preview db-url command |
| `src/skill/index.ts` | Skill install/show (CLI-only) |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket scope | Email/WhatsApp "similar to CLI" - CLI is the reference interface |
| src/index.ts | CLI entry point | 12 top-level commands, ~30 total operations |
| package.json | Build/test scripts | Build: tsc, Test: tsc && node --test, Binary: hlx |
| src/lib/http.ts | Communication pattern | Pure HTTP request-response with retry, no push/streaming |
| src/lib/config.ts | Auth model | Multi-org, API key or Bearer token, ~/.hlx/config.json |
