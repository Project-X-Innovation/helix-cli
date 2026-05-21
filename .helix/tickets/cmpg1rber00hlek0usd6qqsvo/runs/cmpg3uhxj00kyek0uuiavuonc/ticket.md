# Ticket Context

- ticket_id: cmpg1rber00hlek0usd6qqsvo
- short_id: BLD-556
- run_id: cmpg3uhxj00kyek0uuiavuonc
- run_branch: helix/build/BLD-556-hlx-library-show-full-print-report-body-not-just
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
hlx library show --full: print report body, not just TOC

## Description
## Problem

`hlx library show <ref>` currently prints only the report's section headings (TOC) annotated with slug and comment summaries. It does not print the report body.

Result: agents (and humans) who need to read a report substantively — to evaluate it, summarize it, comment on specific passages, or feed it to a downstream model — have to fall back to hitting `/api/library/items/:id` directly with curl. That defeats the purpose of having a CLI and also bypasses any auth/rate-limit improvements the CLI might add later.

## Desired behavior

Add a flag (suggested name `--full`, alternative `--body`) to `hlx library show` that prints the full markdown body of the library item below the TOC.

```
hlx library show <ref>          # current behavior (TOC + comment summaries) — unchanged
hlx library show <ref> --full   # TOC + full markdown body
```

Stretch (optional, only if cheap):
- `--body-only` to skip the TOC and print just the markdown body (useful for piping into a file or another tool)
- `--out <path>` to write the body to a file

## Implementation pointer

The `/api/library/items/:id` endpoint already returns `item.content` as the full markdown — verified working:

```
curl -sS -H "Authorization: Bearer $HELIX_API_KEY" \
  "$HELIX_URL/api/library/items/<id>" \
  | jq -r '.item.content'
```

The CLI just needs to surface that field when `--full` is set. The existing `hlx library show` handler already calls some endpoint to assemble the TOC view; either reuse `/api/library/items/:id` and derive both views from one response, or call it conditionally when `--full` is passed.

## Acceptance criteria

- `hlx library show <ref> --full` prints the same markdown that the web app at `https://app.gethelix.ai/library/<id>` shows in the report body.
- Existing `hlx library show <ref>` (no flag) output is unchanged.
- Help text (`hlx library show --help`) documents the new flag.
- The bundled `hlx-cli` skill (`hlx skill show`) is updated to mention `--full` under "Library Reports."

## Why this matters

When agents evaluate implementation plans, research reports, or proposals from the library, they need the full text — TOC alone is not enough to verify claims, check code references, or compare proposals to current state. Right now they either route around the CLI (bad) or work from headings alone (also bad). This flag closes that gap.

## Attachments
- (none)
