# Product: CLI Converse Command (helix-cli)

## Problem Statement

CLI users who post comments via `hlx comments post` cannot trigger a Helix agent reply because the command sends `{ content }` without `isHelixTagged`, and returns immediately without waiting for a response. Users must switch to the web UI to converse with Helix about a ticket's run, errors, or artifacts. This breaks the CLI workflow for users who prefer terminal-based interaction.

## Product Vision

Enable CLI users to have a synchronous conversation with the Helix comment agent directly from the terminal. The user sends a message, the CLI triggers the agent via the existing HTTP controller dispatch, polls for the reply, and prints it.

## Users

- **CLI-first developers**: Users who prefer terminal workflows and want to ask Helix about ticket runs, errors, or artifacts without opening the web UI.
- **CI/CD integrations**: Automated pipelines that post questions to Helix about run outcomes and consume the reply programmatically.

## Use Cases

1. **Ask about a run from the terminal**: User asks Helix about a ticket failure and receives the answer printed to stdout.
2. **Script-friendly output**: Automation reads the agent's reply in JSON format for downstream processing.
3. **Follow-up in a thread**: User sends a follow-up question referencing a prior exchange.

## Core Workflow

1. User runs `hlx comments converse --ticket <id> <message>`.
2. The CLI posts the comment with `isHelixTagged: true` via the HTTP API (which already has dispatch logic in the controller).
3. The CLI polls for a new `isAgentAuthored` comment matching the posted comment.
4. On reply, the CLI prints the agent's response content.
5. On timeout, the CLI prints the posted comment ID for later follow-up.

## Essential Features (MVP)

1. **New `converse` subcommand**: Under `hlx comments converse`, accepts `--ticket <id>` and the message as a positional argument.
2. **POST with `isHelixTagged: true`**: Ensures the server-side controller dispatch triggers the agent.
3. **Poll for agent reply**: Use the established polling pattern (5-second intervals, configurable max duration) to check for an `isAgentAuthored` reply.
4. **Progress indication**: Print dots or a spinner during the polling wait so the user knows the CLI is waiting.
5. **Timeout fallback**: If the agent does not reply within the window, print the posted comment ID and exit with a non-zero code.
6. **`--json` output mode**: Return structured JSON output for machine consumption.
7. **Threading support**: Accept `--parent <commentId>` for follow-up messages in the same thread.

## Features Explicitly Out of Scope (MVP)

- **Streaming output**: The CLI prints the complete reply, not a stream of tokens.
- **Interactive REPL mode**: No multi-turn REPL; each invocation is a single message/reply pair.
- **Offline/cached replies**: No local caching of agent responses.
- **Rich formatting**: Agent reply content is printed as plain text (or raw JSON in `--json` mode).

## Success Criteria

1. `hlx comments converse --ticket <id> <message>` prints the Helix agent's reply to stdout.
2. The posted comment and agent reply are visible in the web UI.
3. `--json` mode outputs structured JSON suitable for scripting.
4. Progress indication is shown during the wait.
5. Timeout produces a clear message with the posted comment ID.
6. No regressions to existing `hlx comments post` or `hlx comments list` behavior.

## User Scenarios

[SCN-01] Send a message and receive the agent's reply in the terminal
- Precondition: User is authenticated and has access to a ticket with an active or idle host agent session
- Action: User runs `hlx comments converse --ticket <id> "Why did the run fail?"`
- Expected Outcome: The CLI prints the Helix agent's reply content to stdout after a brief wait

[SCN-02] Follow up in the same conversation thread
- Precondition: User has already sent a message via SCN-01 and received a reply with a comment ID
- Action: User runs `hlx comments converse --ticket <id> --parent <commentId> "Can you show the specific error?"`
- Expected Outcome: The CLI prints a follow-up reply that reflects context from the prior exchange

[SCN-03] Machine-readable output for scripting
- Precondition: User or script has CLI access to a ticket
- Action: User runs `hlx comments converse --ticket <id> --json "Summarize the run"`
- Expected Outcome: The CLI outputs a JSON object containing the agent reply content, comment IDs, and status

[SCN-04] Timeout when agent is slow
- Precondition: User has access to a ticket, but the agent is under load
- Action: User runs `hlx comments converse --ticket <id> "What happened?"` and the agent does not reply in time
- Expected Outcome: The CLI prints progress dots during the wait, then outputs a timeout message with the posted comment ID and exits with a non-zero code

[SCN-05] Agent session is unavailable
- Precondition: The ticket has no active host agent session (ERROR, TERMINATED, or no session)
- Action: User runs `hlx comments converse --ticket <id> "Help me understand this error"`
- Expected Outcome: The CLI prints the error/status message returned by the server and exits with a non-zero code

## Key Design Principles

- **Reuse existing patterns**: Follow the polling pattern from `playbook/check.ts` and the HTTP client from `lib/http.ts`. No new dependencies.
- **Zero runtime dependencies**: Maintain the CLI's pure Node.js architecture.
- **Exit codes matter**: Zero for success, non-zero for timeout or error, enabling scripting.

## Scope & Constraints

- **This repo**: helix-cli only. The CLI relies on the server's HTTP controller for dispatch; no dispatch logic lives in the CLI.
- **No new server endpoints**: The CLI uses existing `POST /api/tickets/{ticketId}/comments` and `GET /api/tickets/{ticketId}/comments`.
- **Polling, not SSE**: The CLI polls for the reply rather than subscribing to SSE, matching the existing CLI pattern.
- **HTTP client timeout**: `hxFetch` has a 30-second per-request timeout with 3 retries. Individual poll requests stay within this budget; the overall converse timeout is separate.

## Future Considerations

- **Interactive REPL mode**: Allow a multi-turn back-and-forth session without re-running the command.
- **SSE-based wait**: Switch from polling to SSE for lower-latency reply detection.
- **`--wait` flag on existing `post` command**: Instead of a separate subcommand, add a flag to `hlx comments post` that waits for the reply.

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|----------------|--------|
| 1 | What is the optimal polling interval and max timeout? 5s/10min matches playbook/check.ts but agent replies may take 2-4 min. | Too short = premature timeout; too long = wasted time |
| 2 | Should the CLI detect the system-tier ack (sub-second) and continue waiting for the host-tier reply? | Returning the ack is fast but unhelpful; waiting for host reply is slower but useful |
| 3 | How should threading work when the user doesn't know the parent comment ID? | Could auto-detect the latest comment in a thread, but adds complexity |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | Core requirements | CLI converse command needed alongside MCP tool |
| scout/scout-summary.md (helix-cli) | Map CLI comment infrastructure and polling patterns | POST omits isHelixTagged; polling pattern in playbook/check.ts (5s/120 polls); zero runtime deps |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI-specific root cause and fix shape | New converse subcommand; POST with isHelixTagged; poll for reply; progress indication |
| scout/scout-summary.md (helix-global-server) | Understand server dispatch that CLI relies on | HTTP controller has full dispatch; CLI POST goes through this path when isHelixTagged is set |
| diagnosis/apl.json (helix-global-server) | Session state handling and latency expectations | Five session states; system ack <1s; host reply 2-4 min |
| repo-guidance.json (library) | Repo intent boundaries | helix-cli = secondary target; relies on server HTTP dispatch |
