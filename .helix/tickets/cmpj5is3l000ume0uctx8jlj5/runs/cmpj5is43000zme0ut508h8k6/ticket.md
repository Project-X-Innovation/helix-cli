# Ticket Context

- ticket_id: cmpj5is3l000ume0uctx8jlj5
- short_id: RSH-602
- run_id: cmpj5is43000zme0ut508h8k6
- run_branch: helix/research/RSH-602-email-and-whatsapp-interface-dev-plan
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Email and WhatsApp Interface Dev Plan

## Description
Flesh out the development plan

## Research Report

# Email and WhatsApp Interface Design for Helix

**Research Report RSH-596** | May 2026

---

## Table of Contents

- [1. Vision: Helix Wherever You Are](#1-vision-helix-wherever-you-are)
  - [1.1 The Coherent Theory](#11-the-coherent-theory)
  - [1.2 What It Feels Like to Use](#12-what-it-feels-like-to-use)
  - [1.3 What Problems It Solves](#13-what-problems-it-solves)
  - [1.4 Why This Matters](#14-why-this-matters)
  - [1.5 The Feature Set](#15-the-feature-set)
  - [1.6 How Users Interact — The Four Modes](#16-how-users-interact--the-four-modes)
  - [1.7 Channel-Specific Affordances](#17-channel-specific-affordances)
- [2. Technical Summary](#2-technical-summary)
- [3. Current State Analysis](#3-current-state-analysis)
  - [3.1 Notification Architecture](#31-notification-architecture)
  - [3.2 Comment Pipeline and @Helix Routing](#32-comment-pipeline-and-helix-routing)
  - [3.3 CLI Interface Surface](#33-cli-interface-surface)
  - [3.4 MCP Tool Surface](#34-mcp-tool-surface)
  - [3.5 Infrastructure Gaps](#35-infrastructure-gaps)
- [4. Architecture Design](#4-architecture-design)
  - [4.1 Outbound Notification Pipeline](#41-outbound-notification-pipeline)
  - [4.2 Inbound Message Pipeline](#42-inbound-message-pipeline)
  - [4.3 Thread Correlation](#43-thread-correlation)
  - [4.4 @Helix Integration via Messaging](#44-helix-integration-via-messaging)
- [5. Schema Design](#5-schema-design)
  - [5.1 User Model Extension](#51-user-model-extension)
  - [5.2 NotificationPreference Model](#52-notificationpreference-model)
  - [5.3 NotificationDelivery Model](#53-notificationdelivery-model)
  - [5.4 MessageThread Model](#54-messagethread-model)
  - [5.5 New Enums](#55-new-enums)
- [6. Security Model](#6-security-model)
  - [6.1 Inbound Authentication](#61-inbound-authentication)
  - [6.2 Identity Resolution](#62-identity-resolution)
  - [6.3 Authorization Rules](#63-authorization-rules)
  - [6.4 Data Sensitivity Guards](#64-data-sensitivity-guards)
  - [6.5 Excluded Operations](#65-excluded-operations)
- [7. Inbound Message Processing](#7-inbound-message-processing)
  - [7.1 Webhook Route Design](#71-webhook-route-design)
  - [7.2 Command Parser](#72-command-parser)
  - [7.3 Supported Commands](#73-supported-commands)
  - [7.4 Error Handling and Help Fallback](#74-error-handling-and-help-fallback)
- [8. Vendor Selection](#8-vendor-selection)
  - [8.1 Email Provider Comparison](#81-email-provider-comparison)
  - [8.2 WhatsApp Provider Comparison](#82-whatsapp-provider-comparison)
  - [8.3 WhatsApp Template Messages](#83-whatsapp-template-messages)
  - [8.4 Cost Projections](#84-cost-projections)
  - [8.5 Environment Configuration](#85-environment-configuration)
  - [8.6 New Dependencies](#86-new-dependencies)
- [9. Implementation Roadmap](#9-implementation-roadmap)
  - [9.1 Phase 1: Schema and Outbound Delivery](#91-phase-1-schema-and-outbound-delivery)
  - [9.2 Phase 2: Inbound Processing](#92-phase-2-inbound-processing)
  - [9.3 Phase 3: WhatsApp Channel](#93-phase-3-whatsapp-channel)
  - [9.4 Phase 4: @Helix Routing and Inspect Access](#94-phase-4-helix-routing-and-inspect-access)
  - [9.5 Deferred Items](#95-deferred-items)
- [Appendix A: Interface Comparison](#appendix-a-interface-comparison)
  - [A.1 Capability Matrix](#a1-capability-matrix)
  - [A.2 UX Pattern Comparison](#a2-ux-pattern-comparison)
  - [A.3 Channel Limitations Summary](#a3-channel-limitations-summary)
- [Sources and References](#sources-and-references)

---

## 1. Vision: Helix Wherever You Are

### 1.1 The Coherent Theory

Helix today creates enormous value — it automates ticket workflows, orchestrates deployments, runs AI-assisted code reviews, inspects production systems, and coordinates approvals across a team. But all of that value is locked behind two gates: a browser pointed at the web UI, or a terminal running the CLI. If you are not sitting at your workstation, Helix cannot reach you and you cannot reach it.

This is a delivery problem, not a capability problem. The platform already generates the right information — four notification types covering every key event, 30+ CLI operations, 39 MCP tools, AI-powered @Helix queries. What it cannot do is put that information in front of people where they actually spend their time: their email inbox and their phone.

Email and WhatsApp interfaces solve this by turning Helix from a destination into a service that follows you. The theory is simple: **most Helix interactions are short, asynchronous exchanges** — a notification arrives, you glance at it, you either take a quick action or file it away. These exchanges do not need the full richness of a web UI or a terminal. They need *reach*. Email and WhatsApp are the two channels that reach people in a meeting, on a train, in a taxi, away from a desk, on a phone with no terminal installed.

The feature works in two directions:

**Helix reaches out to you.** When something happens — a ticket completes, someone requests your approval, a colleague comments on your work, an approval response comes back — Helix pushes a notification to your inbox or your phone. You do not need to be logged in. You do not need to remember to check. The information finds you, on your terms, on the channels you have chosen.

**You reach back into Helix.** Every outbound notification is actionable. You reply to approve. You reply to comment. You mention @Helix to ask the AI agent a question — about a ticket, or about your business data. Beyond replying, you can initiate new actions from scratch: send an email to create a ticket, text a command to check the staging queue, ask @Helix a plain-English question about recent orders and drill into the answers conversationally. The loop between "something happened" and "I acted on it" shrinks from hours (wait until I'm at my desk) to seconds (glance, tap, done).

This is not a replacement for the CLI or the web UI. Those retain full operational depth for power users at a workstation. Email and WhatsApp are a *reach layer* — they sacrifice operation breadth for the ability to be everywhere, on every phone, in every inbox, with zero installation and zero learning curve.

### 1.2 What It Feels Like to Use

To understand the feature, follow four people through their day.

**The reviewer in a meeting.** Sarah is a senior developer who reviews tickets. Today, when someone submits a ticket for approval at 2pm, the approval request sits invisibly in the in-app notification feed. Sarah doesn't open Helix until 5pm. That's three hours where the ticket — and everything downstream of it (staging, deployment, feedback) — is blocked. With WhatsApp, Sarah's phone buzzes during her meeting. She glances down and sees:

> *Approval needed for RSH-596: Add retry logic to payment processing*
> *Defense: "Adds exponential backoff to the payment gateway..."*
> [Approve] [Needs Defense] [View in Helix]

She taps "Approve." Three seconds. Back to her meeting. The ticket moves to staging automatically. The submitter gets a notification. The entire pipeline unblocks — not at 5pm, but at 2:01pm.

**The PM checking in from a taxi.** David manages the project but doesn't use the CLI. He wants to know: what shipped today? What's in the staging queue? He pulls out his phone and texts the Helix WhatsApp number:

> staging queue

Ten seconds later:

> *Staging Queue (3 tickets):*
> *1. RSH-601 — Update dashboard filters*
> *2. RSH-598 — Fix timezone offset*
> *3. RSH-596 — Add retry logic*

He knows. No browser, no terminal, no context switch. He texts back:

> status RSH-601

And gets:

> *RSH-601: Update dashboard filters*
> *Status: STAGING_READY | Mode: AUTOMATED*
> *Last activity: Approved by Sarah 12m ago*

**The operations manager asking about today's orders.** Maria manages fulfillment and needs constant visibility into order flow. She doesn't have CLI access. She doesn't know SQL. Before this feature, she would message a developer: "Hey, can you check what the last few orders looked like?" and wait for someone with terminal access to run a query and screenshot the results. With WhatsApp, Maria texts @Helix directly:

> @Helix what were the last 30 orders?

Fifteen seconds later:

> *Here are the 30 most recent orders:*
> *1. SO-10492 — Acme Corp — $4,200 — Fulfilled*
> *2. SO-10491 — Globex Inc — $1,850 — Pending shipment*
> *3. SO-10490 — Initech — $12,300 — Fulfilled*
> *...*
> *Showing 30 of 30. 27 fulfilled, 2 pending shipment, 1 pending approval.*

Maria spots the pending approval and follows up in the same conversation:

> @Helix what happened with that sales order from Initech?

The AI agent remembers the context from the previous question and drills in:

> *SO-10490 (Initech) — $12,300, placed May 22, fulfilled May 23.*
> *3 line items: 200x Widget-A ($6,000), 50x Widget-B ($4,500), 25x Widget-C ($1,800).*
> *Shipped via Express. Tracking: 1Z999AA1234567890.*
> *No open issues. Payment received in full.*

Maria got the answer she needed in under a minute — no developer involved, no context switch, no waiting. She can keep asking follow-up questions ("Show me the last three sales orders that are still pending shipment", "What's the total revenue this week?") and @Helix continues the conversation, using the inspect tools to query the data and returning results in plain language.

This is the stuff that @Helix can really answer in a back-and-forth conversation — everyday business questions about orders, sales, inventory, and operations that previously required a developer with terminal access. The conversational quality is what makes it powerful: each follow-up question builds on what came before, just like asking a knowledgeable colleague.

**The developer handling a production issue from home.** It's Saturday morning. Alex gets an alert that a payment integration is returning errors. They're at home, no laptop open. From their phone, they text:

> inspect db payments-repo: SELECT status, count(*) FROM transactions WHERE created_at > now() - interval '1 hour' GROUP BY status

Thirty seconds later, the results arrive right in their WhatsApp:

> *Query results (payments-repo):*
> *status | count*
> *success | 847*
> *failed | 23*
> *pending | 156*

The failure rate is 2.6% — elevated but not catastrophic. Alex texts:

> inspect logs payments-repo: payment gateway timeout

And gets the recent error logs. They now have enough information to decide whether to escalate or wait — all from their phone, in under two minutes, without opening a laptop.

### 1.3 What Problems It Solves

Six specific problems drive this feature. Each one is a real workflow friction that exists today.

**1. Notification blindness — events go unseen for hours.**

Today, the platform's four notification types (comment, ticket completion, approval request, approval response) exist only as database records consumed by the web UI's in-app feed. The feed polls every 30 seconds and shows toast popups — but only if you have the app open in a browser tab. For the current 32 active users, this means critical events routinely go unnoticed for hours. Someone submits an approval request at 3pm; the reviewer doesn't open Helix until the next morning. An 18-hour delay, completely invisible to both parties.

*With messaging:* The approval request arrives as a WhatsApp push notification or an email in the reviewer's inbox within seconds. Awareness becomes passive and automatic — the information arrives where users already are, without requiring them to seek it out. The difference between "check when you remember" and "your phone buzzes" is the difference between hours and seconds.

**2. Approval bottleneck — one blocked approval blocks the entire pipeline.**

Approval requests are the most time-sensitive interaction in the system. When a ticket needs approval, it cannot proceed to staging. When it cannot proceed to staging, it cannot deploy. When it cannot deploy, there is no feedback loop. One unnoticed approval request creates a cascade: approval blocked, staging blocked, deployment blocked, feedback blocked. For a team shipping daily, a single 4-hour approval delay can push an entire day's work to the next day.

*With messaging:* WhatsApp delivers the approval request with interactive buttons — "Approve," "Needs Defense," "View in Helix." The reviewer taps a button. Total time: under 10 seconds. The ticket auto-enqueues to staging. The submitter is notified. The pipeline unblocks. This single interaction — tap-to-approve on a phone — is the highest-value use case for the entire feature.

**3. Context-switching tax — four steps collapse to one.**

Checking a ticket's status today requires: open a browser, navigate to Helix, find the ticket, read the status. Posting a quick comment: open browser, navigate, find ticket, open comment box, type, submit. Triggering a rerun: open browser, navigate, find ticket, click rerun. Each of these is a context switch that interrupts whatever the user was doing — often for an action that takes under 10 seconds once you get there.

*With messaging:* Read the notification, reply. Or text "status 596" and get the answer. One step instead of four. Every context switch avoided is focus preserved. For a team of 32 people each checking 5-10 notifications per day, eliminating even half the context switches compounds into hours of recovered focus per week.

**4. Mobile access gap — the phone is not a supported device.**

The CLI requires a terminal. The web UI requires a browser on a large-enough screen. Neither is how people naturally use their phone. Yet phones are the device people have with them at all times — in meetings, during commutes, on weekends, during off-hours incidents. There is no Helix mobile app, and building one would be a significant investment with ongoing maintenance.

*With messaging:* Email and WhatsApp are already on every user's phone. They are already open. They already send push notifications. There is nothing to install, nothing to configure, nothing to learn. The phone becomes a first-class Helix device through channels that are already universally adopted.

**5. Business data locked behind developer tools — everyday questions require a developer.**

Business users — operations managers, PMs, account managers — regularly need answers to straightforward questions: "What were the last 30 orders?" "Show me the last three sales orders." "What happened with that sales order from so-and-so?" Today, getting these answers requires either a developer with CLI access to run an inspect query, or logging into the ERP directly and navigating its interface. Neither is fast. Neither is conversational. A simple question that a knowledgeable colleague could answer in 10 seconds takes 15 minutes of context-switching, waiting, or manual lookup.

*With messaging:* Ask @Helix in plain English via WhatsApp or email. @Helix translates the question into an inspect query, runs it, and returns the answer in natural language. Follow up with another question — "What about the one from Initech?" — and the conversation continues with context preserved. No SQL. No CLI. No developer bottleneck. The inspect tools that power emergency triage also power everyday business queries, making the team's production data accessible to everyone who needs it, not just those who know the command line.

**6. Emergency inspect access — production queries from anywhere.**

When something breaks in production and a developer is away from their workstation, checking database state or searching logs currently requires: get to a computer, open a terminal, connect via CLI or VPN, run the query. If you're at dinner, on a hike, or simply away from your desk, the latency between "something is wrong" and "I have the data to make a decision" can be 30 minutes or more.

*With messaging:* Text an inspect command from your phone. Get results in 30 seconds. Read-only database queries, log searches, and API checks — all from WhatsApp or email, with sensitive data automatically redacted and results truncated to fit the channel. No SSH, no VPN, no laptop. This does not replace the full inspect workflow at a terminal, but it gives developers the ability to triage from anywhere.

### 1.4 Why This Matters

Helix's value compounds with the speed of the response loop. Faster approvals lead to faster staging. Faster staging leads to faster deployment. Faster deployment leads to faster feedback. Faster feedback leads to faster iteration. Every link in this chain that slows down creates a bottleneck that affects everything downstream. Email and WhatsApp tighten every link simultaneously — approvals happen in minutes instead of hours, status checks happen in seconds instead of minutes, and the entire cycle accelerates.

The existing interface model assumes users will come to Helix. Email and WhatsApp flip this assumption: Helix goes to users. This is a fundamental shift in how the platform's value gets delivered — from *pull* (you come find the information) to *push* (the information finds you) with a natural reply-to-act model that keeps the interaction loop tight. The user never needs to think "I should check Helix." Helix checks in with them.

Beyond the development pipeline, messaging unlocks an entirely new category of user: the business stakeholder. Operations managers, PMs, and account managers who would never open a terminal can now query production data conversationally through @Helix. This transforms inspect from a developer-only emergency tool into a team-wide knowledge layer — the same underlying capability serving both Saturday-morning incident triage and Tuesday-afternoon order questions.

For a team of 32 active users, the compound effect is significant. But the architecture is designed so that scaling to hundreds of users changes the cost envelope (moving from ~$80/month to ~$990/month at 500 users), not the architecture. The same message processing, the same command parser, the same thread correlation — all scale horizontally.

Each of the four core user personas gains something specific:

- **Developers** gain emergency inspect access from their phone, @Helix AI queries on the go, and instant notification when their tickets complete or receive comments. The phone becomes a triage tool during incidents and a passive awareness channel during normal work.
- **Project managers** gain visibility without a terminal. Status checks, staging queue monitoring, ticket creation, and deployment triggers — all from email or WhatsApp. No CLI knowledge required. No browser tab to keep open.
- **Admins and reviewers** gain the ability to unblock the pipeline from anywhere. Approval requests — the single highest-value use case — arrive as push notifications with one-tap response. The approval bottleneck, which today is the most common source of pipeline delay, is reduced from hours to seconds.
- **Operations and business users** gain direct access to business data through natural-language conversation with @Helix. "What were the last 30 orders?" gets an instant answer, with the ability to drill down conversationally — no developer intermediary, no SQL knowledge, no terminal required.

### 1.5 The Feature Set

Out of approximately 30 CLI operations and 39 MCP tools, **17 operations** are exposed through messaging — 10 with full support, 7 with partial support.

| Category | Full Support | Partial / Limited |
|----------|-------------|-------------------|
| **Notifications** | Receive all 4 types (comment, ticket complete, approval request, approval response) | -- |
| **Comments** | Post a comment by replying to any notification | -- |
| **Approvals** | Approve or reject by reply; WhatsApp gets tap-to-approve buttons | -- |
| **@Helix AI** | Ask questions by including "@Helix" in any message — ticket questions, business data queries, or general questions answered conversationally using inspect tools | -- |
| **Ticket status** | Check status of any ticket by reference | -- |
| **Create ticket** | Email: subject = title, body = description | WhatsApp: structured message (repo selection limited) |
| **Rerun ticket** | Rerun any ticket by reference | -- |
| **Staging queue** | View current queue status | Enqueue only (no remove/retry via messaging) |
| **Deploy** | Trigger deployment by ticket reference | -- |
| **Inspect** | List available repos | DB/logs/API queries (results truncated, sensitive data redacted) |
| **List tickets** | -- | Returns recent 5 (truncated for messaging display) |

**Why these 17 and not others.** The curation philosophy is deliberate: these are the operations that benefit most from *reach* and *mobile access*. They are time-sensitive (approvals), frequently checked (status, queue), essential during incidents (inspect), or natural fits for the messaging medium (comments, ticket creation). Operations that require rich UI interaction (browsing 50KB code artifacts, managing sprints with drag-and-drop), involve security-sensitive outputs (preview database connection strings that must never transit a messaging channel), require filesystem access (skill installation), or depend on complex stateful context (organization switching) are kept in the CLI and web UI where they belong.

**What "partial support" means in practice.** For inspect queries: results that exceed the channel's character limit are truncated to fit, with a "View full results in Helix" link appended. Sensitive patterns (connection strings, API keys, passwords) are automatically redacted before delivery. For ticket creation on WhatsApp: you can set a title and description in a single message, but repository selection is limited to a follow-up prompt rather than the full browsable list available in the web UI. For ticket listing: the 5 most recent tickets are returned with IDs, titles, and statuses — enough for a quick check, with a link to the full view. For staging queue management: you can view the queue and enqueue tickets, but remove and retry operations are kept in the web UI because they are higher-risk actions that benefit from confirmation dialogs.

### 1.6 How Users Interact — The Four Modes

Users interact with Helix through messaging in four ways, each designed to feel natural to the channel rather than forcing CLI syntax into a chat window.

**Mode 1: Reply to a notification (the primary interaction).**

This is the highest-value, most natural interaction — and the one the entire system is optimized for. A user receives a notification, replies to it, and the system handles everything: the correct ticket is resolved automatically from the email thread headers (In-Reply-To/References) or WhatsApp conversation context, and the reply becomes a comment, an approval response, or an @Helix query depending on what the user writes. No ticket ID needed. No commands to memorize. The thread provides all the context.

*What this looks like in email:* Your inbox shows a new message — "Approval needed for RSH-596: Add retry logic to payment processing." You open it and see the defense text, a summary of changes, and a link to view in Helix. You hit reply and type:

> APPROVE Looks good — solid test coverage and the backoff logic handles the edge cases well.

The ticket updates to APPROVED. The submitter receives a notification. The ticket auto-enqueues to staging.

*What this looks like in WhatsApp:* Your phone buzzes with a message from Helix. You see the approval request with three buttons at the bottom: "Approve," "Needs Defense," "View in Helix." You tap "Approve." A confirmation message appears: "RSH-596 approved. Ticket queued for staging." Done.

**Mode 2: Keyword commands (for initiating new actions).**

When you want to do something that is not tied to an existing notification thread, you send a structured command. The system recognizes keywords, parses ticket references flexibly (exact ID, short ID like "RSH-596," or just the number "596"), and responds in the same channel.

Examples of keyword commands and what comes back:

- **"status RSH-596"** returns the ticket's current status, mode, last activity, and a link to the web UI.
- **"staging queue"** returns the list of tickets currently in the staging queue with positions, IDs, and titles.
- **"deploy 596"** triggers deployment for the ticket (if it is staging-ready) and confirms the action.
- **"rerun 596"** triggers a re-execution of the ticket and confirms.
- **"list tickets"** returns the 5 most recent tickets with IDs, titles, and statuses.
- **"inspect repos"** returns the list of repositories available for inspection.
- **"inspect db my-repo: SELECT count(*) FROM users WHERE active = true"** executes a read-only database query and returns formatted results.

**Mode 3: @Helix routing (for natural language questions and conversational data queries).**

Any message containing "@Helix" is routed through the existing AI agent pipeline — the same host-agent-service and helix-reply-service that power @Helix mentions in the web UI's comment threads. Users ask questions in natural language and get AI-generated responses. The AI agent has access to inspect tools and can query databases, search logs, and check APIs to answer questions — making @Helix a gateway to both ticket information and business data.

*Ticket questions:* You reply to a ticket notification and write:

> @Helix what's blocking this ticket? Is there a failing test or a missing approval?

The AI agent processes the query with full ticket context and responds in the same channel:

> RSH-596 is currently waiting for approval. The last run completed successfully — all tests passed. Sarah has been notified as a reviewer but hasn't responded yet. No blocking issues other than the pending approval.

*Conversational business data queries:* You send @Helix a plain-English question about your business data — no ticket context needed:

> @Helix show me the last three sales orders

The agent translates this to an inspect query, runs it, and returns results in plain language:

> *Here are the 3 most recent sales orders:*
> *1. SO-10492 — Acme Corp — $4,200 — Fulfilled (May 23)*
> *2. SO-10491 — Globex Inc — $1,850 — Pending shipment (May 22)*
> *3. SO-10490 — Initech — $12,300 — Fulfilled (May 23)*

You follow up in the same conversation:

> @Helix what happened with that sales order from Globex?

The agent remembers the conversational context and drills in:

> *SO-10491 (Globex Inc) — $1,850, placed May 22. 2 line items: 100x Widget-A ($1,200), 25x Widget-B ($650). Status: pending shipment — warehouse confirmed pick-and-pack complete, awaiting carrier pickup. Expected ship date: today.*

This multi-turn conversational quality is what distinguishes @Helix via messaging from the structured keyword commands in Mode 2. The agent maintains session context across follow-ups, so each question builds on the last — just like asking a knowledgeable colleague. WhatsApp's conversational threading makes this especially natural: the user and @Helix are having a real back-and-forth conversation, not exchanging one-shot commands.

This works in both email (as a reply thread) and WhatsApp (as a message in the conversation). The key is that it reuses the exact same AI pipeline already built for the web UI, just with a different delivery channel for the response.

**Mode 4: Help fallback (when nothing matches).**

If you send a message that the system does not recognize — a typo, a question without @Helix, an unsupported command — you get a helpful response listing the available commands with examples. The system never responds with silence.

*In WhatsApp:*

> I didn't understand that. Try:
>
> *Commands:*
> - APPROVE / REJECT (reply to approval)
> - status 596
> - list tickets
> - staging queue
> - deploy 596
> - inspect repos
> - @Helix [question]
>
> Reply to any notification to comment on that ticket.

*In email:* A similar response with a subject line "Helix: Command Not Recognized" and a more detailed list of examples including email-specific patterns like ticket creation via subject line.

### 1.7 Channel-Specific Affordances

Email and WhatsApp are not interchangeable — each has distinct strengths that shape the user experience. Users can enable both, one, or neither per notification type, choosing the channel that fits their workflow.

**Email affordances:**

- **Threading.** Every notification related to a ticket stays grouped in one email thread via standard In-Reply-To/References headers. In Gmail, a user sees "RSH-596: Add retry logic" with a count showing 4 messages: the original completion notification, their comment reply, a colleague's reply, and @Helix's response — all in a single conversation view. This makes email the superior channel for following an ongoing discussion.

- **Ticket creation via email.** Send an email to the Helix inbound address. The subject line becomes the ticket title. The body becomes the description. Include a `repos: repo-name-1, repo-name-2` line in the body to specify repositories. This is the most natural, zero-learning-curve pattern for creating structured content via messaging — it maps directly to how people already use email.

- **Rich formatting and generous limits.** HTML emails with plain-text fallback render well across Outlook, Gmail, and Apple Mail. Inspect query results, ticket summaries, and longer @Helix responses can be delivered in full — no truncation needed up to ~50KB per message. Code snippets render in monospace. Links are clickable. This makes email the better channel for data-heavy @Helix responses — full query results, detailed order breakdowns, and longer conversational answers can be delivered without truncation.

- **Offline persistence.** Emails stay in your inbox indefinitely. You can review a notification three days later and still reply to act on it. There is no conversation window, no expiration, no need to re-engage.

**WhatsApp affordances:**

- **Interactive buttons for approvals.** Up to 3 buttons per message turn approval from a typing task into a tap. The approval message arrives with "Approve," "Needs Defense," and "View in Helix" buttons at the bottom. The user taps one. Confirmation appears. This is the signature WhatsApp affordance — it makes the highest-value use case (approval) as frictionless as possible.

- **Instant push delivery.** WhatsApp messages arrive with native phone push notifications — sound, vibration, lock-screen preview. For time-sensitive approvals, this is faster and more attention-getting than email, which may sit unread in a crowded inbox.

- **Conversational threading for iterative data queries.** WhatsApp's chat interface is inherently conversational — messages flow naturally back and forth in a single thread. This makes it the ideal channel for multi-turn @Helix data queries: "What were the last 30 orders?" followed by "What about the one from Initech?" followed by "Show me their order history this quarter." Each question and answer appears sequentially in the same chat, maintaining visual context. The user is having a conversation with @Helix, and WhatsApp's UX makes that conversation feel native — no thread management, no subject lines, just ask and get answers.

- **24-hour conversation window.** This is a WhatsApp Business API constraint that shapes the interaction timing. Within 24 hours of the last template message Helix sent, users can reply freely with any text — comments, commands, @Helix questions. Outside the 24-hour window, free-form replies are not allowed by WhatsApp's policy, so Helix re-engages by sending a fresh template message with interactive buttons. What this means in practice: if Sarah sees an approval request 36 hours after it was sent, she cannot simply reply "APPROVE" — but the message still has the "Approve" button, which works regardless of the window. The button interaction is always available; only free-form text replies are time-limited.

- **Character limit and truncation.** WhatsApp messages are capped at 4,096 characters. Inspect query results, ticket lists, and @Helix responses that exceed this limit are automatically truncated with a "View full results in Helix" link. This is a trade-off: WhatsApp trades content depth for instant delivery and mobile-native interaction. For large data query results, @Helix may summarize rather than list all records, with an offer to drill into specifics.

**The tradeoff between channels.** Email is better for content-heavy notifications, ongoing discussions, offline review, ticket creation, and detailed @Helix data query results that benefit from rich formatting and generous character limits. WhatsApp is better for time-sensitive actions (approvals), quick status checks, conversational back-and-forth data queries, and situations where instant push delivery matters. The two channels are complementary — users who enable both get threaded history in email and instant push alerts on WhatsApp. Users who prefer one channel get a complete experience on that single channel.

---

## 2. Technical Summary

This report designs the architecture, schema, security model, and vendor integration required to implement the Email and WhatsApp interfaces described in Section 1. The design covers four areas:

- **Outbound notification delivery** via SendGrid (email) and Twilio (WhatsApp), extending the existing `notification-service.ts` with a channel-routing dispatcher and background delivery worker
- **Inbound command processing** via webhook endpoints that parse incoming messages into structured commands -- reply correlation, keyword commands, @Helix AI routing, and help fallback
- **Schema extensions** -- five Prisma additions (User.phone, NotificationPreference, NotificationDelivery, MessageThread, two new enums) to support delivery tracking, user preferences, and thread correlation
- **Security model** -- vendor webhook signature verification, sender-to-user identity mapping, per-operation authorization, and data sensitivity guards for inspect queries

The platform currently serves 32 active users with four notification types (COMMENT, TICKET_COMPLETED, APPROVAL_REQUESTED, APPROVAL_RESPONDED) delivered exclusively in-app via 30-second polling and SSE streaming. There is zero existing external messaging infrastructure -- no vendor SDKs, no webhook routes, no phone number storage, no user channel preferences.

**Recommended vendors:** SendGrid for email (combined outbound sending and Inbound Parse Webhook) and Twilio for WhatsApp (established Business Solution Provider with template management and mature Node.js SDK). Estimated cost at current scale: ~$80/month.

---

## 3. Current State Analysis

### 3.1 Notification Architecture

The server's notification system is implemented in `helix-global-server/src/services/notification-service.ts` (294 lines). It creates database `Notification` records that are consumed exclusively by the web client.

**Four notification creation functions:**

| Function | Type | Recipient Logic | Line |
|----------|------|----------------|------|
| `createNotificationsForComment` | `COMMENT` | Ticket reporter + director + mentioned users + parent comment author (excluding comment author) | Lines 8-51 |
| `createNotificationsForDeployment` | `TICKET_COMPLETED` | Reporter + director of each deployed ticket | Lines 53-89 |
| `createNotificationsForApprovalRequest` | `APPROVAL_REQUESTED` | All active developers in the organization (excluding submitter) | Lines 95-123 |
| `createNotificationsForApprovalResponse` | `APPROVAL_RESPONDED` | Original approval submitter | Lines 125-141 |

All four functions use `prisma.notification.createMany()` or `prisma.notification.create()` to write records directly to the database. There is no post-creation hook for external delivery -- each function terminates after the database write.

**Client consumption pattern** (`helix-global-client/src/components/notification-sidebar.tsx`):
- **Polling**: React Query `refetchInterval: 30_000` (30 seconds) against `GET /activity`
- **Pagination**: Cursor-based infinite scroll, 20 items per page, 72-hour viewed-item expiry
- **Toast popups**: Via `sonner` library, 5-second auto-dismiss, spring animations (`notification-toast.tsx`)
- **Auto-mark-viewed**: 1500ms delay after sidebar expansion, tracked by `useRef(Set)` to prevent re-marking
- **Unread badge**: Count of items where `firstViewedAt === null`, capped at "99+"

**Notification model** (`prisma/schema.prisma`, lines 877-896):
```prisma
model Notification {
  id                String           @id @default(cuid())
  userId            String
  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId    String
  organization      Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  type              NotificationType
  ticketId          String
  ticket            Ticket           @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  commentId         String?
  comment           TicketComment?   @relation(fields: [commentId], references: [id], onDelete: Cascade)
  approvalRequestId String?
  approvalRequest   ApprovalRequest? @relation(fields: [approvalRequestId], references: [id], onDelete: Cascade)
  firstViewedAt     DateTime?
  dismissedAt       DateTime?
  createdAt         DateTime         @default(now())

  @@index([userId, organizationId, dismissedAt, firstViewedAt])
  @@index([ticketId])
}
```

The model tracks only in-app lifecycle (viewed, dismissed) with no fields for delivery channel, delivery status, or external message identifiers.

### 3.2 Comment Pipeline and @Helix Routing

Comment creation follows a fire-and-forget pattern in `helix-global-server/src/controllers/comment-controller.ts`. After the HTTP response is sent at line 102, post-create hooks execute asynchronously (lines 121-171):

```
// --- Post-create hooks (fire-and-forget, after response is sent) ---
```

**@Helix dispatch decision tree:**

1. **Guard**: Only fires if `comment.isHelixTagged && !isAgentAuthored` (line 124)
2. **Active host agent session**: Calls `handleHostAgentComment()` which resumes the existing Claude Agent SDK session via `session.claudeSessionId`. On failure, falls back to `generateHelixReply()` (lines 131-145)
3. **Provisioning session**: Posts static message "Still warming up -- I'll address this once my context is ready" (line 147-151)
4. **No session / ERROR / TERMINATED**: Falls back to `generateHelixReply()` via helix-reply-service (lines 153-165)
5. **Non-Helix comments**: Only emits SSE via `emitCommentEvent()` (line 167-169)

**Helix detection** (lines 75-84): The client sends an `isHelixTagged` boolean. The server applies a fallback regex `/\bhelix\b/i.test(content)` if the flag is not set and the comment is not agent-authored. This same detection pattern would apply to inbound email/WhatsApp messages.

**Host agent architecture** (`host-agent-service.ts`): Persistent AI sessions per ticket using Claude Agent SDK with Sprites VMs. Sessions go through `PROVISIONING` -> `ACTIVE` (or `ERROR`) -> `TERMINATED` lifecycle. The agent has MCP tools (`read_file`, `search_code`, `list_files`, `exec_command`, `run_helix_cli`) scoped to `/app/` with path validation and binary allowlisting.

This existing pipeline is the key integration point for @Helix queries via messaging -- inbound messages containing @Helix would route through the same `handleHostAgentComment()` / `generateHelixReply()` dispatch.

### 3.3 CLI Interface Surface

The CLI (`hlx`) provides 10 top-level commands with 27 distinct subcommand forms:

**Ticket Lifecycle** (10 subcommands in `helix-cli/src/tickets/index.ts`):

| Command | Arguments | Key Options | Description |
|---------|-----------|-------------|-------------|
| `tickets list` | -- | `--search`, `--user`, `--status`, `--status-not-in`, `--archived`, `--sprint`, `--json` | List tickets with filters |
| `tickets latest` | -- | `--status-not-in`, `--archived`, `--sprint` | Show most recent ticket |
| `tickets get` | `<ticket-ref>` | `--json` | Get single ticket details |
| `tickets create` | -- | `--title` (req), `--description` (req), `--repos` (req), `--mode`, `--after`, `--reference`, `--implement-from` | Create new ticket |
| `tickets update-description` | `<ticket-ref>` | `--file` or `--text` (req) | Update description |
| `tickets rerun` | `<ticket-ref>` | -- | Rerun a ticket |
| `tickets continue` | `<ticket-ref>` `"context"` | `--dry-run` | Continue with context |
| `tickets artifacts` | `<ticket-ref>` | `--run` | List step artifacts |
| `tickets artifact` | `<ticket-ref>` | `--step` (req), `--repo` (req), `--run` | Get specific artifact |
| `tickets bundle` | `<ticket-ref>` | `--out` (req), `--run` | Export for Codex |

**Communication** (2 subcommands in `helix-cli/src/comments/index.ts`):

| Command | Arguments | Key Options | Description |
|---------|-----------|-------------|-------------|
| `comments list` | -- | `--ticket`, `--helix-only`, `--since` | List ticket comments |
| `comments post` | `<message>` | `--ticket` | Post comment on ticket |

**Production Inspection** (4 subcommands in `helix-cli/src/inspect/index.ts`):

| Command | Arguments | Key Options | Description |
|---------|-----------|-------------|-------------|
| `inspect repos` | -- | -- | List repositories and inspection types |
| `inspect db` | `"<sql>"` | `--repo` (req), `--query`, `--query-file` | Execute SQL query |
| `inspect logs` | `"<query>"` | `--repo` (req), `--limit` | Query application logs |
| `inspect api` | `<path>` | `--repo` (req) | Hit API endpoint |

**Library** (4 subcommands in `helix-cli/src/library/index.ts`):

| Command | Arguments | Key Options | Description |
|---------|-----------|-------------|-------------|
| `library list` | -- | -- | List library items |
| `library show` | `<ref>` | -- | Show report with annotations |
| `library comments list` | `<ref>` | `--section` | List section-grouped comments |
| `library comments post` | `<ref>` `[message]` | `--section` (req), `--rating` (req) | Post section rating/reply |

**Administration** (5 commands):

| Command | Arguments | Key Options | Description |
|---------|-----------|-------------|-------------|
| `login` | `<server-url>` | `--manual` | Browser OAuth or manual key entry |
| `token add` | -- | `--token` (req), `--url`, `--name`, `--current` | Add API token |
| `org current` | -- | -- | Show current org |
| `org list` | -- | -- | List configured orgs |
| `org switch` | `<org-name-or-id>` | -- | Switch active org |

**Maintenance** (3 commands):

| Command | Arguments | Key Options | Description |
|---------|-----------|-------------|-------------|
| `preview db-url` | `<ticket-ref>` | -- | Print Neon preview branch URI |
| `skill show` | -- | -- | Print bundled skill content |
| `skill install` | -- | `--target`, `--for`, `--force` | Install skill to agent |
| `update` | -- | `--enable-auto`, `--disable-auto` | Self-update from GitHub |

**Communication pattern**: Pure request-response HTTP via `hxFetch()` with 3-attempt retry, exponential backoff (2-second base), 30-second timeout. No streaming or push capability.

**Ticket reference resolution** (`resolve-ticket.ts`): Flexible matching by exact internal ID, short ID (case-insensitive, e.g., `RSH-596`), or numeric suffix (e.g., `596`). This pattern is important for natural-language message parsing -- users could reference tickets by number in their messages.

### 3.4 MCP Tool Surface

The MCP interface exposes 39 tools across 13 categories, registered through `helix-global-server/src/mcp/register-tools.ts`. This is the most complete interface surface in the system.

| Category | File | Tools | Tool Names |
|----------|------|-------|------------|
| Tickets | `tickets.ts` | 10 | `create-ticket`, `list-tickets`, `get-ticket`, `update-ticket`, `archive-ticket`, `delete-ticket`, `run-ticket`, `rerun-ticket`, `get-run-details`, `analyze-merge` |
| Comments | `comments.ts` | 3 | `post-comment`, `get-comments`, `manage-comment` |
| Attachments | `attachments.ts` | 3 | `list-attachments`, `upload-attachment`, `delete-attachment` |
| Sprints | `sprints.ts` | 3 | `list-sprints`, `manage-sprint`, `assign-sprint-tickets` |
| Staging Queue | `staging-queue.ts` | 2 | `get-staging-queue`, `manage-staging-queue` |
| Deployments | `deployments.ts` | 3 | `list-deployments`, `manage-deployment`, `manage-ns-deployment` |
| Settings | `settings.ts` | 3 | `manage-repositories`, `manage-settings`, `manage-credentials` |
| Profile | `profile.ts` | 4 | `get-profile`, `update-profile`, `manage-notifications`, `get-activity` |
| Analytics | `analytics.ts` | 1 | `get-analytics` |
| Organization | `organization.ts` | 1 | `get-organization-members` |
| Transcripts | `transcripts.ts` | 1 | `manage-transcript-tickets` |
| Inspection | `inspection.ts` | 2 | `run-inspection`, `manage-inspection-keys` |
| Library Comments | `library-comments.ts` | 3 | `post-library-comment`, `get-library-comments`, `manage-library-comment` |

**Design patterns**: Many modules use a "manage-*" pattern that multiplexes create/update/delete actions behind a single tool with an `action` enum parameter. All tools receive auth context via a `getAuthContext()` closure. Each tool declares MCP annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) for client-side safety hinting.

### 3.5 Infrastructure Gaps

Five infrastructure gaps must be addressed to support Email and WhatsApp interfaces:

| # | Gap | Evidence | Impact |
|---|-----|----------|--------|
| 1 | **No outbound messaging** | `notification-service.ts` creates DB records only; no email/WhatsApp delivery code. Zero vendor SDKs in `package.json`. | Cannot notify users outside the web UI |
| 2 | **No inbound message handling** | `api.ts` (483 lines) contains no `POST /api/webhooks/*` routes. No webhook signature verification middleware. | Cannot receive messages from external providers |
| 3 | **No vendor SDK integration** | `package.json` has no SendGrid, SES, nodemailer, or Twilio dependencies. `env.ts` AppConfig (40 fields) has no messaging provider API keys. | No runtime capability to send or receive via vendors |
| 4 | **No phone number storage** | User model (`schema.prisma`, lines 292-319) has `email` but no `phone` or `whatsappNumber` field. Runtime DB inspection confirmed: columns are id, organizationId, email, name, passwordHash, createdAt, updatedAt, isDeveloper, isAdmin, isActive, avatarUrl, isPowerUser. | Cannot map WhatsApp messages to users |
| 5 | **No notification preferences** | No `NotificationPreference` model in schema. No preferences UI in client. No per-channel, per-type opt-in/opt-out capability. | Cannot let users choose notification channels |

**Production validation**: Log search across the last 24 hours for "email", "whatsapp", "twilio", and "sendgrid" returned zero matches from application logic -- only this research ticket's own workflow logs appeared. This confirms there is no existing messaging integration of any kind.

---

## 4. Architecture Design

### 4.1 Outbound Notification Pipeline

The outbound pipeline extends the existing notification creation flow without modifying the in-app notification path.

**Current flow** (unchanged):
```
Server event -> notification-service.ts -> prisma.notification.createMany() -> DB record
                                                                                  |
                                                                    Web client polls GET /activity
```

**Extended flow** (new additions in bold):
```
Server event -> notification-service.ts -> prisma.notification.createMany() -> DB record
                                              |
                                    **dispatchExternalDeliveries()**
                                              |
                                    **channel-router.ts**
                                     /                  \
                          Check NotificationPreference    Check NotificationPreference
                          for EMAIL                       for WHATSAPP
                          /                                    \
                  **email-delivery-service.ts**          **whatsapp-delivery-service.ts**
                  Create NotificationDelivery             Create NotificationDelivery
                  (status: PENDING)                       (status: PENDING)
                  Call SendGrid API                       Call Twilio API
                  Update status: SENT/FAILED              Update status: SENT/FAILED
                                              \         /
                                     **delivery-worker.ts**
                                  (background retry, 30s interval)
                                  Polls PENDING/FAILED deliveries
                                  Max 3 retry attempts
```

**Design rationale**: This follows the established fire-and-forget pattern used throughout the codebase. The `comment-controller.ts` (lines 121-171) already dispatches @Helix processing after sending the HTTP response. The notification service would add a similar post-creation dispatch without blocking the primary notification creation path.

**Background delivery worker**: Follows the `server.ts` pattern for background processes (lines 39-56), which starts `startQueueProcessor()`, `startDeploymentRecovery()`, `startTicketDeployingRecovery()`, and `startOAuthCleanup()` when `enableBackgroundProcesses` is true. The delivery worker would use the same interval-based polling pattern with graceful shutdown registration.

**New service files required:**

| Service | Responsibility | Pattern Reference |
|---------|---------------|-------------------|
| `channel-router.ts` | Check recipient preferences, dispatch to appropriate delivery service | Extension of `notification-service.ts` |
| `email-delivery-service.ts` | Format notification as email, send via SendGrid, create/update `NotificationDelivery` | New service, uses `@sendgrid/mail` |
| `whatsapp-delivery-service.ts` | Format notification as WhatsApp template, send via Twilio, create/update `NotificationDelivery` | New service, uses `twilio` SDK |
| `delivery-worker.ts` | Background retry worker polling PENDING/FAILED deliveries on 30s interval | Follows `startQueueProcessor` pattern in `server.ts` |
| `message-formatter.ts` | Format ticket data, comments, approvals into channel-appropriate messages | New utility shared by both delivery services |

### 4.2 Inbound Message Pipeline

The inbound pipeline introduces webhook routes that receive messages from SendGrid and Twilio, parse them into structured commands, and route to existing server operations.

```
                    SendGrid Inbound Parse              Twilio WhatsApp Webhook
                    POST /api/webhooks/                 POST /api/webhooks/
                    sendgrid/inbound                    twilio/whatsapp
                            \                               /
                         **webhook-auth.ts**
                    Verify vendor signature + resolve sender identity
                                    |
                            **inbound-parser.ts**
                     Three parsing modes (priority order):
                     1. Reply correlation (thread lookup)
                     2. Keyword commands (regex matching)
                     3. @Helix routing (AI agent dispatch)
                     4. Help fallback (unrecognized)
                                    |
                         Existing server operations
                    (comment-controller, approval-controller,
                     ticket-service, staging-queue-service,
                     host-agent-service, inspect endpoints)
                                    |
                         Response sent back via same channel
```

**Webhook route placement**: Routes are registered BEFORE the `requireAuth` middleware gate at `api.ts` line 313. This follows the established precedent of inspection routes at lines 222-225, which use `attachInspectionAuth + requireInspectionAuth` instead of session auth. Webhook routes would use vendor-specific signature verification middleware instead.

**New webhook routes:**
- `POST /api/webhooks/sendgrid/inbound` -- SendGrid Inbound Parse (multipart/form-data with parsed email fields)
- `POST /api/webhooks/twilio/whatsapp` -- Twilio WhatsApp webhook (application/x-www-form-urlencoded with message fields)

### 4.3 Thread Correlation

Thread correlation maps external message threads back to Helix tickets, enabling natural conversational flows.

**Email threading**: Standard email headers provide automatic thread correlation:
- **Outbound**: Set `Message-ID`, `References`, and `In-Reply-To` headers on every notification email. Store the mapping in a `MessageThread` record: `{ externalThreadId: messageId, channel: EMAIL, ticketId }`.
- **Inbound**: Read `In-Reply-To` and `References` headers from incoming emails. Look up the `MessageThread` record to resolve the ticket. The reply body becomes a comment on that ticket.
- **Email client UX**: Users see notification emails grouped in natural threads. Replying to a notification email automatically posts a comment on the correct ticket.

**WhatsApp threading**: WhatsApp conversations have a 24-hour session window:
- **Outbound**: Each template message creates a conversation context. Store the Twilio message SID in a `MessageThread` record.
- **Inbound**: When a user replies within 24 hours, the Twilio webhook includes conversation context. Match the `From` number + conversation window to resolve the ticket.
- **Beyond 24 hours**: If the session window has expired, the user must include a ticket reference (short ID or number) in their message for context resolution.

**Correlation priority**:
1. Thread header/context match (automatic, highest priority)
2. Explicit ticket reference in message body (e.g., "RSH-596" or "#596")
3. Most recent active ticket for the user (fallback for simple replies like "APPROVE")

### 4.4 @Helix Integration via Messaging

Inbound messages containing "@Helix" or starting with "Helix," route through the existing AI agent pipeline, providing the same capability as @Helix mentions in the web UI comment system.

**Integration path:**
1. Inbound parser detects @Helix pattern in the message
2. Create a `TicketComment` record with `isHelixTagged: true` and the sender as author
3. The existing `comment-controller.ts` post-create hooks (lines 121-171) fire automatically
4. The @Helix dispatch decision tree routes to the host agent session or helix-reply fallback
5. When the AI agent posts its reply comment, the notification service creates a `COMMENT` notification
6. The outbound pipeline delivers the reply back via the same channel the user used

This approach requires zero changes to the AI agent pipeline itself -- the integration point is at the comment creation level, reusing the existing `isHelixTagged` detection and dispatch pattern.

Beyond ticket-context questions, the host agent session has access to inspect tools (database queries, log searches, API checks) through CLI command execution (`run_helix_cli`), enabling @Helix to answer business data queries when users ask in plain-English via messaging. The agent maintains session context (`claudeSessionId`) across follow-up questions, supporting multi-turn conversational drill-down. Note that the fallback reply service (`helix-reply-service`) has only 3 tools and no inspect access — conversational data queries require an active host agent session.

---

## 5. Schema Design

All schema changes target `helix-global-server/prisma/schema.prisma`. The current schema uses Prisma v6.19.2 with PostgreSQL and has 60+ existing migration files.

### 5.1 User Model Extension

Add phone number and verification fields to the existing User model (currently at lines 292-319):

```prisma
model User {
  // ... existing fields (id, organizationId, email, name, avatarUrl,
  //     passwordHash, isDeveloper, isPowerUser, isAdmin, isActive) ...

  phone                    String?    // WhatsApp number in E.164 format (e.g., +1234567890)
  phoneVerified            Boolean    @default(false)

  // ... existing relations ...
  notificationPreferences  NotificationPreference[]
}
```

**Rationale**: The User model currently has `email` (confirmed via runtime DB inspection) but no phone field. E.164 format is required by the Twilio WhatsApp API. The `phoneVerified` flag prevents unverified numbers from receiving messages -- verification uses a one-time code sent via WhatsApp.

### 5.2 NotificationPreference Model

Per-user, per-channel, per-notification-type opt-in preferences:

```prisma
model NotificationPreference {
  id               String            @id @default(cuid())
  userId           String
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId   String
  organization     Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  channel          DeliveryChannel
  notificationType NotificationType
  enabled          Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@unique([userId, organizationId, channel, notificationType])
  @@index([userId, organizationId])
}
```

**Rationale**: Users may want WhatsApp for urgent approval requests but email for informational comment notifications. The unique constraint on `(userId, organizationId, channel, notificationType)` ensures exactly one preference record per combination. Organization scoping supports multi-org users with different preferences per org.

### 5.3 NotificationDelivery Model

Per-notification, per-channel delivery tracking with retry support:

```prisma
model NotificationDelivery {
  id                String          @id @default(cuid())
  notificationId    String
  notification      Notification    @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  channel           DeliveryChannel
  status            DeliveryStatus
  externalMessageId String?         // SendGrid message ID or Twilio message SID
  error             String?         // Last error message for failed deliveries
  attempts          Int             @default(0)
  sentAt            DateTime?
  deliveredAt       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([status, createdAt])       // For retry worker queries: WHERE status IN ('PENDING','FAILED') ORDER BY createdAt
  @@index([notificationId])          // For looking up deliveries by notification
  @@index([externalMessageId])       // For webhook status callbacks from vendors
}
```

**Rationale**: Decoupling delivery tracking from the existing `Notification` model avoids schema bloat on the hot-path feed query (`getNotificationFeed`, lines 147-244 of notification-service.ts). The `status + createdAt` compound index supports the delivery worker's retry query. The `externalMessageId` field enables status webhook callbacks from SendGrid (delivery/bounce events) and Twilio (delivered/read status).

### 5.4 MessageThread Model

Maps external message threads to Helix tickets for reply correlation:

```prisma
model MessageThread {
  id               String          @id @default(cuid())
  externalThreadId String          // Email Message-ID header or WhatsApp conversation ID
  channel          DeliveryChannel
  ticketId         String
  ticket           Ticket          @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  userId           String
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt        DateTime        @default(now())

  @@unique([externalThreadId, channel])  // One thread per external ID per channel
  @@index([ticketId])                    // For finding threads by ticket
  @@index([userId, channel])             // For finding user's threads on a channel
}
```

**Rationale**: Thread correlation is essential for natural conversational flows. When a user replies to a notification email, the `In-Reply-To` header resolves to the original `externalThreadId`, which maps to the correct ticket. The unique constraint prevents duplicate thread records for the same external conversation.

### 5.5 New Enums

```prisma
enum DeliveryChannel {
  EMAIL
  WHATSAPP
}

enum DeliveryStatus {
  PENDING     // Queued for delivery
  SENT        // Vendor API accepted the message
  DELIVERED   // Vendor confirmed delivery to recipient
  FAILED      // Delivery failed after all retry attempts
}
```

**Rationale**: `DeliveryChannel` is used across NotificationPreference, NotificationDelivery, and MessageThread to consistently identify the communication channel. `DeliveryStatus` tracks the delivery lifecycle, with the `PENDING -> SENT -> DELIVERED` happy path and `FAILED` terminal state for exhausted retries.

### Schema Relationship Diagram

```
User (extended)
  |-- phone, phoneVerified (new fields)
  |-- NotificationPreference[] (new relation)
  |-- MessageThread[] (new relation)
  |
  +-- Notification (existing)
        |-- NotificationDelivery[] (new relation)
        |
        +-- MessageThread (via ticket)
```

---

## 6. Security Model

### 6.1 Inbound Authentication

Each channel uses vendor-specific webhook signature verification, replacing session-based auth for inbound routes.

| Channel | Verification Method | Library | Signature Location |
|---------|--------------------|---------|--------------------|
| **Email** (SendGrid) | SendGrid Inbound Parse uses basic auth or OAuth for webhook verification. The webhook URL includes a secret path segment or uses the signed event webhook verification. | `@sendgrid/helpers` | Basic auth credentials in webhook URL or `X-Twilio-Email-Event-Webhook-Signature` header |
| **WhatsApp** (Twilio) | HMAC-SHA1 signature validation. Compute expected signature from request URL + sorted POST parameters using the Twilio Auth Token as the HMAC key. Compare against the `X-Twilio-Signature` header. | `twilio` SDK (`validateRequest()`) | `X-Twilio-Signature` header |

**Middleware placement**: Webhook auth middleware is registered on the specific webhook routes, similar to how `attachInspectionAuth` + `requireInspectionAuth` are used for inspection routes (`api.ts` lines 222-225). The middleware:
1. Validates the vendor signature (rejects with 403 if invalid)
2. Extracts the sender identity (email address or phone number)
3. Resolves the sender to a Helix `User` record
4. Attaches the resolved user to the request context

### 6.2 Identity Resolution

Inbound messages must be mapped to Helix user accounts before any operation executes.

| Channel | Sender Field | Resolution | Match Field |
|---------|-------------|------------|-------------|
| Email | `from` address (parsed from SendGrid POST body) | Exact match | `User.email` |
| WhatsApp | `From` number (E.164 format from Twilio POST body) | Exact match | `User.phone` |

**Unregistered senders**: If the sender email/phone does not match any active user, the webhook responds with a rejection message:
- Email: Auto-reply explaining the sender is not registered
- WhatsApp: Reply message with registration instructions

**Multi-org resolution**: If a user belongs to multiple organizations, the system defaults to the user's primary organization (the `organizationId` field on the User model). Future enhancement could allow explicit org context in messages.

### 6.3 Authorization Rules

Each inbound operation maps to the existing permission model. Authorization checks mirror what the server already enforces for web UI and API requests.

| Operation | Required Permission | Existing Reference |
|-----------|-------------------|--------------------|
| View ticket status | Active user | `requireAuth` gate at `api.ts` line 313 |
| Create ticket | Active user + org membership | Ticket creation requires `organizationId` |
| Post comment | Active user | Comment routes at `api.ts` lines 228-232 |
| @Helix query | Active user | Same as post comment (triggers host-agent dispatch) |
| Approve ticket | Active developer | Approval response at `approval-controller.ts` line 53 |
| Reject ticket (needs defense) | Active developer | Same as approve |
| Queue for staging | Active developer | Staging queue management is developer-gated |
| Trigger deployment | Active developer | Deployment routes are behind `requireAuth` |
| Inspect: repos | Active developer or admin | Inspection uses `attachInspectionAuth` at `api.ts` lines 222-225 |
| Inspect: db query | Active developer or admin | Same inspection auth |
| Inspect: logs | Active developer or admin | Same inspection auth |
| Inspect: api | Active developer or admin | Same inspection auth |

### 6.4 Data Sensitivity Guards

Messaging channels transmit data over third-party infrastructure, requiring additional data protection measures beyond what the in-app UI needs.

**Never include in outbound messages:**
- Database connection strings (matched by `(postgres|mysql|mongodb):\/\/` regex)
- API keys (matched by `sk-*`, `hxi_*`, `SG.*`, `AC*` patterns)
- Encryption keys, password hashes, OAuth tokens
- Environment variable dumps

**Inspect query result protections:**
- **Row limit**: Truncate query results to 50 rows maximum in messaging responses (full results available via web UI link)
- **Pattern redaction**: Scan result text and redact matches for connection strings, API key formats, and credential patterns
- **Length limit**: Truncate total response to 4000 characters for WhatsApp (API limit is 4096) and 50KB for email
- **Warning prefix**: Add "Results may be truncated. View full results at [web UI link]" when truncation occurs

**Preview database URLs**: Explicitly excluded from messaging interfaces. The `preview db-url` command outputs raw Neon connection strings, which must never transit external messaging infrastructure.

### 6.5 Excluded Operations

Operations excluded from messaging interfaces for security or applicability reasons:

| Operation | Reason for Exclusion |
|-----------|---------------------|
| `preview db-url` | Outputs raw database connection strings -- security-sensitive |
| `skill show` / `skill install` | Requires filesystem access; CLI/agent-only |
| `update` | CLI self-update; not applicable to messaging |
| `login` / `token add` | Authentication flows requiring browser or secure terminal |
| `org switch` | Complex stateful operation changing context for subsequent commands |
| `tickets bundle` | Exports to local filesystem; not applicable to messaging |
| `tickets artifacts` / `tickets artifact` | Large text artifacts not suited to messaging format |
| `library list` / `library show` | Long-form content not suited to messaging; low-frequency use case |
| `library comments post` | Requires `--section` and `--rating` parameters; complex form-based input |
| `delete-ticket` | Destructive operation; safer to require web UI confirmation |
| `archive-ticket` | Bulk operation; better suited to web UI |
| `manage-comment` (edit/delete) | Ambiguous UX in messaging context; 5-minute edit window not applicable |
| `upload-attachment` | Requires base64-encoded file content; not suited to messaging |
| `manage-settings` | Admin configuration; complex nested forms |
| `manage-credentials` | Security-sensitive credential management |
| `manage-inspection-keys` | API key lifecycle; admin/security operation |

---

## 7. Inbound Message Processing

### 7.1 Webhook Route Design

Two webhook endpoints handle all inbound messages, registered before the `requireAuth` gate:

**Email webhook** -- `POST /api/webhooks/sendgrid/inbound`:
- **Content-Type**: `multipart/form-data` (SendGrid Inbound Parse)
- **Key fields**: `from` (sender email), `to` (inbound address), `subject`, `text` (stripped plain text body), `headers` (email headers including In-Reply-To, References), `envelope` (JSON with sender/recipients)
- **Auth**: SendGrid webhook verification (basic auth secret in URL or signed event verification)

**WhatsApp webhook** -- `POST /api/webhooks/twilio/whatsapp`:
- **Content-Type**: `application/x-www-form-urlencoded`
- **Key fields**: `From` (sender phone, e.g., `whatsapp:+1234567890`), `Body` (message text), `MessageSid` (unique message ID), `NumMedia` (attachment count), `MediaUrl0..N` (attachment URLs)
- **Auth**: `X-Twilio-Signature` HMAC-SHA1 validation using `twilio.validateRequest()`

### 7.2 Command Parser

The inbound parser (`inbound-parser.ts`) processes messages through three modes in priority order:

**Mode 1: Reply Correlation** (highest priority)
- **Email**: Check `In-Reply-To` / `References` headers against `MessageThread.externalThreadId` where `channel = EMAIL`
- **WhatsApp**: Check conversation context (sender phone + recent thread within 24h window) against `MessageThread` records where `channel = WHATSAPP`
- **If matched**: The message is a reply to a previous notification. The ticket is auto-resolved. The message body is processed as either:
  - A command (if it matches keyword patterns like "APPROVE")
  - A comment on the ticket (default -- reply text posted as new comment)

**Mode 2: Keyword Commands** (if no thread match or explicit command in reply)
- Pattern matching against structured command formats (see Section 7.3)
- Case-insensitive matching with flexible whitespace

**Mode 3: @Helix Routing** (for conversational queries)
- Detect `@Helix`, `@helix`, or messages starting with `Helix,` / `helix,`
- Create comment with `isHelixTagged: true`, triggering the existing AI agent dispatch pipeline
- Requires a ticket context (from thread correlation or explicit reference)

**Mode 4: Help Fallback** (no match)
- Return available commands with examples formatted for the channel

### 7.3 Supported Commands

| Command Pattern | Operation | Required Context | Example |
|----------------|-----------|-----------------|---------|
| `APPROVE` | Approve ticket | Reply to approval request notification | Reply "APPROVE" to WhatsApp approval message |
| `APPROVE <reason>` | Approve with reason | Reply to approval request notification | Reply "APPROVE Looks good, solid test coverage" |
| `REJECT <reason>` / `NEEDS DEFENSE <reason>` | Request defense | Reply to approval request notification | Reply "NEEDS DEFENSE Missing error handling" |
| `status <ticket-ref>` | Get ticket status | None (ticket ref in message) | "status RSH-596" or "status 596" |
| `create ticket: <title>` | Create ticket | Body is description; repos in body or prompted | Email subject as title, body as description |
| `queue` / `staging queue` | View staging queue | None | "staging queue" |
| `deploy <ticket-ref>` | Trigger deployment | Ticket must be staging-ready | "deploy RSH-596" |
| `inspect db <repo>: <SQL>` | Database query | Developer/admin permission | "inspect db my-repo: SELECT count(*) FROM users" |
| `inspect logs <repo>: <query>` | Log query | Developer/admin permission | "inspect logs my-repo: error" |
| `inspect api <repo>: <path>` | API call | Developer/admin permission | "inspect api my-repo: /health" |
| `inspect repos` | List repositories | Developer/admin permission | "inspect repos" |
| `rerun <ticket-ref>` | Rerun ticket | Active developer | "rerun RSH-596" |
| `list tickets` | List recent tickets | Active user | "list tickets" |
| `@Helix <question>` | AI agent query (ticket or data) | Ticket context or general query | "@Helix what were the last 30 orders?" or "@Helix what's blocking this ticket?" |
| *(reply to notification)* | Post comment | Auto-resolved ticket from thread | Reply to any notification email with comment text |

**Email-specific command parsing**: For ticket creation via email, the subject line becomes the title and the email body becomes the description. Repository selection can be specified in the body with a `repos: name1, name2` line, or the system can prompt for it in a follow-up email.

**WhatsApp-specific patterns**: WhatsApp interactive buttons (up to 3 options) provide structured responses for approval flows. Button payloads ("Approve", "Needs Defense") bypass text parsing entirely.

### 7.4 Error Handling and Help Fallback

When a message cannot be parsed into a recognized command, the system responds with a help message:

**Email help response:**
```
Subject: Helix: Command Not Recognized

Hi [name],

I couldn't understand your message. Here are some things you can do:

Reply to any notification email to post a comment on that ticket.

Or send a new email with one of these commands:
- Subject: "status RSH-123" - Get ticket status
- Subject: "create ticket: My Title" with description in body
- Subject: "staging queue" - View the staging queue
- Subject: "inspect db my-repo: SELECT ..." - Run a database query
- Include "@Helix" in your message to ask the AI agent a question

For full capabilities, visit https://app.gethelix.ai
```

**WhatsApp help response:**
```
I didn't understand that. Try:

*Commands:*
- APPROVE / REJECT (reply to approval)
- status 596
- list tickets
- staging queue
- deploy 596
- inspect repos
- @Helix [question]

Reply to any notification to comment on that ticket.
```

**Error responses**: Operations that fail (permission denied, ticket not found, invalid SQL) return channel-appropriate error messages with actionable suggestions. Errors never expose stack traces, internal IDs, or system configuration details.

---

## 8. Vendor Selection

### 8.1 Email Provider Comparison

| Dimension | SendGrid | Mailgun | Amazon SES |
|-----------|----------|---------|------------|
| **Outbound API** | REST + SMTP relay; `@sendgrid/mail` Node.js SDK | REST + SMTP relay; `mailgun.js` Node.js SDK | REST + SMTP; `@aws-sdk/client-ses` |
| **Inbound Processing** | Inbound Parse Webhook: auto-parses incoming email and POSTs structured multipart/form-data (sender, subject, stripped text, headers, attachments) to your endpoint | Inbound routing with regex/JSONPath parsing rules; flexible match-and-forward | Requires S3 receipt rules + Lambda function pipeline; raw email parsing needed |
| **SDK Maturity** | Mature, well-maintained, TypeScript types | Stable, good documentation | AWS SDK v3; verbose but comprehensive |
| **Pricing (50K emails/mo)** | ~$19.95/mo (Essentials plan) | ~$35/mo (Foundation plan) | ~$5/mo (pay-per-message) |
| **Integration Complexity** | Low -- single SDK for both outbound and inbound; webhook URL configuration | Low-Medium -- separate inbound routing rules; additional parsing config | High -- S3 + Lambda + receipt rules chain; custom email parsing |
| **Deliverability** | Excellent; dedicated IP available on Pro plan | Excellent; strong domain verification | Good; requires SES domain verification and production access request |
| **Webhook Events** | Delivery, bounce, open, click tracking | Similar event webhooks | SNS notifications for bounces/complaints |

**Recommendation: SendGrid**

SendGrid provides the best balance of outbound and inbound capability in a single service. The Inbound Parse Webhook eliminates the need to write custom email parsing -- it POSTs structured data (sender, subject, stripped text body, headers) directly to the configured endpoint. While Amazon SES is 4x cheaper, its inbound processing requires building an S3 + Lambda pipeline, which adds significant architectural complexity for a feature starting at low volume. Mailgun offers stronger inbound parsing rules but at higher cost, and the additional regex routing capability is unnecessary when the server-side command parser handles intent extraction.

**Key constraint**: SendGrid removed its permanent free tier in 2025. The Essentials plan at $19.95/month for 50,000 emails is well within budget for Helix's 32-user base.

### 8.2 WhatsApp Provider Comparison

| Dimension | Twilio WhatsApp API | Direct WhatsApp Cloud API (Meta) |
|-----------|--------------------|---------------------------------|
| **Abstraction Level** | High -- Twilio acts as Business Solution Provider (BSP), abstracting Meta's API | Low -- direct integration with Meta's Graph API |
| **Template Management** | Twilio manages template submission/approval with Meta; dashboard UI for template editing | Self-manage template submission via Graph API; Meta Business Manager for approval tracking |
| **Node.js SDK** | `twilio` (mature, well-documented, WhatsApp-specific helpers) | `whatsapp-business` (community SDK) or raw HTTP/`axios` |
| **Per-Message Cost (US)** | Meta conversation fee + ~$0.005 Twilio platform fee | Meta conversation fee only |
| **Webhook Management** | Twilio manages webhook routing; single webhook URL for all message types | Self-manage webhook verification + subscription via Meta Graph API |
| **Interactive Messages** | Full support: reply buttons (up to 3), list messages, location requests | Full support (same Meta features) |
| **Integration Complexity** | Low -- single SDK, managed webhooks, dashboard tooling | High -- self-manage Graph API auth, webhook subscriptions, template approval workflows |
| **Phone Number Provisioning** | Twilio provides number or BYO number; straightforward setup | Meta Business verification required; number registration through Meta Business Manager |

**Recommendation: Twilio WhatsApp API**

Twilio's BSP abstraction significantly reduces integration effort. It handles template message submission and approval with Meta, provides webhook management, and offers a mature Node.js SDK with WhatsApp-specific helpers like `validateRequest()` for signature verification. The ~$0.005/message platform fee is justified by reduced development and operational overhead. Direct Meta Cloud API eliminates this fee but requires self-managing template approval workflows, webhook infrastructure, Graph API authentication, and message routing without SDK abstraction.

### 8.3 WhatsApp Template Messages

WhatsApp Business API enforces a 24-hour messaging window. Outside of a user-initiated conversation, only pre-approved **template messages** can be sent. This affects all outbound notifications.

**Required templates (one per notification type):**

| Template Name | Category | Content Preview | Interactive Elements |
|---------------|----------|-----------------|---------------------|
| `helix_comment_notification` | UTILITY | "New comment on {{ticket_title}} by {{author}}: {{comment_preview}}" | Reply button: "View in Helix" |
| `helix_ticket_completed` | UTILITY | "{{ticket_title}} has been deployed successfully. {{summary}}" | Reply button: "View Details" |
| `helix_approval_request` | UTILITY | "Approval needed for {{ticket_title}}: {{defense_text_preview}}" | Buttons: "Approve", "Needs Defense" |
| `helix_approval_response` | UTILITY | "{{responder}} {{action}} {{ticket_title}}: {{reason}}" | Reply button: "View Ticket" |

**Template constraints:**
- Meta typically approves utility templates within 24 hours
- Template variables use `{{1}}`, `{{2}}` placeholder syntax (mapped to named fields at send time)
- Maximum 1024 characters for body text
- Up to 3 interactive buttons per template
- Templates must be approved before first use; changes require re-approval

**24-hour window implications:**
- All 4 notification types require approved templates (sent outside user-initiated windows)
- When a user replies to a template message, a 24-hour session window opens for free-form responses
- @Helix AI replies within the 24h window can use free-form messages (no template needed)
- Utility templates sent within the 24h window are free (since July 2025)
- If a user doesn't reply within 24 hours and then sends a new message, the system must re-initiate with a template

### 8.4 Cost Projections

**Assumptions**: 32 active users, average 20 notifications per user per day, 50% email opt-in, 30% WhatsApp opt-in.

| Volume Scenario | Monthly Emails | Email Cost (SendGrid) | Monthly WhatsApp | WhatsApp Cost (Twilio) | Total |
|----------------|----------------|----------------------|------------------|----------------------|-------|
| **Low** (current, 32 users) | ~10,000 | $19.95 (Essentials min) | ~6,000 | ~$30 (Meta fee) + $30 (Twilio fee) | ~$80/mo |
| **Medium** (100 users) | ~30,000 | $19.95 (within Essentials) | ~18,000 | ~$90 + $90 | ~$200/mo |
| **High** (500 users) | ~150,000 | ~$89.95 (Pro plan) | ~90,000 | ~$450 + $450 | ~$990/mo |

**WhatsApp pricing note**: Meta charges per 24-hour conversation (not per message). Utility conversations (notification-initiated) cost ~$0.005 in the US. Marketing conversations cost more but are not applicable here. User-initiated conversations (inbound) are currently free.

### 8.5 Environment Configuration

New environment variables to add to `helix-global-server/src/config/env.ts` AppConfig:

```typescript
// Email (SendGrid)
sendgridApiKey:         string | null    // SENDGRID_API_KEY - API key for sending and inbound parse
sendgridFromEmail:      string           // SENDGRID_FROM_EMAIL - e.g., helix@notifications.gethelix.ai
sendgridInboundDomain:  string | null    // SENDGRID_INBOUND_DOMAIN - e.g., inbound.gethelix.ai

// WhatsApp (Twilio)
twilioAccountSid:       string | null    // TWILIO_ACCOUNT_SID
twilioAuthToken:        string | null    // TWILIO_AUTH_TOKEN
twilioWhatsappNumber:   string | null    // TWILIO_WHATSAPP_NUMBER - e.g., +1234567890
```

**DNS requirements** (one-time setup):
- **MX record**: Point `inbound.gethelix.ai` to SendGrid's inbound parse MX servers (`mx.sendgrid.net`)
- **CNAME records**: SendGrid domain authentication (DKIM + Return-Path)
- **SPF record**: Include `include:sendgrid.net` in the domain's SPF TXT record

### 8.6 New Dependencies

| Package | Purpose | Current State |
|---------|---------|---------------|
| `@sendgrid/mail` | Email sending (transactional) | Not installed; zero email dependencies in package.json |
| `@sendgrid/helpers` | Webhook signature verification, email parsing utilities | Not installed |
| `twilio` | WhatsApp sending, webhook signature verification (`validateRequest()`), message formatting | Not installed; zero messaging dependencies in package.json |

All three packages are mature, well-maintained, and have TypeScript type definitions. They add approximately 5-10MB to the node_modules footprint.

---

## 9. Implementation Roadmap

### 9.1 Phase 1: Schema and Outbound Delivery

**Goal**: Users receive email notifications for all 4 notification types.

**Scope**:
1. Add schema changes: User.phone/phoneVerified, NotificationPreference, NotificationDelivery, DeliveryChannel, DeliveryStatus enums
2. Generate and apply Prisma migration
3. Add `@sendgrid/mail` dependency
4. Implement `channel-router.ts`, `email-delivery-service.ts`, `message-formatter.ts`
5. Add `dispatchExternalDeliveries()` hook to notification-service.ts
6. Implement `delivery-worker.ts` background retry process
7. Add SendGrid env vars to `config/env.ts`
8. Register delivery worker in `server.ts` startup/shutdown
9. Add notification preference API endpoints (CRUD for user preferences)

**Dependencies**: SendGrid account, DNS configuration, environment variables
**Estimated effort**: 2-3 weeks

### 9.2 Phase 2: Inbound Processing

**Goal**: Users can reply to email notifications to post comments, approve tickets, and execute basic commands.

**Scope**:
1. Add SendGrid Inbound Parse domain configuration
2. Implement `webhook-auth.ts` (SendGrid signature verification)
3. Implement `inbound-parser.ts` (three parsing modes)
4. Add `POST /api/webhooks/sendgrid/inbound` route before requireAuth
5. Implement `MessageThread` creation in outbound flow
6. Implement reply correlation using email headers
7. Implement keyword command recognition (APPROVE, REJECT, status, create, queue, deploy)
8. Implement help fallback response

**Dependencies**: Phase 1 complete, SendGrid Inbound Parse DNS (MX record)
**Estimated effort**: 2-3 weeks

### 9.3 Phase 3: WhatsApp Channel

**Goal**: Users receive WhatsApp notifications and can respond via WhatsApp.

**Scope**:
1. Add `twilio` dependency
2. Add Twilio env vars to `config/env.ts`
3. Submit and get approval for 4 WhatsApp template messages
4. Implement `whatsapp-delivery-service.ts` (template message sending)
5. Add WhatsApp to `channel-router.ts` dispatch
6. Implement Twilio webhook signature verification in `webhook-auth.ts`
7. Add `POST /api/webhooks/twilio/whatsapp` route before requireAuth
8. Add WhatsApp conversation context to `inbound-parser.ts`
9. Implement interactive button handling for approval flows
10. Add phone number verification flow (one-time code via WhatsApp)

**Dependencies**: Phase 1 complete, Twilio account, Meta Business Manager verification, template approval (24h)
**Estimated effort**: 2-3 weeks

### 9.4 Phase 4: @Helix Routing and Inspect Access

**Goal**: Users can query the AI agent and run inspect commands via messaging.

**Scope**:
1. Add @Helix detection to `inbound-parser.ts` (regex: `/\bhelix\b/i`)
2. Create comment records with `isHelixTagged: true` from inbound messages
3. Route AI agent replies back through outbound pipeline
4. Implement inspect command parsing (db, logs, api, repos)
5. Add data sensitivity guards (result truncation, pattern redaction)
6. Add inspect permission checks (isDeveloper/isAdmin) to webhook auth
7. Test end-to-end @Helix query via email and WhatsApp

**Dependencies**: Phases 1-3 complete, host-agent-service active
**Estimated effort**: 1-2 weeks

### 9.5 Deferred Items

| Item | Reason for Deferral | Recommended Timing |
|------|---------------------|--------------------|
| SMS as third channel | Same Twilio infrastructure; add after WhatsApp proves successful | After Phase 3 is stable |
| Daily digest notifications | Requires aggregation logic and scheduling; enhancement after per-event delivery works | After Phase 1 usage data |
| Rich HTML email templates | Start with simple formatting; iterate based on user feedback | After Phase 1 feedback |
| Message delivery analytics dashboard | Requires new client UI components; add after delivery infrastructure is stable | After Phase 2 |
| Organization-level channel policies | Admin-only feature; lower priority than individual preferences | Post-MVP |
| Rate limiting per channel | Monitor volume before implementing limits; 32 users unlikely to trigger issues | After scaling evidence |
| Multi-org context in messages | Complex UX; default to user's primary org initially | Post-MVP |
| Voice/IVR approval | Different technology stack (Twilio Voice); separate initiative | Separate ticket |
| Client-side notification preferences UI | Requires client development; separate from server-side infrastructure | Parallel with Phase 1 |

---

## Appendix A: Interface Comparison

### A.1 Capability Matrix

The following table maps every CLI operation and MCP tool category to Email and WhatsApp support status.

**Legend:**
- **Y** = Supported (full capability)
- **P** = Partial (limited capability or modified UX)
- **N** = Not supported (excluded with rationale)

#### Ticket Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `tickets list` / `list-tickets` | Y | Y | P | P | Returns recent 5 tickets (truncated for messaging); full list via web link |
| `tickets latest` | Y | -- | P | P | Via "latest ticket" command; limited detail in message format |
| `tickets get` / `get-ticket` | Y | Y | Y | Y | Via "status <ref>" command; summary format for messaging |
| `tickets create` / `create-ticket` | Y | Y | Y | P | Email: subject=title, body=description. WhatsApp: structured "create ticket:" message; repo selection limited |
| `tickets update-description` / `update-ticket` | Y | Y | N | N | Complex multi-line editing; requires web UI or CLI |
| `tickets rerun` / `rerun-ticket` | Y | Y | Y | Y | Via "rerun <ref>" command |
| `tickets continue` | Y | -- | N | N | Requires multi-line continuation context; not suited to messaging |
| `tickets artifacts` / `get-run-details` | Y | Y | N | N | Large text artifacts not suited to messaging format |
| `tickets artifact` | Y | -- | N | N | Single artifact retrieval requires step + repo params; complex |
| `tickets bundle` | Y | -- | N | N | Exports to local filesystem; not applicable |
| `archive-ticket` (MCP only) | -- | Y | N | N | Bulk/admin operation; web UI preferred |
| `delete-ticket` (MCP only) | -- | Y | N | N | Destructive; requires web UI confirmation |
| `run-ticket` (MCP only) | -- | Y | P | P | Via "run <ref>" command; start processing a queued ticket |
| `analyze-merge` (MCP only) | -- | Y | N | N | Complex merge analysis; requires web UI for review |

#### Communication Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `comments list` / `get-comments` | Y | Y | N | N | Long comment threads not suited to messaging; view in web UI |
| `comments post` / `post-comment` | Y | Y | Y | Y | Reply to notification = post comment on ticket |
| `manage-comment` (edit/delete/reactions) | -- | Y | N | N | Edit window (5 min) and reactions not applicable to messaging |
| @Helix query (via comment) | Y (via `comments post`) | Y (via `post-comment`) | Y | Y | Include "@Helix" in message; routes through AI agent pipeline |

#### Inspection Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `inspect repos` / `run-inspection` (list) | Y | Y | Y | Y | Via "inspect repos" command; list available repos |
| `inspect db` / `run-inspection` (query) | Y | Y | P | P | Via "inspect db <repo>: <SQL>"; results truncated to 50 rows; sensitive data redacted |
| `inspect logs` / `run-inspection` (logs) | Y | Y | P | P | Via "inspect logs <repo>: <query>"; results truncated |
| `inspect api` / `run-inspection` (api) | Y | Y | P | P | Via "inspect api <repo>: <path>"; response truncated |
| `manage-inspection-keys` | -- | Y | N | N | Security-sensitive key management; web UI or CLI only |

#### Staging and Deployment Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| Staging queue status / `get-staging-queue` | -- | Y | Y | Y | Via "staging queue" command |
| Queue ticket / `manage-staging-queue` | -- | Y | P | P | Via "queue <ref>" command; enqueue only (no remove/retry) |
| `list-deployments` | -- | Y | P | P | Via "deployments" command; summary of recent deployments |
| `manage-deployment` (trigger) | -- | Y | Y | Y | Via "deploy <ref>" command |
| `manage-ns-deployment` | -- | Y | N | N | NetSuite-specific; complex multi-step; web UI only |

#### Approval Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| Submit approval request | -- (via web UI) | -- | N | N | Requires defense text form; web UI only |
| Approve / Needs Defense response | -- (via web UI) | -- | Y | Y | Reply "APPROVE" / "NEEDS DEFENSE <reason>" to approval notification; WhatsApp uses interactive buttons |
| Receive approval notification | In-app only | In-app only | Y | Y | All 4 notification types delivered to opted-in channels |

#### Library Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `library list` | Y | -- | N | N | Low-frequency browsing; web UI preferred |
| `library show` | Y | -- | N | N | Long-form content with annotations; not suited to messaging |
| `library comments list` / `get-library-comments` | Y | Y | N | N | Section-grouped comments; complex display |
| `library comments post` / `post-library-comment` | Y | Y | N | N | Requires section slug + rating; complex structured input |
| `manage-library-comment` | -- | Y | N | N | Edit/delete; web UI only |

#### Sprint Operations (MCP only)

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `list-sprints` | -- | Y | N | N | Sprint browsing is low-frequency; web UI preferred |
| `manage-sprint` | -- | Y | N | N | Create/update/delete sprints; admin workflow |
| `assign-sprint-tickets` | -- | Y | N | N | Bulk ticket assignment; web UI preferred |

#### Attachment Operations (MCP only)

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `list-attachments` | -- | Y | N | N | Attachment browsing via web UI |
| `upload-attachment` | -- | Y | N | N | Requires base64 content; file upload not suited to messaging |
| `delete-attachment` | -- | Y | N | N | Destructive; web UI confirmation preferred |

#### Profile and Settings Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `get-profile` | -- | Y | N | N | Static info; web UI |
| `update-profile` | -- | Y | N | N | Form-based; web UI |
| `manage-notifications` | -- | Y | N | N | Dismiss/mark-viewed; in-app action |
| `get-activity` | -- | Y | N | N | Notification feed is the web UI; messaging delivers individual items |
| `get-analytics` | -- | Y | N | N | Dashboard data; web UI visualization required |
| `get-organization-members` | -- | Y | N | N | Admin listing; web UI |
| `manage-repositories` | -- | Y | N | N | Admin configuration; web UI |
| `manage-settings` | -- | Y | N | N | Admin configuration; web UI |
| `manage-credentials` | -- | Y | N | N | Security-sensitive; web UI |
| `manage-transcript-tickets` | -- | Y | N | N | AI transcript processing; complex workflow; web UI |

#### Administration and Auth Operations

| Operation | CLI | MCP | Email | WhatsApp | Notes |
|-----------|-----|-----|-------|----------|-------|
| `login` | Y | -- | N | N | Browser OAuth or manual key; not applicable to messaging |
| `token add` | Y | -- | N | N | API key management; CLI/web only |
| `org current` | Y | -- | N | N | Context display; not applicable |
| `org list` | Y | -- | N | N | Context display; not applicable |
| `org switch` | Y | -- | N | N | Stateful context change; complex in messaging |
| `preview db-url` | Y | -- | N | N | Security-sensitive connection string; never via messaging |
| `skill show` | Y | -- | N | N | CLI/agent skill management; not applicable |
| `skill install` | Y | -- | N | N | Filesystem operation; not applicable |
| `update` | Y | -- | N | N | CLI self-update; not applicable |

#### Summary Counts

| Interface | Total Operations Available | Supported (Y) | Partial (P) | Not Supported (N) |
|-----------|---------------------------|----------------|-------------|-------------------|
| **CLI** | 27 commands | 27 | 0 | 0 |
| **MCP** | 39 tools | 39 | 0 | 0 |
| **Email** | -- | 10 | 7 | ~42 |
| **WhatsApp** | -- | 10 | 7 | ~42 |

Approximately **17 operations** (10 full + 7 partial) are accessible via Email and WhatsApp, covering the most common workflows: receiving notifications, posting comments, approving/rejecting tickets, creating tickets, checking status, managing the staging queue, triggering deployments, running inspect queries, and querying @Helix.

### A.2 UX Pattern Comparison

| Aspect | CLI | MCP | Email | WhatsApp |
|--------|-----|-----|-------|----------|
| **Interaction Model** | Request-response; user initiates | Tool invocation by AI agent | Asynchronous; send-and-wait | Near-instant; conversational |
| **Authentication** | API key (`hxi_*`) in config file | OAuth 2.1 with dynamic client registration | Sender email matched to User.email | Sender phone matched to User.phone |
| **Threading** | Stateless; each command independent | Session-scoped | Email thread headers (In-Reply-To) | Conversation window (24h) |
| **Rich Formatting** | Plain text tables or JSON (`--json`) | Structured JSON tool results | Simple HTML with plain-text fallback | Basic markdown (*bold*, _italic_, ```code```) |
| **Actions** | Type commands; flags for options | AI agent selects tools | Reply to email; keyword commands in subject/body | Tap interactive buttons; type commands |
| **Attachments** | File paths (local) | Base64 in tool params | Inline images, file attachments | Media messages (images, documents) |
| **Latency** | <2s (HTTP request-response) | <1s (tool invocation) | Seconds to minutes (email delivery) | <1s (WhatsApp delivery) |
| **Push Notifications** | None (poll with new commands) | None (agent polls) | Yes (email arrives in inbox) | Yes (WhatsApp push notification) |
| **Offline Access** | No (requires terminal) | No (requires AI agent) | Yes (emails persist in inbox) | Yes (messages persist in chat) |
| **Multi-device** | Limited to terminal | Limited to agent session | All email clients | All WhatsApp-linked devices |
| **Approval Flow** | Not supported in CLI | Not directly exposed | Reply "APPROVE"/"REJECT" | Tap "Approve"/"Needs Defense" button |
| **Error Handling** | Exit code + stderr message | Tool error response | Help response email | Help response message |
| **Output Length** | Unlimited (terminal scroll) | Unlimited (tool result) | ~50KB practical limit | 4096 character limit |

### A.3 Channel Limitations Summary

**Email Limitations:**
- Delivery latency variability (seconds to minutes depending on provider and recipient server)
- HTML rendering inconsistency across email clients (Outlook, Gmail, Apple Mail)
- Spam filter risk for automated/transactional emails (mitigated by proper SPF/DKIM/DMARC)
- No real-time streaming equivalent (each notification is a separate email)
- Reply parsing complexity (email clients add quoted text, signatures, HTML formatting)
- Thread corruption if users forward or modify headers

**WhatsApp Limitations:**
- 24-hour messaging window: cannot send free-form messages outside user-initiated sessions; all outbound requires pre-approved templates
- Template approval lead time (~24 hours; template changes require re-approval)
- 4096 character message limit (inspect query results must be heavily truncated)
- Limited formatting: only basic markdown, no tables, no HTML, no colors
- Interactive buttons limited to 3 per message
- Business verification required with Meta (one-time process but can take days)
- Phone number must be dedicated to WhatsApp Business (cannot be a personal number)
- Rate limits: Meta enforces messaging limits based on business quality rating

**Shared Limitations (both channels):**
- No real-time streaming (SSE equivalent); all communication is asynchronous message-based
- Identity resolution depends on pre-registered contact information; new users must register first
- Multi-org context is implicit (default org); explicit org switching requires web UI
- Large outputs (artifact contents, long comment threads, full query results) must be truncated with web UI links
- Background delivery infrastructure required (adds operational complexity)
- Vendor dependency (service outages, pricing changes, policy changes)
- Privacy/compliance considerations for storing phone numbers and message delivery metadata

---

## Sources and References

### Source Code Files Referenced

**helix-global-server**:
- `src/services/notification-service.ts` (294 lines) -- Notification creation functions, 4 types
- `src/controllers/comment-controller.ts` -- @Helix fire-and-forget dispatch (lines 121-171)
- `src/services/host-agent-service.ts` -- AI agent session lifecycle, MCP tools, security guards
- `src/services/helix-reply-service.ts` -- Fallback AI reply generation
- `src/routes/api.ts` (483 lines) -- Route registration, inspect routes before requireAuth (lines 222-225), requireAuth gate (line 313)
- `src/config/env.ts` -- AppConfig type (40 fields, lines 3-62), no messaging vendor keys
- `src/server.ts` -- Background process startup (lines 39-56), graceful shutdown (lines 58-101)
- `prisma/schema.prisma` -- User model (lines 292-319), NotificationType enum (lines 870-875), Notification model (lines 877-896)
- `src/auth/middleware.ts` -- 5 auth middleware exports, API key resolution, inspection auth
- `src/controllers/approval-controller.ts` -- Approval request/response with fire-and-forget notifications
- `src/mcp/register-tools.ts` -- 13 tool module registrations
- `src/mcp/tools/*.ts` -- 39 tools across 13 categories

**helix-cli**:
- `src/index.ts` -- 10 top-level commands
- `src/tickets/index.ts` -- 10 ticket subcommands
- `src/comments/index.ts` -- 2 comment subcommands
- `src/inspect/index.ts` -- 4 inspect subcommands
- `src/library/index.ts` -- 4 library subcommands
- `src/org/index.ts` -- 3 org subcommands
- `src/preview/index.ts` -- 1 preview command
- `src/skill/index.ts` -- 2 skill commands
- `src/lib/resolve-ticket.ts` -- Flexible ticket reference resolution (exact ID, short ID, numeric suffix)

**helix-global-client**:
- `src/components/notification-sidebar.tsx` -- Notification feed (polling, pagination, dismiss, auto-mark-viewed)
- `src/components/notification-toast.tsx` -- Toast notifications (sonner, 5s auto-dismiss, spring animations)
- `src/components/approval-section.tsx` -- Approval UI (defense form, pending/approved/needs-defense states)
- `src/components/discussion/comment-input.tsx` -- TipTap editor, @mentions, implicit Helix detection
- `src/types/api.ts` -- NotificationType (4 types), TicketStatus (17 states), ApprovalRequestStatus, ApprovalResponseType

### Runtime Evidence

- **Production user count**: 32 active users (confirmed via runtime DB query `SELECT COUNT(*) FROM "User" WHERE "isActive" = true`)
- **Production log search**: Zero references to email, WhatsApp, Twilio, or SendGrid in application logs (confirmed via BetterStack log query)
- **Notification table**: Access restricted via inspection permissions (confirmed: `permission denied for table Notification`)

### External References

- SendGrid Inbound Parse documentation: webhook auto-parsing of incoming emails
- Twilio WhatsApp Business API: BSP abstraction, template management, interactive buttons
- WhatsApp Business Platform pricing (since July 2025): utility conversations free within 24h window
- Meta template approval process: ~24 hour turnaround for utility templates

## Attachments
- (none)
