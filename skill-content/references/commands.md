# hlx Command Reference

Detailed reference for all `hlx` CLI commands, flags, and usage patterns.

## Authentication

The CLI authenticates via one of two methods:

1. **Environment variables** (preferred for CI/automation):
   - `HELIX_API_KEY` — your Helix API key
   - `HELIX_URL` — the Helix server URL

2. **Config file** (interactive use):
   - Run `hlx login` or `hlx token add` to configure credentials.
   - Config is stored at `~/.hlx/config.json`.

## hlx login

Authenticate with a Helix server.

```
hlx login <server-url>          Open browser for OAuth login
hlx login --manual              Paste API key manually
```

| Flag | Description |
|------|-------------|
| `--manual` | Skip browser-based OAuth; paste API key directly |

## hlx token add

Add an API token directly without browser-based login.

```
hlx token add --token <key> [--url <server>] [--name <alias>] [--current]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--token` | Yes | The API key (hxi_...) |
| `--url` | No | Server URL (uses default if omitted) |
| `--name` | No | Alias for the org entry |
| `--current` | No | Set this org as the active one |

## hlx org

Manage organization context. Multi-org setups use `org switch` to change the active org.

```
hlx org current                  Show active organization
hlx org list                     List all configured orgs (tokens are masked)
hlx org switch <org-id-or-alias> Switch to a different org
```

### hlx org current

Show the currently active organization name and server URL.

### hlx org list

List all configured organizations. API tokens are masked in the output.

### hlx org switch

Switch the active organization to a different configured org. Accepts an org ID or the alias set via `--name` on `hlx token add`.

```
hlx org switch <org-id-or-alias>
```

## hlx tickets

Discover, inspect, and manage tickets.

### hlx tickets list

```
hlx tickets list [--search <text>] [--user <email>] [--status <status>] [--status-not-in <s1,s2>] [--archived] [--sprint <id>] [--json] [--limit <N>]
```

| Flag | Description |
|------|-------------|
| `--search` | Filter tickets by text search |
| `--user` | Filter by user email |
| `--status` | Filter by status |
| `--status-not-in` | Exclude tickets with these statuses (comma-separated) |
| `--archived` | Include archived tickets |
| `--sprint` | Filter by sprint ID |
| `--json` | Output as JSON |
| `--limit` | Maximum number of tickets to return |

### hlx tickets latest

```
hlx tickets latest [--status-not-in <s1,s2>] [--archived] [--sprint <id>]
```

| Flag | Description |
|------|-------------|
| `--status-not-in` | Exclude tickets with these statuses (comma-separated) |
| `--archived` | Include archived tickets |
| `--sprint` | Filter by sprint ID |

### hlx tickets get

```
hlx tickets get <ticket-ref> [--json]
```

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

### hlx tickets create

```
hlx tickets create --title <title> --description <desc> | --description-file <path> --repos <name1,name2> [--mode <AUTO|BUILD|FIX|RESEARCH|EXECUTE>] [--after <ticket-ref>] [--reference <ref1,ref2>] [--implement-from <ticket-ref>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--title` | Yes | Ticket title |
| `--description` | One of | Inline description text. Mutually exclusive with `--description-file`. CLI errors if the value resolves to a readable file path. |
| `--description-file` | One of | Path to a file containing the description. Mutually exclusive with `--description`. |
| `--repos` | Yes | Comma-separated repository names, keys, or internal IDs |
| `--mode` | No | Execution mode: `AUTO`, `BUILD`, `FIX`, `RESEARCH`, or `EXECUTE` |
| `--after` | No | Ticket ref for dependency — run after this ticket completes |
| `--reference` | No | Comma-separated ticket refs for cross-references (max 5) |
| `--implement-from` | No | Ticket ref for a research ticket to implement from |

### hlx tickets update-description

```
hlx tickets update-description <ticket-ref> --file <path> | --text <string>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--file` | One of | Path to a file containing the new description |
| `--text` | One of | Inline text for the new description |

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

### hlx tickets rerun

```
hlx tickets rerun <ticket-ref>
```

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

### hlx tickets continue

```
hlx tickets continue <ticket-ref> "continuation context" [--dry-run]
```

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview the continuation payload without starting a run |

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

### hlx tickets artifacts

```
hlx tickets artifacts <ticket-ref> [--run <runId>]
```

| Flag | Description |
|------|-------------|
| `--run` | Specify a particular run ID (defaults to latest run) |

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

### hlx tickets artifact

```
hlx tickets artifact <ticket-ref> --step <stepId> --repo <repoKey> [--run <runId>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--step` | Yes | Step ID to retrieve the artifact from |
| `--repo` | Yes | Repository key |
| `--run` | No | Specify a particular run ID (defaults to latest run) |

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

### hlx tickets bundle

```
hlx tickets bundle <ticket-ref> --out <dir> [--run <runId>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--out` | Yes | Output directory for the bundle |
| `--run` | No | Specify a particular run ID (defaults to latest run) |

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).

## hlx inspect

Read-only production inspection for databases, logs, and APIs.

### hlx inspect repos

```
hlx inspect repos
```

List all repositories and their available inspection types.

### hlx inspect db

```
hlx inspect db --repo <name> "<sql>"
hlx inspect db --repo <name> --query "<sql>"
hlx inspect db --repo <name> --query-file <path>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--repo` | Yes | Repository name |
| `--query` | No | SQL query string (recommended form) |
| `--query-file` | No | Path to a `.sql` file containing the query |

The first positional argument after `--repo <name>` is treated as the SQL query if `--query` and `--query-file` are not provided.

### hlx inspect logs

```
hlx inspect logs --repo <name> "<query>" [--limit <N>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--repo` | Yes | Repository name |
| `--limit` | No | Maximum number of log entries to return |

### hlx inspect api

```
hlx inspect api --repo <name> <path>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--repo` | Yes | Repository name |

### SQL Quoting Tips

- **Bash/Zsh**: Use single quotes around the query value.
- **PowerShell 7**: Use single quotes around `--query` value:
  `hlx inspect db --repo my-app --query 'SELECT "Col" FROM "Table" LIMIT 5'`
- **PowerShell 5.1**: Use double quotes with backtick-escaped inner quotes.
- **Any shell**: Use `--query-file` with a `.sql` file to avoid quoting issues entirely.

## hlx comments

Post and list ticket comments.

### hlx comments list

```
hlx comments list [--ticket <ref>] [--helix-only] [--since <iso-date>]
```

| Flag | Description |
|------|-------------|
| `--ticket` | Ticket reference to filter comments |
| `--helix-only` | Show only Helix-generated comments |
| `--since` | Show comments after this ISO 8601 date |

### hlx comments post

```
hlx comments post [--ticket <ref>] <message>
```

| Flag | Description |
|------|-------------|
| `--ticket` | Ticket reference to post the comment to |

## hlx library

Browse and interact with library items (published research reports).

### hlx library list

```
hlx library list
```

List all library items with ID, title, status, and date.

### hlx library show

```
hlx library show <ref>
```

Show a report with section headings annotated with `[slug]` and comment summaries.

Item references accept: internal ID, ticket short ID (e.g. RSH-439), or title substring.

### hlx library comments list

```
hlx library comments list <ref> [--section <slug>]
```

| Flag | Description |
|------|-------------|
| `--section` | Filter comments to a specific section (slug or heading text, auto-slugified) |

### hlx library comments post

```
hlx library comments post <ref> --section <slug> --rating <value> [message]
hlx library comments post <ref> --section <slug> --reply-to <commentId> [--rating <value>] [message]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--section` | Yes | Section slug or heading text (auto-slugified) |
| `--rating` | Yes (unless replying) | Rating value: `thumbs-up` (alias `up`), `thumbs-down` (alias `down`), or `love` |
| `--reply-to` | No | Comment ID to reply to (from `comments list` output). When replying, `--rating` becomes optional. |

Rating values: `thumbs-up` (alias `up`), `thumbs-down` (alias `down`), `love`.

## hlx update

Check for and apply CLI updates.

```
hlx update                       Check for updates and apply if available
hlx update --enable-auto         Enable automatic update checks
hlx update --disable-auto        Disable automatic update checks
```

| Flag | Description |
|------|-------------|
| `--enable-auto` | Enable automatic update checks before each command |
| `--disable-auto` | Disable automatic update checks |

## hlx skill

Access the bundled hlx-cli agent skill.

### hlx skill show

```
hlx skill show
```

Print the bundled skill content to stdout.

### hlx skill install

```
hlx skill install [--target <path>] [--for <claude|codex>] [--force]
```

| Flag | Description |
|------|-------------|
| `--target` | Install to `<path>/hlx-cli/`, ignoring auto-detection |
| `--for` | Install for a specific agent: `claude` or `codex` |
| `--force` | Overwrite existing installation |

Install behavior:
- With no flags: auto-detects `~/.claude/skills/` or `~/.codex/skills/`. If exactly one exists, installs there. If both exist, requires `--for`. If neither exists, requires `--target`.
- `--target <path>`: Installs to `<path>/hlx-cli/`.
- `--for claude`: Installs to `~/.claude/skills/hlx-cli/`.
- `--for codex`: Installs to `~/.codex/skills/hlx-cli/`.

## hlx --version

Print the installed CLI version.

```
hlx --version
hlx -v
```
