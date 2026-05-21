# hlx-cli Current State

## 2026-05-21 — Install/update migrated to GitHub release assets (PR #86)

`hlx update` now downloads from GitHub release assets instead of npm. The CLI fetches
the `latest` tagged release from `Project-X-Innovation/helix-cli` via the GitHub API,
downloads the `helix-cli.tgz` asset, extracts it in-process, validates the staged
candidate (`dist/index.js` exists, `package.json` present, `--version` runs), and
performs a rename-based atomic swap with `.bak` rollback.

`npm install -g` is no longer the recommended install or update path.

See `references/recovery.md` for the full install, update, and broken-install recovery flow.
