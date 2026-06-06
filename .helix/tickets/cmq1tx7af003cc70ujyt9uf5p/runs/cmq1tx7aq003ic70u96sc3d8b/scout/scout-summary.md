# Scout Summary — helix-cli

## Problem

Post-egress-lockdown analysis: verify CLI network access patterns and whether they align with the egress hardening model.

## Analysis Summary

The CLI has **no explicit egress controls** — by design. It operates in two contexts:

1. **Inside a sandbox**: Egress is enforced by the sandbox network policy (Vercel/Sprites). The CLI just talks to its configured server URL, which is in the runtime allowlist.
2. **On user machines**: The CLI connects only to the user-configured Helix server and GitHub API for updates. Trust-by-configuration — security depends on the HELIX_URL being correct.

### Network Endpoints (2 total)

| Purpose | Destination | Auth |
|---------|-------------|------|
| Helix API | `config.url/api/...` (user-configured) | hxi_ API key or Bearer JWT |
| GitHub Updates | `api.github.com/repos/.../releases` | Optional GITHUB_TOKEN |

### Security Properties

- **Centralized HTTP**: All API calls through `hxFetch()` wrapper
- **Zero runtime deps**: Only native Node.js APIs — minimal supply chain surface
- **Update safety**: Checksum validation, path traversal protection, no symlinks
- **Token validation**: hxi_ prefix required
- **npm provenance**: OIDC Trusted Publishing for releases

The CLI does not need its own domain allowlist because when it runs inside a sandbox, the sandbox-level network policy already restricts egress. The serverUrl hostname is in the runtime allowlist.

## Relevant Files

| File | Role |
|------|------|
| `src/lib/http.ts` | Centralized hxFetch() — retry, timeout, auth |
| `src/lib/config.ts` | Server URL + auth token config |
| `src/update/check.ts` | GitHub API update check |
| `src/update/perform.ts` | Secure update download + validation |
| `src/update/extract.ts` | Path traversal protection |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket scope | CLI access patterns relevant to egress analysis |
| src/lib/http.ts | HTTP client inspection | Single wrapper, 2 destinations, no allowlisting needed |
| src/lib/config.ts | Configuration model | Trust-by-configuration for server URL |
| src/update/check.ts | External access point | GitHub API only external call besides Helix server |
| package.json | Dependency analysis | Zero runtime deps — minimal attack surface |
