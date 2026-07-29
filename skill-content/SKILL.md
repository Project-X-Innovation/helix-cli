---
name: hlx-cli
description: >-
  Helix CLI (hlx) skill for AI agents. Triggers: hlx login, hlx token add,
  HELIX_API_KEY, HELIX_URL, hlx org current/list/switch, hlx tickets
  list/latest/get/create/rerun/continue/artifacts/artifact/bundle/update-description,
  ticket-ref resolution (numeric, short-id, internal-id), hlx inspect
  repos/db/logs/api, hlx comments list/post, hlx library list/show/comments,
  hlx connectors list/skill/schema/read, connector gateway, HELIX_CONNECT_URL,
  HELIX_CONNECTOR_TOKEN, hct_ tokens, writing Helix tickets, ticket prompting,
  hlx update, hlx skill show/install, broken hlx install, install recovery.
---

## Workflow

1. Authenticate: set `HELIX_API_KEY` and `HELIX_URL` env vars, or run `hlx login <server-url>`.
2. Verify org: `hlx org current`. Switch if needed: `hlx org switch <alias>`.
3. Discover tickets: `hlx tickets list` or `hlx tickets latest`.
4. Inspect a ticket: `hlx tickets get <ref>` — refs accept numeric ID, short ID (e.g. BLD-339), or internal ID.
5. View artifacts: `hlx tickets artifacts <ref>` then `hlx tickets artifact <ref> --step <id> --repo <key>`.
6. Create a ticket: `hlx tickets create --title "..." --repos my-app --description "..."`.
7. Continue work: `hlx tickets continue <ref> "context"`.
8. Inspect production: `hlx inspect repos`, then `hlx inspect db --repo <name> --query "..."`.
9. Post a comment: `hlx comments post "message"`.

Trust the current `helix-cli/src/**` for CLI behavior. Pass ticket refs as-given — the CLI resolves them. Switch orgs before working in a repo that lives in a different org.

## Guardrails

- **Auth required.** Most commands need `HELIX_API_KEY`/`HELIX_URL` or a stored config via `hlx login`.
- **`hlx inspect *` is read-only.** Do not create, update, or delete production records through inspection.
- **Do not log full tokens.** Use `hlx org list` which masks tokens automatically.
- **Verify org context.** Run `hlx org current` before commands that target a specific organization.

## Commands at a glance

| Command | Description |
|---------|-------------|
| `login` | Authenticate with a Helix server |
| `token` | Add an API token directly |
| `org` | Manage organization context (current, list, switch) |
| `tickets` | Discover, inspect, create, continue, bundle tickets |
| `inspect` | Read-only production inspection (repos, db, logs, api) |
| `connectors` | Read org data through the connector gateway (list, skill, schema, read) |
| `comments` | List or post ticket comments |
| `library` | Browse and rate published research reports |
| `skill` | Show or install the bundled hlx-cli skill |
| `update` | Check for and apply CLI updates |

Full flag reference: [references/commands.md](references/commands.md)

## Ticket work — gotchas

- **`--description` vs `--description-file`:** The CLI errors when `--description <value>` resolves to a readable file path. Use `--description-file <path>` to load from a file.
- **10,000-char description cap:** Server-enforced. Truncate or split before submitting.
- **Dependency flags:** `--after <ref>` (run after), `--reference <ref1,ref2>` (cross-ref, max 5), `--implement-from <ref>` (implement from research).
- **`--dry-run` on continue:** `hlx tickets continue <ref> "context" --dry-run` previews the payload without starting a run.
- **`update-description`:** `hlx tickets update-description <ref> --file <path>` or `--text <string>`.
- **`--mode RESEARCH`:** Drop implementation-shaped sections from the description. Skip "research only" boilerplate.

## Artifact workflow

Terminal statuses (`DEPLOYED`, `UNVERIFIED`, `FAILED`) may return an empty `artifacts` summary. Pass `--run <runId>` to target a specific run.

`PREVIEW_READY` status is fixed by PR #36.

## Connectors

Helix SMB connectors expose an org's business data (files, external systems) through the Mothership gateway — a uniform, read-only wire protocol at `{server}/api/connect/v1`:

- `GET /:connector/$schema` — machine-readable resource schemas: `{data: {connector, resources, ...}}`
- `GET /:connector/$skill` — the connector's SKILL.md (markdown)
- `GET /:connector/:resource?limit=&cursor=` — one page of rows: `{data: [...], nextCursor?}`
- `GET /:connector/:resource/:id` — one record: `{data: {...}}`

Auth is an org-scoped connector token (`hct_...`) sent as `Authorization: Bearer`. Errors come back as `{error: {code, message}}`. **Connectors are read-only: everything outbound is a play.** Never try to write through the gateway — mutations go through Helix plays, which carry review, evidence, and rollback.

Credentials resolve per command: `--url` flag > `HELIX_CONNECT_URL` env > current org's url from `~/.hlx/config.json`; token: `--token` flag > `HELIX_CONNECTOR_TOKEN` env. Org admins mint connector tokens on the Helix server; Helix sandboxes get `HELIX_CONNECTOR_TOKEN` injected automatically.

The discovery loop — list, skill, schema, read:

1. `hlx connectors list` — see which connectors the org has enabled.
2. `hlx connectors skill files` — read the connector's SKILL.md for semantics and gotchas.
3. `hlx connectors schema files` (or `hlx connectors schema files objects`) — get the machine-readable field list, filters, and ordering.
4. `hlx connectors read files objects --limit 20` — page through rows; pass the returned `nextCursor` back as `--cursor` for the next page. `--param key=value` (repeatable) sets connector-specific filters, e.g. `--param prefix=/receipts/`. `--id <id>` fetches a single record.

Full flag reference: [references/commands.md](references/commands.md)

## Inspection

PowerShell users: prefer `--query '<sql>'` over positional SQL when the query contains double-quoted Postgres identifiers. Use `--query-file <path>` for complex queries to avoid all quoting issues.

## Writing tickets

See [references/ticket-prompting.md](references/ticket-prompting.md) for the ticket-authoring guide covering required structure, constraint language, common failure modes, and a draft review checklist.

## Install and update

Install supports GitHub release assets, while update prefers the current install channel and falls back to npm LTS when needed.

- **Install:** Download `helix-cli.tgz` from the GitHub Releases page, extract, and verify `dist/index.js` exists.
- **Update:** Run `hlx update`. Lab installs try GitHub release assets first; if that fails, the CLI falls back to npm LTS.
- **Recovery:** See [references/recovery.md](references/recovery.md).

## Source of truth

See [references/current-state.md](references/current-state.md) for dated changelog notes on the CLI's install and update mechanisms.
