# hlx Install, Update, and Recovery

## How `hlx update` works

1. **Resolve latest release.** The CLI calls the GitHub API at
   `https://api.github.com/repos/Project-X-Innovation/helix-cli/releases/tags/latest`
   to find the most recent release.

2. **Authenticate (optional).** If the repo requires authentication, the CLI discovers a
   GitHub token from (in priority order):
   - `GITHUB_TOKEN` environment variable
   - `GH_TOKEN` environment variable
   - `gh auth token` (GitHub CLI)

3. **Download tarball.** The `helix-cli.tgz` release asset is downloaded to a staging
   directory at `~/.hlx/staging/<commitSha>/`.

4. **Extract in-process.** The tarball is extracted without shelling out to an external
   `tar` binary.

5. **Validate staged candidate.** Three checks must pass:
   - `dist/index.js` exists on disk.
   - `package.json` exists on disk.
   - `node <staged>/dist/index.js --version` runs successfully and produces output
     (with `HLX_SKIP_UPDATE_CHECK=1` set to prevent recursion).

6. **Atomic swap.** The live `dist/`, `skill-content/`, and `package.json` are backed up
   with `.bak` suffixes, then the staged versions are renamed into place. If the swap
   fails, backups are restored automatically.

7. **Persist metadata.** On success, install-source metadata (mode, repo, branch, commit)
   is written to `~/.hlx/config.json` so future update checks compare correctly.

## How to install from scratch

1. Go to the GitHub Releases page:
   `https://github.com/Project-X-Innovation/helix-cli/releases/latest`

2. Download the `helix-cli.tgz` asset.

3. Extract the tarball to a directory on your PATH, e.g.:

   ```bash
   mkdir -p ~/.hlx/cli && tar -xzf helix-cli.tgz -C ~/.hlx/cli
   ```

4. Verify the install:

   ```bash
   node ~/.hlx/cli/dist/index.js --version
   ```

5. Create a shell alias or symlink so `hlx` resolves to `node ~/.hlx/cli/dist/index.js`.

## How to recover a broken install

### Try `hlx update` first

If the `hlx` command still runs:

```bash
hlx update
```

This downloads a fresh copy from GitHub releases and replaces the broken files.

### If `hlx update` itself fails

1. Download the latest tarball manually:

   ```bash
   curl -L -o helix-cli.tgz \
     https://github.com/Project-X-Innovation/helix-cli/releases/latest/download/helix-cli.tgz
   ```

   If the repo requires auth, add a header:

   ```bash
   curl -L -H "Authorization: Bearer $GITHUB_TOKEN" -o helix-cli.tgz \
     https://github.com/Project-X-Innovation/helix-cli/releases/latest/download/helix-cli.tgz
   ```

2. Extract to the install location, replacing the broken files:

   ```bash
   tar -xzf helix-cli.tgz -C /path/to/hlx/install
   ```

3. Verify the repair:

   ```bash
   node /path/to/hlx/install/dist/index.js --version
   ```

   If this prints a version string, the install is healthy.

### Diagnosing a broken install

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `hlx` command not found | Binary not on PATH | Re-create alias or symlink to `node <install>/dist/index.js` |
| `Cannot find module` errors | Incomplete extraction or interrupted update | Re-download and extract the tarball |
| `--version` produces no output | Corrupted `dist/index.js` | Re-download and extract the tarball |
| Update check fails with 401/403 | Missing GitHub auth token | Set `GITHUB_TOKEN` or `GH_TOKEN`, or run `gh auth login` |
| Swap failed (EPERM on Windows) | File locked by another process | Close programs accessing the install directory, then retry `hlx update` |

## Auto-update

- `hlx update --enable-auto` — enables automatic update checks before each command invocation.
- `hlx update --disable-auto` — disables automatic update checks.

When auto-update is enabled and the install source is recognized as canonical
(`Project-X-Innovation/helix-cli` on `main`), the CLI silently checks for updates
before dispatching the command. Network failures are non-blocking.
