---
name: hlx-cli
description: >-
  Helix CLI (hlx) skill for AI agents. Triggers: hlx login, hlx token add,
  HELIX_API_KEY, HELIX_URL, hlx org current/list/switch, hlx tickets
  list/latest/get/create/rerun/continue/artifacts/artifact/bundle/update-description,
  ticket-ref resolution (numeric, short-id, internal-id), hlx inspect
  repos/db/logs/api, hlx comments list/post, hlx library list/show/comments,
  writing Helix tickets, ticket prompting, hlx update, hlx skill show/install,
  broken hlx install, install recovery.
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
