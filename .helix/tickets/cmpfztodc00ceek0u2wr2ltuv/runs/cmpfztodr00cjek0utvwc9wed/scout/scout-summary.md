# Scout Summary — RSH-551: Live Helix Agent (helix-cli)

## Problem

The helix-cli provides the tool surface (comments, tickets, library, inspect) that workflow agents use inside Vercel sandboxes. The current comment helix has none of these tools — it relies only on hardcoded MCP tools for run management. The Host Agent running in a sprite would need the CLI installed and authenticated to provide the same capabilities as workflow agents.

## Analysis Summary

The CLI exposes key commands relevant to the Host Agent:
- **`hlx comments post`**: Post comments to tickets (confirmation and ongoing replies)
- **`hlx tickets list/get`**: Access other tickets for cross-ticket context
- **`hlx library list/show`**: Browse research reports for context-aware responses
- **`hlx inspect db/logs/api`**: Query production runtime data

The CLI is already installed in Vercel sandbox environments during the native-phase provisioning step. For the Host Agent sprite, the same installation process would need to be replicated. The CLI uses API authentication (token-based) that would need to be configured in the sprite environment.

No code changes to the CLI itself are anticipated — it's the deployment and configuration in the sprite environment that matters.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/comments/post.ts` | Comment posting command used by Host Agent |
| `src/tickets/index.ts` | Ticket access for cross-ticket context |
| `src/library/` | Library access for research browsing |
| `src/inspect/index.ts` | Runtime inspection for production context |
| `src/index.ts` | CLI entry point and command registration |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem statement | Host Agent needs same CLI capabilities as workflow agents |
| src/comments/post.ts | Comment posting flow | Simple POST to /api/tickets/{id}/comments — works anywhere with auth |
| src/index.ts | CLI command structure | All commands registered, binary is 'hlx' |
| package.json | Package metadata | v1.3.4, published as @projectxinnovation/helix-cli |
