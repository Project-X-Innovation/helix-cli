# hlx-cli Current State

## 2026-06-08 - Update channels split into lab and lts

`hlx update` now uses the install source to choose an update channel. Canonical GitHub
installs are treated as `lab` and try GitHub release assets first. npm and unknown
installs are treated as `lts` and update from the public npm package. If a lab update
fails, the CLI immediately falls back to npm LTS without surfacing GitHub-specific
setup guidance to the user.

See `references/recovery.md` for the full install, update, and broken-install recovery flow.
