# Ticket Context

- ticket_id: cmphgyhnk01caek0unhe2tg5d
- short_id: BLD-577
- run_id: cmphgyho201cfek0ucm3g5fj5
- run_branch: helix/build/BLD-577-final-live-host-agent
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Final Live Host Agent

## Description
This is a final run for the Live Helix Agent. Make sure the report is fully implemented and the system works from beginning to end 



Think about the UX and make sure it is smooth and appropriate.



2-4 minute wait for startup is fine to begin with.



As a good UX I think that all communication should come from the same agent. There should not be three layers. It should all come from this one agent. If it's slow to start up the first time, that's fine. We'll optimize that later.

## Research Report

# Live Helix Agent: From Imposter to Host

## Research Report -- RSH-551

---

## The Simple Version

Right now, when you submit a ticket to Helix, two things hurt:

**First, the silence.** You put in a ticket, start a run, and then you wait. The 10-step workflow grinds through scout, diagnosis, product, tech-research, implementation-plan, implementation, code-review, verification, and preview-config. The average successful run takes over 3.5 hours. The only auto-comment fires at the very end -- `postCompletionComment()` in orchestrator.ts, lines 2444 and 2755. Until that point, you have zero evidence that Helix understood what you asked for.

**Second, the imposter.** When you @Helix in the comments -- to ask a question, raise a concern, or follow up -- you get a reply from an agent that is not the same Helix that worked on your ticket. It is a stateless, fresh agent with no sandbox, no codebase access, no CLI, and exactly 3 database-query tools. It cannot reference your code, cannot look at related tickets, and has no memory of prior conversations. The RSH-365 research named this the "imposter problem": you see the same "H" badge, but behind it is a stranger with a name badge.

**The solution: the Host Agent.** A persistent, full-capability agent that fires on a sprites.dev VM the moment a run starts. It reads your ticket, inspects the codebase, and within minutes posts a quality confirmation: "I get you. You want to accomplish X. You're concerned about Y. I understand." Then it stays alive for the life of the ticket, handling all your @Helix comments with the same depth as the 10-step workflow agents -- real code access, real CLI, real session memory. No more imposter.

The Host Agent is the first concrete step toward the Ego Agent vision described in RSH-320 and RSH-365. It fills the ticket-level Identity gap that the fractal pattern predicts. It runs on the sprite infrastructure already validated by RSH-446. And it is built as a natural extension of the existing server-side architecture -- not a rewrite, but an upgrade.

---

## Should I Go Ahead With This?

**Yes.** Here is the evidence:

- **The wait is real and measured.** Production data shows the average successful run takes 216.5 minutes (3.6 hours). The median is 49.5 minutes, the p90 is 327.8 minutes. During all of that time, there is zero quality feedback to the user. The only auto-comment fires at run completion.

- **The imposter is well-documented.** The current comment agent (`helix-reply-service.ts`) uses `persistSession: false` (line 719), has only 3 MCP tools (lines 686-689), and rebuilds context from DB queries alone (lines 247-265). By contrast, the workflow agents operate in Vercel sandboxes with full repo clones, the helix-cli, library access, and 15+ context fields.

- **The infrastructure is already proven.** sprites.dev has been validated for preview deployments with near-zero infrastructure failures (RSH-446). The SDK, the provisioning patterns, and the cleanup lifecycle all exist in production today.

- **The research is thorough.** Three prior research tickets -- RSH-320 (Ego Agent), RSH-365 (Ego Agent Continued), and RSH-446 (Preview with sprites.dev) -- collectively establish the theoretical foundation, the practical principles, and the infrastructure validation. This is not speculation; it is a well-grounded next step.

- **The scope is contained.** The primary changes are in helix-global-server: a new service, modified comment routing, a run-start hook, and a schema extension. No structural UI changes. No CLI changes. No library changes. The existing SSE comment pipeline carries Host Agent responses without modification.

---

## 1. The Two Problems

### 1.1 No Quality Confirmation

When a user submits a ticket and starts a run, the Helix system enters a sequential 10-step workflow:

```
scout -> diagnosis -> product -> tech-research -> implementation-plan
  -> implementation -> code-review -> verification -> preview-config
```

This chain is executed by `workflow-step-chain.ts` (line 679), which enforces a deterministic step order with only one exception: a verification-to-implementation retry (lines 904-1013, max 2 attempts). There is no hook, no callback, and no code path that sends a user-facing comment between run start and run completion.

The only auto-comment is `postCompletionComment()` in `orchestrator.ts`, invoked at line 2444 (SUCCEEDED outcome) and line 2755 (UNVERIFIED outcome). Both fire after the entire workflow is done.

**Production evidence** (runtime-verified, last 90 days):

| Metric | Value |
|--------|-------|
| Total runs | 1,357 |
| Successful runs | 854 |
| Failed runs | 296 |
| Average successful run duration | 216.5 minutes (3.6 hours) |
| Median successful run duration | 49.5 minutes |
| P90 successful run duration | 327.8 minutes (5.5 hours) |
| Tickets created (90 days) | 626 |
| Total reruns (with parentRunId) | 774 (57.1%) |

That means: on a typical run, the user waits nearly an hour (median) to over 3 hours (average) before seeing any confirmation that Helix understood the request. For complex tickets at the p90, the wait approaches 5.5 hours.

The ticket owner described this directly: *"You shouldn't have to wait an hour and a half to see that Helix gets it. It should be immediately in the chat."*

### 1.2 The Imposter Agent

The current comment reply system is `helix-reply-service.ts`. When a user posts an @Helix comment, `comment-controller.ts` (line 124) fires a non-blocking call to `generateHelixReply()`. This creates a fresh Claude Agent SDK `query()` with:

- **`persistSession: false`** (line 719) -- no conversational continuity between comment exchanges
- **3 MCP tools** (lines 686-689): `run_ticket`, `get_run_details`, `get_step_artifact` -- all database-query tools
- **Context from DB queries only** (lines 247-265): ticket title/description/status, last 10 run summaries, comment history
- **A 67-line generic system prompt**: "You are Helix, an AI collaborator"
- **5-minute timeout** with a fallback "I'm working on this" response

Compare this to what the 10-step workflow agents have:

| Capability | Workflow Agent | Comment Reply Agent | Gap |
|-----------|---------------|-------------------|-----|
| Repository access | Full repo clones via Vercel sandbox | None | Complete |
| Run history depth | 20-level ancestor chain (`run-store.ts`) | Last 10 runs as text | Severe |
| Referenced tickets | Materialized content | Not available | Complete |
| APL artifacts | Full chain via `ancestor-artifact-lookup.ts` | Not available | Complete |
| CLI access | `hlx` with tickets, library, inspect | Not available | Complete |
| System prompt | 200+ line step-specific prompt | 67-line generic prompt | Severe |
| Session persistence | Within-run (sandbox lifetime) | `persistSession: false` | Complete |
| Available tools | All SDK tools + sandbox filesystem | 3 MCP tools | Severe |

RSH-365 articulated this gap precisely: *"The 'imposter' is not a broken feature. It is a structural consequence of the context gap."* The report documented a 10-dimension context comparison and found **4 complete gaps, 3 severe gaps, and 3 moderate gaps** between the step agent and the reply agent.

The client-side rendering compounds the problem. In `comment-item.tsx` (lines 168-179), both step-agent comments and reply-agent comments receive the same "H" badge via the `isAgentAuthored`/`isHelixTagged` flags. The user sees two "H"-badged responses and expects them to be the same entity. They are not.

---

## 2. Research Foundation

The Host Agent is not designed from scratch. It synthesizes three completed research tickets that collectively establish the theory, principles, and infrastructure.

### 2.1 The Ego Agent Vision (RSH-320)

RSH-320 investigated the concept of a persistent observer-advisory agent -- the Ego Agent -- that would sit alongside the 10-step workflow, observing step outputs and providing advisory directives.

**Four archetype validations** grounded the concept in established scholarship:

| Metaphor | Established Principle | Primary Citation | Mapping Strength |
|----------|----------------------|-----------------|-----------------|
| Left-brain / Right-brain | Dual-process theory | Kahneman, *Thinking, Fast and Slow* (2011) | Strong |
| Gevurah / Tiferet | Resilience engineering, graceful extensibility | Woods, "Theory of Graceful Extensibility" (2018) | Strong |
| King / Jester | Devil's advocate; meta-agent/supervisor | Janis, *Victims of Groupthink* (1972); Wooldridge, *MultiAgent Systems* (2009) | Strong |
| Earth / Water | Rigid frameworks with adaptive mechanisms | Woods (2018), general engineering principle | Moderate-to-strong |

The cross-disciplinary conclusion: *"Structure and adaptability are complementary, not opposing. Systems that have only structure become brittle. Systems that have only adaptability become chaotic. The ego agent concept occupies the balance point."*

**Two architectural gaps identified:**

1. **The 10% Rigidity Gap**: The orchestrator's deterministic 9-step chain cannot adapt to non-linear situations -- looping back to tech-research after verification, propagating signals between non-adjacent steps, or dynamically adjusting prompts based on cross-step observations. The `beforeStep` callback returns `Promise<void>` (`workflow-step-chain.ts`, lines 726-728), explicitly refusing advisory input.

2. **The Identity Loss Gap**: When the orchestrator finishes, all agent state dissipates -- sandbox stopped, in-memory state cleared (`clearActiveRunState()` at `active-run-registry.ts`, line 84), agent sessions destroyed (`persistSession: false`). The post-run reply agent is a "context-reconstructed approximation."

**The A+B Hybrid recommendation**: Combine an observer ego agent (Option A) with advisory directives via enhanced `beforeStep` (Option B). The ego agent persists its Claude SDK `session_id` as `egoSessionId` on `SandboxRun`. The reply service resumes this session instead of creating fresh ones. This is the architectural blueprint the Host Agent implements at the ticket level.

### 2.2 Five Foundational Principles (RSH-365)

RSH-365 continued the Ego Agent research and produced five principles that govern how the Host Agent should be designed:

**Principle 1: The Triad (Structure x Flexibility x Identity)**

> "Every level of an AI system requires three co-equal dimensions: Structure (deterministic process that guarantees progress), Flexibility (recorded decisions that enable correction and adaptation), and Identity (persistent, context-rich agency that makes the system a coherent entity rather than a collection of stateless calls)."

RSH-320 established the Structure-Flexibility axis. RSH-365 elevated Identity to co-equal status after the "imposter" experience. The Host Agent is the first implementation of Identity at the ticket level.

**Principle 2: Context IS Identity**

> "An AI agent's identity is constituted entirely by the richness of its context. The same underlying model with different context is not a limited version of the same agent -- it is a fundamentally different agent. This is not a metaphor."

This is the core principle behind the Host Agent's design: giving it the same codebase access, CLI access, and library access as the workflow agents makes it a fundamentally different -- and fundamentally better -- agent than the current stateless reply service. Same model, different context, different agent.

**Principle 3: The Fractal Pattern**

> "The same triad (Structure x Flexibility x Identity) repeats at every level of scale. A solution at one level is not just a solution -- it is a template for every other level."

RSH-365 identified three levels and their triad coverage:

| | Structure | Flexibility | Identity |
|---|---|---|---|
| **Step level** | Present | Present | Present (but transient) |
| **Ticket level** | Present | Partial | **Absent** |
| **Helix level** | Absent | Absent | Absent |

The Host Agent fills the ticket-level Identity gap -- the primary gap and the highest priority.

**Principle 4: Autonomy Through Accountability**

> "The third path between human-in-the-loop and full autonomy: the AI runs to completion autonomously, records every decision point, and humans rewind after the fact. Record, don't ask."

The Host Agent extends this: instead of asking the user to wait for the full run, it confirms understanding immediately and records its observations for later interaction. The user can correct direction via comments at any time.

**Principle 5: Asynchronous Collaboration**

> "Human-AI interaction should be persistent, threaded, and non-blocking. Neither party should block the other. Comments, not chat."

The Host Agent embodies this: it posts the confirmation asynchronously (not blocking the workflow), and subsequent comment interactions are threaded and non-blocking. The user's explicit direction: *"We actually want to stay away from chatting with Helix because we don't want to get distracted from chat. We are more about long-running processes."*

**The Imposter Problem**: RSH-365's central finding. The report documented the full 10-dimension context gap (see Section 1.2 above) and concluded that the imposter is a structural problem, not a bug. The reply agent and the step agent are, by the Context IS Identity principle, fundamentally different agents wearing the same badge.

**The 3x3 Fractal Matrix**: RSH-365 mapped the triad across three levels of the system. The diagonal from top-left to bottom-right tells the story: strong at the step level, degrading at the ticket level, entirely absent at the Helix level. The Host Agent addresses the most critical cell: ticket-level Identity.

### 2.3 Sprite Infrastructure (RSH-446)

RSH-446 validated sprites.dev as a reliable infrastructure platform by designing the replacement of Northflank for preview deployments.

**Key findings:**

- **Near-zero infrastructure failures expected**: The current preview system on Northflank has a 31.9% failure rate (53 out of 166 deployments in 30 days). Root cause: Docker BuildKit failures inside Northflank's infrastructure. sprites.dev eliminates Docker entirely -- commands run directly on Linux VMs.

- **Single-sprite-per-ticket model validated**: One sprite runs all services (frontend, backend, etc.) using managed services with dependency ordering. The user directed this: *"I think it's silly to put them on different sprites and then worry about resolving it."*

- **Provisioning time: 2-5 minutes**: Lighter than Northflank's 3-7 minutes because there is no Docker build step. VM creation is ~5 seconds; the time is dominated by `git clone` + `npm ci`.

- **Full VM capabilities**: `sprite.exec()` runs arbitrary shell commands; `sprite.createService()` starts long-running processes with automatic restart; persistent filesystem; public URLs via `.sprites.app`.

- **Phase 2 reuse explicitly planned**: RSH-446 identified the sprite patterns (client setup, lifecycle management, exec-based provisioning) as directly reusable for a "Helix/Comments environment" in Phase 2. The Host Agent is that Phase 2.

**Production evidence** (runtime-verified, last 30 days):

| Metric | Value |
|--------|-------|
| Total runs | 600 |
| Runs with preview deployment | 187 (31.2%) |
| Preview deployment success rate | ~96.3% (180 READY) |

The sprite infrastructure is already proven in production for previews. The Host Agent reuses the same SDK (`@fly/sprites` v0.0.1), the same provisioning patterns, and the same cleanup lifecycle.

---

## 3. The Host Agent Architecture

### 3.1 Execution Model: Server-Side Claude SDK with Sprite-Backed MCP Tools

The Host Agent runs as a Claude Agent SDK `query()` on helix-global-server, with MCP tools that bridge to a sprite VM via `sprite.exec()`. This is the same pattern the current reply service uses -- but with dramatically richer tools.

**Why this model (AD-1)**:

| Option | Description | Verdict |
|--------|-------------|---------|
| A. Server-side SDK + sprite MCP tools | Server runs Claude SDK, tools bridge to sprite | **Chosen** -- extends proven `helix-reply-service.ts` pattern |
| B. Agent runtime inside sprite | Sprite runs Claude SDK locally | Deferred -- eventual Ego Agent target, but adds orchestration complexity for MVP |
| C. Cloudflare managed agents | External platform | Not validated -- mentioned as reference only |

The existing `helix-reply-service.ts` already runs Claude Agent SDK server-side with MCP tools. Option A replaces the 3 DB-only tools with a richer set:

```
Server (helix-global-server)
  |
  |-- Claude Agent SDK query()
  |     |-- MCP Tool: read_file     --> sprite.exec("cat <path>")
  |     |-- MCP Tool: search_code   --> sprite.exec("grep -rn ...")
  |     |-- MCP Tool: list_files    --> sprite.exec("find ...")
  |     |-- MCP Tool: exec_command  --> sprite.exec(cmd)
  |     |-- MCP Tool: run_helix_cli --> sprite.exec("hlx <cmd>")
  |     |-- MCP Tool: run_ticket    --> (existing DB tool, retained)
  |     |-- MCP Tool: get_run_details --> (existing DB tool, retained)
  |     |-- MCP Tool: get_step_artifact --> (existing DB tool, retained)
  |
  v
Sprite VM (ha-{ticketId})
  |-- /app/{repo-name}/  (shallow git clones)
  |-- hlx (helix-cli, globally installed)
  |-- Node.js runtime
```

The sprite provides the codebase. The server provides the orchestration and session management. Together, they give the Host Agent the same capabilities as a workflow agent without the complexity of running an agent runtime inside the sprite.

### 3.2 Two-Phase Confirmation

The confirmation strategy (AD-5) directly addresses the ticket owner's description of the ideal experience:

> *"Maybe Helix says, 'Let me look into it right away,' and then a few minutes later I totally get it."*

**Phase 1: Immediate Lightweight Acknowledgment (< 1 second)**

A simple server-side comment posted synchronously at run start via `createComment()`. No sprite dependency. No AI inference. Something like:

> "Got it -- let me look into this right away. I'll get back to you in a few minutes with my understanding."

This eliminates the perception gap. The user sees immediate evidence that Helix received the request.

**Phase 2: Quality Codebase-Aware Confirmation (2-4 minutes)**

After the sprite is provisioned and repos are cloned, the Host Agent runs a confirmation query with:
- The ticket description and any user concerns
- Key codebase files (README, package.json, src/ structure) read from the sprite
- Referenced ticket summaries via `hlx`
- Adaptive thinking at `medium` effort for speed

The output is constrained to maximum 2 paragraphs:
- **Paragraph 1**: Goals restated in the agent's own words, demonstrating genuine understanding
- **Paragraph 2**: Concerns acknowledged with specific, codebase-grounded reassurances

**User experience timeline:**

```
0s         User starts run
< 1s       Phase 1 ack: "Let me look into this right away."
~60s       Sprite VM created, repos cloning...
~90s       Repos cloned, CLI installed, confirmation query starts
2-4 min    Phase 2 confirmation: "I understand. You want to accomplish X..."
           Host Agent now ACTIVE and ready for comment interactions
```

### 3.3 Session Persistence

The Host Agent maintains conversational continuity using Claude Agent SDK session resumption (AD-3).

**How it works:**

1. First `query()` call (confirmation) emits a system init message with a `sessionId`
2. The `sessionId` is captured and stored in `HostAgentSession.claudeSessionId`
3. Subsequent comment interactions call `query()` with `resume: sessionId`
4. The SDK maintains full conversation history and tool results across all interactions

This directly implements the `egoSessionId` concept from RSH-320 and follows RSH-446's recommendation that conversational continuity should use Claude SDK sessions, not sprite state.

**Fallback behavior**: If session resumption fails (session expired, server restart), the system falls back to DB-reconstructed context -- the same approach the current reply service uses, but with richer context from the sprite. This is graceful degradation, not a complete failure.

### 3.4 Comment Routing

The comment routing strategy (AD-4) uses conditional dispatch with graceful fallback:

```
User posts @Helix comment
  |
  v
comment-controller.ts (line 124)
  |
  |-- Check: does this ticket have an ACTIVE HostAgentSession?
  |     |
  |     |-- YES --> Route to Host Agent handler
  |     |           (resume session, query with codebase tools)
  |     |
  |     |-- NO  --> Fall back to existing helix-reply-service.ts
  |                 (stateless, 3 tools, DB context only)
```

**Why fallback matters:**
- Tickets created before this feature have no Host Agent session
- If sprite provisioning fails, comments still work (degraded quality, not broken)
- Enables gradual rollout via feature flag (provision Host Agent for new runs, skip for old ones)

### 3.5 Sprite Lifecycle

Each ticket gets a dedicated Host Agent sprite (AD-2), separate from the preview sprite.

**Why separate sprites:**

The Host Agent must be available from run start (for confirmation) through the entire ticket lifetime (for comments). Preview sprites are created near the end of the workflow and are ephemeral per-run. Their lifecycles do not align. The ticket owner acknowledged this: *"Eventually maybe we'll merge them but for now we can have the agents of Helix running in Vercel and the more dynamic agent running on a sprite."*

**Sprite specifications (TD-1):**

| Spec | Host Agent | Preview (existing) |
|------|------------|-------------------|
| RAM | 512 MB | 1024 MB |
| CPUs | 1 | 2 |
| Storage | 5 GB | 10 GB |
| Region | ord (Chicago) | ord (Chicago) |
| Naming | `ha-{ticketId}` | `pv-{ticketId}` |

The Host Agent sprite is lighter because it only needs code access and CLI -- no build steps, no running services, no serving traffic.

**Provisioning flow** (adapted from `preview-deployment.ts` lines 507-569):

1. Create sprite: `client.createSprite('ha-{ticketId}', {ramMB: 512, cpus: 1, storageGB: 5})`
2. Clone ticket's repos: shallow clone (depth 1) using org PAT via `loadOrganizationPatTokenOrThrow()`
3. Install helix-cli globally: `npm install -g @projectxinnovation/helix-cli`
4. Skip build steps (read-only code analysis, not service hosting)
5. Mark session as ACTIVE

**Estimated provisioning time: 1-2 minutes** (faster than preview because no build/service startup).

**Cleanup triggers (TD-5):**
- Ticket archived (existing `cleanupTerminalTicketResources` hook)
- New run starts with existing Host Agent that needs refresh
- Explicit error (sprite provisioning failure)
- Idle timeout (sprites.dev auto-sleeps idle VMs natively)

### 3.6 MCP Tools (Capability Surface)

The Host Agent's MCP tools are the key to closing the capability gap. They fall into two categories:

**Sprite-bridged tools** (new):

| Tool | Implementation | Purpose |
|------|---------------|---------|
| `read_file` | `sprite.exec("cat <path>")` | Read file contents from repos on sprite |
| `search_code` | `sprite.exec("grep -rn ...")` | Search codebase on sprite |
| `list_files` | `sprite.exec("find ...")` | List files/directories on sprite |
| `exec_command` | `sprite.exec(cmd)` | Run arbitrary commands (e.g., analyze dependencies) |
| `run_helix_cli` | `sprite.exec("hlx <cmd>")` | Access tickets, library, inspect via CLI |

**Existing DB tools** (retained from current reply service):

| Tool | Purpose |
|------|---------|
| `run_ticket` | Trigger new runs |
| `get_run_details` | Read run status and metadata |
| `get_step_artifact` | Read step-level artifacts |

The `run_helix_cli` tool is particularly powerful: it gives the Host Agent access to `hlx comments post` (post comments), `hlx tickets list/get` (cross-ticket intelligence), `hlx library list/show` (research library access), and `hlx inspect` (runtime inspection). This single tool bridges the gap between the 3-tool reply agent and the full-capability workflow agents.

---

## 4. Schema Design

A new `HostAgentSession` Prisma model (AD-6) tracks the Host Agent's lifecycle per ticket:

```prisma
model HostAgentSession {
  id              String   @id @default(cuid())
  ticketId        String   @unique    // One active session per ticket
  ticket          Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  spriteName      String               // "ha-{ticketId}" -- the sprite VM name
  claudeSessionId String?              // Set after first query(); enables resume
  status          String   @default("PROVISIONING")
                                       // PROVISIONING | ACTIVE | ERROR | TERMINATED
  errorMessage    String?              // Populated on ERROR status
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([ticketId])
  @@index([organizationId, status])
}
```

**Why a dedicated model** (over JSON fields on Ticket or SandboxRun):
- The Host Agent has a distinct lifecycle: ticket-level, not run-level. It persists across multiple runs.
- Queryable by status for comment routing, monitoring, and cleanup.
- Clean separation of concerns -- no overloading existing models.
- Compatible with future Ego Agent evolution (the model can grow to support advisory directives, observation history, etc.).

**Lifecycle states:**

```
PROVISIONING --> ACTIVE --> TERMINATED
      |                        ^
      |                        |
      +------> ERROR ----------+
```

- **PROVISIONING**: Sprite VM being created, repos cloning
- **ACTIVE**: Sprite ready, Host Agent accepting queries
- **ERROR**: Provisioning or query failure (with `errorMessage`)
- **TERMINATED**: Sprite destroyed (ticket archived or cleanup)

---

## 5. Implementation Scope

### helix-global-server (PRIMARY TARGET)

This is where all Host Agent logic lives.

**New files:**

| File | Purpose |
|------|---------|
| `src/services/host-agent-service.ts` | Core service: provisioning, confirmation, comment handling, cleanup |
| `prisma/migrations/{timestamp}_add_host_agent_session/` | Prisma migration for new model |

**Modified files:**

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `HostAgentSession` model |
| `src/helix-workflow/orchestrator.ts` | Add parallel fire-and-forget call to Host Agent provisioning at run start (~line 701) |
| `src/routes/comment-controller.ts` | Add Host Agent routing check before `generateHelixReply()` (line 124) |
| `src/config/env.ts` | Add config entries: `HOST_AGENT_MODEL`, sprite specs, timeout |

**Unchanged files** (verified not affected):

| File | Reason |
|------|--------|
| `helix-reply-service.ts` | Retained as fallback -- no modifications needed |
| `sprites/client.ts` | Reused as-is via existing singleton |
| `preview-deployment.ts` | Preview lifecycle unchanged |
| `comment-events.ts` | SSE pipeline unchanged -- Host Agent posts through existing `createComment()` |

### helix-global-client (MINOR -- CONTEXT ONLY)

The client's existing comment rendering and SSE pipeline handle Host Agent responses without modification. The only potential change:

- **"Helix is thinking..." timeout**: The current 90-second soft timeout in `discussion-section.tsx` (lines 252-264) may need adjustment if Host Agent confirmation takes 2-5 minutes. However, this timeout applies to user-triggered @Helix comments, not system-initiated comments. Once the sprite is provisioned, reply times should be within 90 seconds. **Recommendation: monitor and adjust if needed, not an MVP change.**

### helix-cli (NO CHANGES)

Used as-is inside the Host Agent sprite. Already works in any Node.js environment with API token auth. Provides the capability surface that makes the Host Agent powerful: `hlx comments`, `hlx tickets`, `hlx library`, `hlx inspect`.

### library (NO CHANGES)

Research-only repository. This report is its contribution to RSH-551.

### Estimated effort

| Area | Scope | Estimate |
|------|-------|----------|
| Host Agent service (new) | ~300-400 lines | 2-3 days |
| Schema + migration | ~20 lines + migration | 0.5 day |
| Orchestrator hook | ~10-15 lines | 0.5 day |
| Comment routing | ~20-30 lines | 0.5 day |
| Config additions | ~15 lines | 0.5 day |
| Testing + tuning | Confirmation prompt, timing, edge cases | 2-3 days |
| **Total** | | **6-8 days** |

---

## 6. Performance Expectations

| Metric | Target | Basis |
|--------|--------|-------|
| Phase 1 ack latency | < 1 second | Server-side `createComment()` with no external dependencies |
| Sprite provisioning | 1-2 minutes | Lighter spec than preview (no build/service), shallow clone only |
| Phase 2 confirmation (end-to-end) | 2-4 minutes | Provisioning + Claude SDK query with medium effort |
| @Helix comment reply (active sprite) | 30-90 seconds | No provisioning needed; session resume + query |
| @Helix comment reply (inactive sprite) | 2-4 minutes | Requires re-provisioning (rare -- sprites auto-sleep but persist) |

**Resource requirements per active ticket:**

| Resource | Host Agent Sprite | Preview Sprite (existing) | Combined |
|----------|------------------|--------------------------|----------|
| RAM | 512 MB | 1024 MB | 1536 MB |
| CPUs | 1 | 2 | 3 |
| Storage | 5 GB | 10 GB | 15 GB |

Note: Not all tickets will have both sprites simultaneously. The Host Agent sprite starts at run begin; the preview sprite is created near the end. Their peak resource usage is typically staggered.

---

## 7. What This Does NOT Include

| Deferred Item | Rationale |
|---------------|-----------|
| **Multi-channel communication** (email, WhatsApp, Telegram) | Ticket explicitly defers: *"Eventually we'd like this agent to be able to communicate... Right now through the comments is fine."* |
| **Full Ego Agent merger** | The Host Agent is a stepping stone. Merging with the 10-step workflow agents is the RSH-320/RSH-365 vision but not in this iteration. |
| **Agent runtime inside sprite** (Option B from AD-1) | Adds orchestration complexity. Server-side SDK is simpler for MVP. Deferred to Ego Agent phase. |
| **Shared sprite for Host Agent + preview** | Lifecycle mismatch (Host Agent starts early, preview starts late). Merge when lifecycle alignment is proven. |
| **Sprite checkpointing** | RSH-446 deferred to Phase 2/3. Not needed for MVP since Claude SDK sessions handle continuity. |
| **Pre-ticket sprite warm-up** | Optimization from ticket: *"Before they put in the ticket, we have one waiting."* Reduces latency but adds complexity. Deferred. |
| **Host-Agent-to-workflow communication** | No bi-directional protocol for MVP. The Host Agent and workflow agents run independently. |
| **Library item comment upgrade** | Separate `library-helix-reply-service.ts` exists. This ticket focuses on ticket comments only. |
| **Client UI redesign for confirmation** | Existing comment rendering and SSE pipeline suffice. No new UI components for MVP. |
| **Cloudflare managed agents evaluation** | Referenced in ticket as alternative. Not validated; not committed. |

---

## 8. Open Questions & Risks

### Open Questions

| # | Question | Impact | Current Answer |
|---|----------|--------|----------------|
| 1 | **Sprite provisioning latency**: Can the 2-5 minute confirmation target be met? | Core confirmation promise | Likely yes -- lighter spec (no build), estimated 1-2 min provisioning + query time. Two-phase strategy provides immediate ack while quality confirmation prepares. |
| 2 | **Sprite persistence model**: Can sprites support long-running persistent agents? | Session continuity | Claude SDK sessions handle continuity, not sprite state. Sprites are persistent VMs by default (auto-sleep when idle, resume on access). |
| 3 | **Shared vs. dedicated sprites**: Should Host Agent share the preview sprite? | Resource cost | Dedicated for now (lifecycle mismatch). Merge later when lifecycle alignment proven. |
| 4 | **Session storage mechanism**: Where does conversation context persist? | Resilience | Claude SDK `resume: sessionId` server-side. Fallback to DB-reconstructed context on failure. |
| 5 | **Resource/cost implications**: A persistent sprite per ticket adds cost. | Scaling | 512 MB/1 CPU is lightweight. sprites.dev auto-sleeps idle VMs. Monitor resource usage post-launch. |
| 6 | **"Helix is thinking..." timeout**: 90-second UI timeout vs. 2-5 minute confirmation. | UX | Phase 1 ack is < 1s (within timeout). Phase 2 confirmation is system-initiated (not subject to thinking timeout). Monitor and adjust. |
| 7 | **Confirmation prompt quality**: The right tone needs iteration. | User trust | Start with a speed-optimized prompt constraining to 2 paragraphs. Iterate based on user feedback. |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| sprites.dev SDK instability (v0.0.1) | Medium | Medium | Pin exact version; wrap calls; REST fallback if SDK breaks |
| Sprite provisioning failure | Low | Medium | Fallback to existing reply service; user still gets response, just lower quality |
| Claude SDK session size limits | Low | Low | Monitor session growth; sessions cover ticket lifetime, not the full 10-step run |
| Confirmation quality misses the mark | Medium | High | Iterate prompt; start with constrained 2-paragraph format; tune effort level |
| Resource cost escalation | Low | Medium | Lightweight sprite spec; auto-sleep; cleanup on ticket archive |
| Sprite VM lacks Node.js | Low | Low | Check and install via fnm on first provision (adds ~1-2 min, one-time) |

---

## 9. How This Connects to the Bigger Picture

### The Ego Agent Roadmap

The Host Agent is not a standalone feature. It is Phase 1 of the Ego Agent trajectory established by RSH-320 and RSH-365:

```
Phase 1: Host Agent (this ticket)
  - Ticket-level Identity via persistent session on sprite
  - Quality confirmation + quality comments
  - Parallel to workflow, no integration

Phase 2: Advisory Host Agent
  - Host Agent observes workflow step outputs (afterStep callback from RSH-320)
  - Produces advisory directives for steps (enhanced beforeStep from RSH-320)
  - Begins Host-Agent-to-workflow communication

Phase 3: Ego Agent Merger
  - Host Agent and workflow agents share state and context
  - Single persistent identity across all interactions
  - Shared or merged sprite for all ticket operations
  - Multi-channel communication (email, WhatsApp, Telegram)
```

### The Fractal Pattern in Action

RSH-365's fractal principle states that the same triad repeats at every level. The Host Agent fills the most critical gap:

| Level | Before Host Agent | After Host Agent |
|-------|------------------|-----------------|
| **Step** | Structure: present, Flexibility: present, Identity: transient | (unchanged) |
| **Ticket** | Structure: present, Flexibility: partial, **Identity: absent** | Structure: present, Flexibility: partial, **Identity: present** |
| **Helix** | All absent | (future work -- ticket-level patterns template Helix-level solutions) |

The Host Agent is the first instantiation of ticket-level Identity. Per the fractal principle, solving it at this level creates a template for the Helix level -- which currently has zero infrastructure for any triad dimension.

### The Paradigm Shift

RSH-365 articulated a paradigm shift: *"We don't make plain API requests anymore."* Every interaction surface must carry context proportional to the expected depth of the interaction. The current reply agent embodies the old paradigm -- fast but shallow. The Host Agent embodies the new paradigm -- contextual and proportional. It responds with the same depth as the workflow agents because it has the same context.

---

## 10. Recommendations

### Priority 1: Build the Host Agent MVP

Implement the architecture described in this report:
- New `host-agent-service.ts` with sprite provisioning, confirmation, and comment handling
- `HostAgentSession` schema model with Prisma migration
- Orchestrator hook for parallel provisioning at run start
- Comment routing with fallback to existing reply service
- Two-phase confirmation (immediate ack + quality confirmation)

**This solves both original pain points in a single, contained change.**

### Priority 2: Monitor and Tune

After launch, track:
- Phase 2 confirmation latency (target: 2-4 minutes)
- Confirmation quality (does it convince users that "Helix gets it"?)
- Comment reply latency with active sprite (target: 30-90 seconds)
- Sprite resource usage (is 512 MB/1 CPU sufficient?)
- Fallback frequency (how often does the old reply service still handle comments?)

### Priority 3: Plan Shared Sprite Optimization

Once both Host Agent and preview sprites are running in production:
- Measure total resource cost per ticket
- Evaluate feasibility of merging onto a single sprite (lifecycle alignment, resource sizing)
- Factor `SpritesClient` setup into a shared `src/services/sprites/client.ts` for reuse

### Priority 4: Begin Advisory Integration (Ego Agent Phase 2)

With the Host Agent established as a persistent entity on the sprite:
- Implement the `afterStep` callback from RSH-320 so the Host Agent can observe step outputs
- Enhance `beforeStep` to optionally return `EgoDirective` -- advisory input to upcoming steps
- This transforms the Host Agent from a parallel entity into an observer-advisor -- the beginning of the Ego Agent.

---

## Data Sources and Methodology

### Research Inputs

| Source | Type | Contribution |
|--------|------|-------------|
| RSH-320 (Ego Agent) | Research report, 2 runs, 45 artifacts | Archetype validation, A+B Hybrid, `egoSessionId`, `afterStep`/`beforeStep` |
| RSH-365 (Ego Agent Continued) | Research report, 3 runs, 69 artifacts | Five principles, imposter problem, fractal pattern, Context IS Identity |
| RSH-446 (Preview with sprites.dev) | Research report, 3 runs, 48 artifacts | Sprite infrastructure validation, failure statistics, single-sprite model |

### Codebase Analysis

| File | Relevance |
|------|-----------|
| `helix-reply-service.ts` (lines 247-719) | Current comment agent: stateless, 3 tools, no sandbox |
| `comment-controller.ts` (line 124) | Comment routing entry point |
| `orchestrator.ts` (lines 166-242, 2444, 2755) | Auto-comment at run end only |
| `workflow-step-chain.ts` (lines 679, 726-728) | Deterministic step chain, void `beforeStep` |
| `sprites/client.ts` | Sprite SDK singleton |
| `preview-deployment.ts` (lines 507-569) | Sprite provisioning pattern |
| `prisma/schema.prisma` (lines 453-477) | Current comment model lacks agent identity |
| `discussion-section.tsx` (lines 252-264) | Client "thinking" timeout |
| `comment-item.tsx` (lines 168-179) | Agent badge rendering |

### Production Data

All production statistics queried via `hlx inspect db --repo helix-global-server` on 2026-05-21:

| Query | Result |
|-------|--------|
| Total runs (90 days) | 1,357 |
| Successful runs | 854 |
| Failed runs | 296 |
| Average successful run duration | 216.5 min |
| Median successful run duration | 49.5 min |
| P90 successful run duration | 327.8 min |
| Tickets (90 days) | 626 |
| Reruns (with parentRunId) | 774 (57.1%) |
| Runs with preview (30 days) | 187 of 600 |

Note: `TicketComment` table was not accessible via runtime inspection (permission denied). Comment interaction statistics are drawn from prior research (RSH-365). Future instrumentation could track @Helix comment frequency and reply quality.

### Scholarly References

1. Kahneman, D. (2011). *Thinking, Fast and Slow.* Farrar, Straus and Giroux.
2. Woods, D.D. (2018). "The Theory of Graceful Extensibility: Basic Rules That Govern Adaptive Systems." *Environment Systems and Decisions*, 38, 433-457.
3. Hollnagel, E., Woods, D.D., & Leveson, N. (2006). *Resilience Engineering: Concepts and Precepts.* Ashgate Publishing.
4. Janis, I.L. (1972). *Victims of Groupthink: A Psychological Study of Foreign-Policy Decisions and Fiascoes.* Houghton Mifflin.
5. Wooldridge, M. (2009). *An Introduction to MultiAgent Systems*, 2nd ed. Wiley.
6. Arizal (Rabbi Isaac Luria). *Etz Chaim* (Shaar HaKelalim).

## Attachments
- (none)
