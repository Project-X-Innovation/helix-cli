# Ticket Context

- ticket_id: cmpr82ptg001p6a0ufattirly
- short_id: RSH-629
- run_id: cmpr82puf001u6a0uycmt0tk2
- run_branch: helix/research/RSH-629-goal-setup-whatsapp-email
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Goal Setup: Whatsapp & Email

## Description
Implement everything, make sure the UX is incredible

## Research Report

# Email and WhatsApp Interface Development Plan

**RSH-602** | May 2026

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Current State](#2-current-state)
  - [2.1 Infrastructure Gaps](#21-infrastructure-gaps)
  - [2.2 Existing Integration Points](#22-existing-integration-points)
- [3. Architecture Decisions](#3-architecture-decisions)
  - [3.1 Outbound Pipeline: Fire-and-Forget Dispatch](#31-outbound-pipeline-fire-and-forget-dispatch)
  - [3.2 Webhook Route Placement: Before requireAuth](#32-webhook-route-placement-before-requireauth)
  - [3.3 Background Delivery Worker: Interval-Based Retry](#33-background-delivery-worker-interval-based-retry)
  - [3.4 SendGrid Inbound Parse: Multer for Multipart](#34-sendgrid-inbound-parse-multer-for-multipart)
  - [3.5 Twilio Webhook Validation: SDK Middleware](#35-twilio-webhook-validation-sdk-middleware)
  - [3.6 Inbound Parser: Priority Chain](#36-inbound-parser-priority-chain)
  - [3.7 @Helix Integration: Org-Level Concierge Routing](#37-helix-integration-org-level-concierge-routing)
  - [3.8 Schema Strategy: Separate Delivery Tracking](#38-schema-strategy-separate-delivery-tracking)
  - [3.9 Client: Notifications Tab in Settings](#39-client-notifications-tab-in-settings)
  - [3.10 Client: TanStack Query Hooks](#310-client-tanstack-query-hooks)
- [4. Schema Design](#4-schema-design)
  - [4.1 User Model Extension](#41-user-model-extension)
  - [4.2 NotificationPreference Model](#42-notificationpreference-model)
  - [4.3 NotificationDelivery Model](#43-notificationdelivery-model)
  - [4.4 MessageThread Model](#44-messagethread-model)
  - [4.5 ConciergeSession Model](#45-conciergesession-model)
  - [4.6 New Enums](#46-new-enums)
- [5. Service Architecture](#5-service-architecture)
  - [5.1 New Service Files (8)](#51-new-service-files-8)
  - [5.2 Existing File Modifications](#52-existing-file-modifications)
  - [5.3 New API Endpoints](#53-new-api-endpoints)
- [6. Security Implementation](#6-security-implementation)
  - [6.1 Inbound Authentication](#61-inbound-authentication)
  - [6.2 Identity Resolution](#62-identity-resolution)
  - [6.3 Authorization Rules](#63-authorization-rules)
  - [6.4 Data Sensitivity Guards](#64-data-sensitivity-guards)
  - [6.5 Excluded Operations](#65-excluded-operations)
- [7. Client-Side Implementation](#7-client-side-implementation)
  - [7.1 New Files](#71-new-files)
  - [7.2 Modified Files](#72-modified-files)
  - [7.3 Type Definitions](#73-type-definitions)
  - [7.4 UX Decisions](#74-ux-decisions)
- [8. Phased Implementation Roadmap](#8-phased-implementation-roadmap)
  - [8.1 Phase 1: Schema and Outbound Email Delivery](#81-phase-1-schema-and-outbound-email-delivery)
  - [8.2 Phase 2: Inbound Email Processing](#82-phase-2-inbound-email-processing)
  - [8.3 Phase 3: WhatsApp Channel](#83-phase-3-whatsapp-channel)
  - [8.4 Phase 4: Org-Level Concierge and @Helix Routing](#84-phase-4-org-level-concierge-and-helix-routing)
  - [8.5 Client UI (Parallel Track)](#85-client-ui-parallel-track)
- [9. Dependencies and Environment](#9-dependencies-and-environment)
  - [9.1 New npm Packages](#91-new-npm-packages)
  - [9.2 Environment Variables](#92-environment-variables)
  - [9.3 DNS Configuration](#93-dns-configuration)
  - [9.4 External Service Setup](#94-external-service-setup)
- [10. Vendor Selection Rationale](#10-vendor-selection-rationale)
  - [10.1 Email: SendGrid](#101-email-sendgrid)
  - [10.2 WhatsApp: Twilio](#102-whatsapp-twilio)
  - [10.3 Cost Projections](#103-cost-projections)
- [11. Inbound Command Processing](#11-inbound-command-processing)
  - [11.1 Supported Commands](#111-supported-commands)
  - [11.2 WhatsApp Template Messages](#112-whatsapp-template-messages)
  - [11.3 Error Handling and Help Fallback](#113-error-handling-and-help-fallback)
- [12. Capability Matrix](#12-capability-matrix)
- [13. Performance Expectations](#13-performance-expectations)
- [14. Risks and Mitigations](#14-risks-and-mitigations)
- [15. Deferred Items](#15-deferred-items)
- [16. Success Criteria](#16-success-criteria)

---

## 1. Executive Summary

This document is the comprehensive development plan for adding Email and WhatsApp interfaces to Helix. It builds on the architecture design in RSH-596 and is validated by code inspection, runtime evidence, and vendor documentation research.

**What we are building.** Two messaging channels that extend Helix's reach beyond the web UI and CLI:

- **Outbound notifications** via SendGrid (email) and Twilio (WhatsApp) for all 4 notification types
- **Inbound command processing** via webhook endpoints that parse replies, keyword commands, @Helix AI queries, and help fallback
- **Schema extensions** to support delivery tracking, user preferences, phone numbers, and thread correlation
- **Client-side preferences UI** for per-user, per-channel, per-notification-type opt-in management

**Why.** Helix generates the right information but delivers it exclusively in-app. Critical approval requests go unnoticed for hours. Business users who need production data answers must wait for a developer with terminal access. Email and WhatsApp eliminate these bottlenecks by meeting users where they already are — their inbox and their phone.

**Scope.** 17 operations exposed (10 full, 7 partial) out of ~69 total across CLI and MCP. Two repositories changed: helix-global-server (primary) and helix-global-client (secondary). Four implementation phases over 7-11 weeks.

**Key numbers:**

| Metric | Value |
|--------|-------|
| Active users | 32 |
| Notification types | 4 (COMMENT, TICKET_COMPLETED, APPROVAL_REQUESTED, APPROVAL_RESPONDED) |
| New schema models | 4 (NotificationPreference, NotificationDelivery, MessageThread, ConciergeSession) |
| New schema fields on User | 2 (phone, phoneVerified) |
| New enums | 3 (DeliveryChannel, DeliveryStatus, ConciergeSessionStatus) |
| New server service files | 8 |
| New webhook routes | 2 |
| New npm dependencies | 3 (server) + 0 (client) |
| New environment variables | 6 |
| Estimated monthly cost | ~$80 (at 32 users) |

---

## 2. Current State

### 2.1 Infrastructure Gaps

Five confirmed infrastructure gaps exist in helix-global-server, all verified by code inspection and runtime database/log evidence:

| # | Gap | Evidence | Impact |
|---|-----|----------|--------|
| 1 | **No outbound messaging** | `notification-service.ts` (294 lines) creates DB records only via `prisma.notification.createMany()`. Zero vendor SDKs in `package.json`. | Cannot notify users outside the web UI |
| 2 | **No inbound message handling** | `api.ts` (483 lines) has zero `/webhooks/*` routes. No webhook signature verification middleware. | Cannot receive messages from external providers |
| 3 | **No vendor SDK integration** | `package.json` has no SendGrid, SES, nodemailer, or Twilio dependencies. `env.ts` AppConfig (37 fields) has no messaging vendor keys. | No runtime capability to send or receive via vendors |
| 4 | **No phone number storage** | User model (`schema.prisma`, lines 291-319) has 12 columns: `id`, `organizationId`, `email`, `name`, `passwordHash`, `createdAt`, `updatedAt`, `isDeveloper`, `isAdmin`, `isActive`, `avatarUrl`, `isPowerUser`. No `phone` field. Runtime DB confirms. | Cannot map WhatsApp messages to users |
| 5 | **No notification preferences** | No `NotificationPreference` model in schema. No preferences tables in production DB (verified via `information_schema` query). | Cannot let users choose notification channels |

**Runtime validation:** Log search across the last 24 hours for "email", "whatsapp", "twilio", and "sendgrid" returned zero matches from application logic. Production DB has 32 active users. No `NotificationDelivery`, `NotificationPreference`, or `MessageThread` tables exist.

On the client side, helix-global-client has three confirmed gaps:
1. **No notification preferences UI** — Settings page has 6 tabs (General, Repositories, Integrations, Appearance, Cadence, NetSuite); no Notifications tab
2. **No phone number entry** — Profile page has name, email, avatar, password only
3. **No delivery channel types** — `types/api.ts` defines `NotificationType` (4 values) but no `DeliveryChannel` or `NotificationPreference` types

### 2.2 Existing Integration Points

The codebase provides four key patterns that the messaging feature integrates with:

**1. Fire-and-forget dispatch** (`comment-controller.ts`, lines 121-171). After sending the HTTP response, post-create hooks execute asynchronously — including @Helix detection and AI agent dispatch. The notification service will add a similar `dispatchExternalDeliveries()` call after DB write.

**2. Background process startup** (`server.ts`, lines 39-55). Five background processes start when `enableBackgroundProcesses=true`: queue processor, deployment recovery, ticket deploying recovery, OAuth cleanup, stale branch cleanup. The delivery worker follows this same `start*/stop*` pattern.

**3. Inspection auth middleware** (`api.ts`, lines 227-230). Inspection routes use `attachInspectionAuth` + `requireInspectionAuth` instead of session auth, registered before the `requireAuth` gate at line 318. Webhook routes follow this precedent with vendor-specific signature verification.

**4. @Helix detection** (`comment-controller.ts`, lines 75-84). The server applies a `/\bhelix\b/i` regex to detect @Helix mentions. Inbound messages reuse the same regex pattern; however, messaging @Helix queries route to the org-level concierge (Section 3.7) rather than the per-ticket pipeline.

**5. Notification creation functions** (`notification-service.ts`, lines 8-141). Four functions create notifications:
- `createNotificationsForComment` (lines 8-51): COMMENT type, recipients = ticket reporter + director + mentioned users + parent comment author
- `createNotificationsForDeployment` (lines 53-89): TICKET_COMPLETED type, recipients = reporter + director
- `createNotificationsForApprovalRequest` (lines 95-123): APPROVAL_REQUESTED type, recipients = all active developers (excluding submitter)
- `createNotificationsForApprovalResponse` (lines 125-141): APPROVAL_RESPONDED type, recipient = original approval submitter

Each function terminates after `prisma.notification.createMany()` with no post-creation hook for external delivery. The `dispatchExternalDeliveries()` addition inserts after each DB write call.

---

## 3. Architecture Decisions

Each decision was evaluated against alternatives and validated by code inspection and vendor documentation. The pattern is: match existing codebase conventions first, then extend where necessary.

### 3.1 Outbound Pipeline: Fire-and-Forget Dispatch

**Chosen:** Add `dispatchExternalDeliveries()` call after each `prisma.notification.createMany()` in notification-service.ts. The function creates `NotificationDelivery` records (status: PENDING), checks user preferences, and dispatches to delivery services asynchronously.

**Rejected alternatives:**
- *Synchronous delivery in notification creation functions* — Increases primary path latency, couples DB write to vendor API availability, breaks existing fire-and-forget pattern
- *Queue-based delivery via external message queue (Redis/BullMQ)* — Over-engineering for 32 users generating ~640 notifications/day; adds infrastructure dependency the codebase doesn't use

**Rationale:** Matches the established pattern in `comment-controller.ts` where @Helix processing runs after the HTTP response (lines 121-171). The notification DB write path remains unaffected.

**Flow:**
```
Server event -> notification-service.ts -> prisma.notification.createMany() -> DB record
                                              |
                                    dispatchExternalDeliveries()
                                              |
                                    channel-router.ts
                                     /                  \
                          Check NotificationPreference    Check NotificationPreference
                          for EMAIL                       for WHATSAPP
                          /                                    \
                  email-delivery-service.ts          whatsapp-delivery-service.ts
                  Create NotificationDelivery         Create NotificationDelivery
                  (status: PENDING)                   (status: PENDING)
                  Call SendGrid API                   Call Twilio API
                  Update status: SENT/FAILED          Update status: SENT/FAILED
```

### 3.2 Webhook Route Placement: Before requireAuth

**Chosen:** Register webhook routes before `apiRouter.use(requireAuth)` at line 318, following the exact precedent of inspection routes at lines 227-230 which use `attachInspectionAuth` + `requireInspectionAuth`.

**Rejected:** Registering after the requireAuth gate with a custom auth bypass — inconsistent with the existing pattern where the gate is a hard boundary.

**Routes:**
- `POST /api/webhooks/sendgrid/inbound` — with SendGrid signature verification + multer multipart parser
- `POST /api/webhooks/twilio/whatsapp` — with Twilio `twilio.webhook()` middleware

### 3.3 Background Delivery Worker: Interval-Based Retry

**Chosen:** New `delivery-worker.ts` polls every 30 seconds for `NotificationDelivery` records with status `PENDING` or `FAILED` where `attempts < 3`. Follows the `startQueueProcessor()` pattern.

**Rejected:** Retry in the request cycle — blocks the notification creation path during vendor outages.

**Configuration:**
- Poll interval: 30 seconds
- Max retry attempts: 3
- Terminal states: `SENT`, `DELIVERED`, `FAILED` (after 3 attempts)
- Exports: `startDeliveryWorker()` / `stopDeliveryWorker()`
- Startup: Called in `server.ts` within the `enableBackgroundProcesses` block
- Shutdown: Registered in the graceful shutdown handler

### 3.4 SendGrid Inbound Parse: Multer for Multipart

**Chosen:** Use existing `multer` dependency (already in `package.json` for avatar and attachment uploads) with `multer().none()` as route-specific middleware to parse the `multipart/form-data` payload from SendGrid Inbound Parse.

**Rejected:** Adding a new multipart library (busboy, formidable) — unnecessary dependency when multer is already proven in the codebase.

**Key fields extracted from SendGrid:**
- `req.body.from` — sender email
- `req.body.subject` — email subject line
- `req.body.text` — stripped plain text body (SendGrid strips quoted text)
- `req.body.headers` — raw email headers (parsed for `In-Reply-To`, `References`)
- `req.body.envelope` — JSON with from/to addresses

### 3.5 Twilio Webhook Validation: SDK Middleware

**Chosen:** Use `twilio.webhook({ validate: true })` Express middleware. It auto-validates `X-Twilio-Signature` against the request URL and `application/x-www-form-urlencoded` body parameters.

**Rejected:** Manual `validateRequest()` — more boilerplate, requires manually constructing the URL with protocol/host.

**Key fields extracted from Twilio:**
- `req.body.From` — sender phone (format: `whatsapp:+1234567890`)
- `req.body.Body` — message text
- `req.body.MessageSid` — unique message ID
- `req.body.ButtonPayload` — interactive button response (for approval buttons)

The existing `express.urlencoded({ extended: false })` global parser (configured in `app.ts` line 51) handles the Twilio body format.

### 3.6 Inbound Parser: Priority Chain

**Chosen:** Four parsing modes in strict priority order.

**Rejected:** Single regex-based command parser — loses the most natural interaction (replying to a notification with automatic ticket context).

**Priority chain:**

1. **Reply Correlation** (highest priority): Check email `In-Reply-To`/`References` headers or WhatsApp conversation context against `MessageThread` records. If matched, ticket is auto-resolved. Message body checked for approval commands, defaults to comment.

2. **Keyword Commands**: Pattern matching against structured commands (`status <ref>`, `staging queue`, `deploy <ref>`, `inspect db <repo>: <sql>`, etc.). Ticket references resolved flexibly via exact ID, short ID (RSH-596), or numeric suffix (596).

3. **@Helix Routing**: Messages containing `/\bhelix\b/i` route to the org-level concierge agent via `ConciergeSession` lookup by `organizationId`. The concierge has full 39-tool MCP access and maintains conversation context across multi-turn exchanges. There is no per-ticket dispatch and no fallback to a reduced tool set.

4. **Help Fallback**: Unrecognized messages get a channel-appropriate help response listing available commands.

### 3.7 @Helix Integration: Org-Level Concierge Routing

**Chosen:** Route all @Helix messaging queries to the org-level concierge agent via `ConciergeSession` lookup by `organizationId`. One always-warm agent per organization with full 39-tool MCP access (13 categories: tickets, comments, staging queue, deployments, inspection, analytics, organization, and more). No fallback, no degraded mode.

**Rejected:** Per-ticket comment creation reuse — creates a `TicketComment` with `isHelixTagged: true` and routes through the per-ticket host-agent-service/helix-reply-service fallback. Limited to 3 tools in fallback mode, no inspect access, depends on per-ticket session state, and requires an active ticket context.

**Flow:**
1. Inbound message with @Helix detected -> `inbound-parser.ts` identifies @Helix mode
2. `ConciergeSession` lookup by the user's `organizationId`
3. If session status is `WARM`: resume via `claudeSessionId` (responds in seconds)
4. If session expired or missing: initialize new session (30-60 seconds)
5. Concierge processes query with full 39-tool MCP access (including inspect)
6. Response delivered via same channel through outbound pipeline

**Key properties:**
- **Always warm**: 30-minute idle TTL following the MCP server session management pattern
- **Conversation context**: Multi-turn exchanges maintained across @Helix queries via concierge session persistence
- **Channel-agnostic**: Serves all messaging channels (email, WhatsApp) equally; designed for future extension to CLI/MCP
- **No ticket required**: Handles both ticket-scoped and general @Helix queries (e.g., business data questions, production data lookups)

### 3.8 Schema Strategy: Separate Delivery Tracking

**Chosen:** Separate `NotificationDelivery` model linked via `notificationId` FK.

**Rejected:** Adding delivery fields to the existing `Notification` model — bloats the hot-path feed query (`getNotificationFeed`, notification-service.ts lines 147-244); each notification could have deliveries on multiple channels.

**Six schema additions:**
1. User model extension: `phone`, `phoneVerified`, new relations
2. `NotificationPreference`: Per-user, per-channel, per-type opt-in
3. `NotificationDelivery`: Per-notification, per-channel delivery tracking with retry
4. `MessageThread`: Maps external threads to tickets
5. `ConciergeSession`: Org-level concierge session tracking with warm-start resume
6. `DeliveryChannel` + `DeliveryStatus` + `ConciergeSessionStatus` enums

### 3.9 Client: Notifications Tab in Settings

**Chosen:** New "Notifications" tab in the existing Settings page, following the exact same pattern as the 6 existing tabs.

**Rejected:** Standalone `/notifications-settings` route — inconsistent with the consolidated settings architecture.

**Implementation details:**
- Add `"notifications"` to `TabId` union type (line 13 of `settings.tsx`)
- Add `{ id: "notifications", label: "Notifications" }` to `tabs` array (lines 63-69)
- New file: `src/routes/settings/notifications-tab.tsx`
- URL: `?tab=notifications`

### 3.10 Client: TanStack Query Hooks

**Chosen:** TanStack Query hooks (`useQuery` + `useMutation`) with optimistic updates for preference toggles.

**Rejected:** Direct fetch calls in component — inconsistent with the codebase which uniformly uses TanStack React Query.

**New hooks:**
- `notificationPreferencesQueryOptions()` — GET `/api/notification-preferences`
- `useUpdateNotificationPreference()` — PUT `/api/notification-preferences` (optimistic toggle with rollback)
- `useUpdatePhone()` — PATCH `/api/profile` (extend existing endpoint)

---

## 4. Schema Design

All schema changes target `helix-global-server/prisma/schema.prisma`. The current schema uses Prisma v6.19.2 with PostgreSQL and has 57 existing migration files (latest: `20260523000000_add_demo_feedback`).

A single Prisma migration file is generated alongside the schema changes and deployed via the existing `prisma migrate deploy` command in the build script.

### 4.1 User Model Extension

Add phone number and verification fields to the existing User model (currently at lines 291-319):

```prisma
model User {
  // ... existing fields ...

  phone                    String?    // WhatsApp number in E.164 format (+1234567890)
  phoneVerified            Boolean    @default(false)

  // ... existing relations ...
  notificationPreferences  NotificationPreference[]
  messageThreads           MessageThread[]
}
```

**Rationale:** E.164 format is required by the Twilio WhatsApp API. The `phoneVerified` flag prevents unverified numbers from receiving messages.

### 4.2 NotificationPreference Model

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

**Key design choices:**
- Unique constraint on `(userId, organizationId, channel, notificationType)` ensures exactly one preference per combination
- Organization scoping supports multi-org users with different preferences per org
- Opt-in default: no preferences created by default; users explicitly enable channels

### 4.3 NotificationDelivery Model

Per-notification, per-channel delivery tracking with retry support:

```prisma
model NotificationDelivery {
  id                String          @id @default(cuid())
  notificationId    String
  notification      Notification    @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  channel           DeliveryChannel
  status            DeliveryStatus
  externalMessageId String?         // SendGrid message ID or Twilio message SID
  error             String?         // Last error for failed deliveries
  attempts          Int             @default(0)
  sentAt            DateTime?
  deliveredAt       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([status, createdAt])       // Retry worker: WHERE status IN ('PENDING','FAILED')
  @@index([notificationId])          // Lookup deliveries by notification
  @@index([externalMessageId])       // Webhook status callbacks from vendors
}
```

**Index rationale:** The `status + createdAt` compound index supports the delivery worker's primary query pattern. The `externalMessageId` index enables fast lookup when vendors POST delivery status callbacks.

### 4.4 MessageThread Model

Maps external message threads to Helix tickets for reply correlation:

```prisma
model MessageThread {
  id               String          @id @default(cuid())
  externalThreadId String          // Email Message-ID or WhatsApp conversation ID
  channel          DeliveryChannel
  ticketId         String
  ticket           Ticket          @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  userId           String
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt        DateTime        @default(now())

  @@unique([externalThreadId, channel])  // One thread per external ID per channel
  @@index([ticketId])                    // Find threads by ticket
  @@index([userId, channel])             // Find user's threads on a channel
}
```

### 4.5 ConciergeSession Model

The org-level concierge requires a dedicated session model to track warm-start state, session resume identifiers, and TTL management.

```prisma
model ConciergeSession {
  id               String                   @id @default(cuid())
  organizationId   String                   @unique
  organization     Organization             @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  claudeSessionId  String?                  // Claude Agent SDK session ID for session resume (warm-start)
  spriteName       String?                  // Sprite VM name if dedicated VM (e.g., "concierge-{orgId}")
  status           ConciergeSessionStatus   @default(INITIALIZING)
  lastActivity     DateTime                 @default(now())  // For TTL-based session management
  createdAt        DateTime                 @default(now())
  updatedAt        DateTime                 @updatedAt

  @@index([status, lastActivity])  // For cleanup queries: find expired sessions
}
```

**Design rationale — separate from HostAgentSession:** The concierge and per-ticket host agents have fundamentally different lifecycle semantics. `HostAgentSession` has `ticketId @unique`, follows a PROVISIONING -> ACTIVE -> TERMINATED lifecycle tied to ticket runs, and uses tools scoped to a checked-out codebase (`/app/`). The concierge is org-scoped (`organizationId @unique`), follows a WARM / INITIALIZING / ERROR lifecycle independent of any ticket, and uses the full org-level MCP tool set (39 tools). Forcing both into one model would require making `ticketId` nullable, adding a type discriminator, and migrating existing records — complexity that serves no purpose.

**Session management pattern:** The concierge follows the MCP server's session management design (30-minute idle TTL, `lastActivity` keep-warm, periodic cleanup). A background process checks `lastActivity` and terminates sessions idle beyond the TTL threshold. Warm sessions are resumed via `claudeSessionId` when a new @Helix query arrives. If the session has expired, a new one is initialized (30-60 seconds) and the user receives their response after initialization completes.

**Organization relation:** The Organization model gains a new optional relation:
```prisma
model Organization {
  // ... existing relations ...
  conciergeSession  ConciergeSession?
}
```

### 4.6 New Enums

```prisma
enum DeliveryChannel {
  EMAIL
  WHATSAPP
}

enum DeliveryStatus {
  PENDING      // Queued for delivery
  SENT         // Vendor API accepted the message
  DELIVERED    // Vendor confirmed delivery to recipient
  FAILED       // Delivery failed after all retry attempts
}

enum ConciergeSessionStatus {
  WARM          // Session is active and can respond in seconds
  INITIALIZING  // Session is starting up (30-60s)
  ERROR         // Session encountered an error; will be re-initialized on next query
}
```

Three enums support the messaging infrastructure: `DeliveryChannel` defines the two outbound channels, `DeliveryStatus` tracks per-delivery lifecycle states, and `ConciergeSessionStatus` tracks the org-level concierge session lifecycle (WARM for active sessions, INITIALIZING during startup, ERROR for sessions requiring re-initialization).

**Relationship diagram:**

```
Organization
  |-- ConciergeSession? (new, one-per-org concierge)
  |
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

## 5. Service Architecture

### 5.1 New Service Files (8)

All new files in `helix-global-server/src/services/messaging/`:

| Service | Responsibility | Pattern Reference |
|---------|---------------|-------------------|
| `channel-router.ts` | Query `NotificationPreference` for recipient, dispatch to appropriate delivery service for each opted-in channel | Extension of `notification-service.ts` |
| `email-delivery-service.ts` | Format notification as email (HTML + plain-text), send via `@sendgrid/mail`, set threading headers (Message-ID, In-Reply-To, References), create/update `NotificationDelivery` record, create `MessageThread` record | New; uses `@sendgrid/mail` |
| `whatsapp-delivery-service.ts` | Format notification as WhatsApp template message, send via Twilio SDK, handle interactive buttons for approvals, create/update `NotificationDelivery` record, create `MessageThread` record | New; uses `twilio` SDK |
| `delivery-worker.ts` | Background retry worker: poll `PENDING`/`FAILED` deliveries every 30s, retry up to 3 attempts, update terminal statuses. Exports `startDeliveryWorker()` / `stopDeliveryWorker()` | Follows `startQueueProcessor` in `server.ts` |
| `message-formatter.ts` | Format ticket data, comments, approvals, inspect results into channel-appropriate messages. Email: HTML + plain-text. WhatsApp: basic markdown. Shared by both delivery services. | New utility |
| `webhook-auth.ts` | Vendor signature verification + sender-to-user identity resolution. Two strategies: SendGrid (secret URL segment), Twilio (`twilio.webhook()` middleware). Returns resolved `User` on success, 403 on invalid signature, rejection response for unknown senders. | Follows `attachInspectionAuth` in `middleware.ts` |
| `inbound-parser.ts` | Parse inbound messages through priority chain: reply correlation -> keyword commands -> @Helix routing -> help fallback. Returns structured intent objects (`CommentIntent`, `ApprovalIntent`, `CommandIntent`, `HelixQueryIntent`, `HelpIntent`). | New; references `resolve-ticket.ts` patterns |
| `concierge-session-service.ts` | Org-level concierge session lifecycle: warm-start via `claudeSessionId` resume, 30-minute idle TTL, periodic cleanup of expired sessions, re-initialization on ERROR status | Follows MCP server session management pattern |

### 5.2 Existing File Modifications

| File | Change | Lines Affected |
|------|--------|----------------|
| `src/services/notification-service.ts` | Add `dispatchExternalDeliveries()` call after each `createMany()` | After lines 50, 89, 123, 141 |
| `src/server.ts` | Register delivery worker startup/shutdown | Lines 39-55 (startup), 58-101 (shutdown) |
| `src/routes/api.ts` | Register 2 webhook routes + notification preference endpoints before requireAuth | Before line 318 |
| `src/config/env.ts` | Add 6 new env vars to AppConfig | Lines 3-60 |
| `prisma/schema.prisma` | 6 schema additions: User fields, 4 new models, 3 new enums | User model at lines 291-319; new models and enums appended |
| `package.json` | Add 3 new dependencies | `dependencies` section |

### 5.3 New API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/webhooks/sendgrid/inbound` | POST | SendGrid secret URL segment | Receive inbound emails |
| `/api/webhooks/twilio/whatsapp` | POST | Twilio `X-Twilio-Signature` validation | Receive WhatsApp messages |
| `/api/notification-preferences` | GET | Session auth | List user's notification preferences |
| `/api/notification-preferences` | PUT | Session auth | Upsert a notification preference |

---

## 6. Security Implementation

### 6.1 Inbound Authentication

| Channel | Method | Library | Signature Location |
|---------|--------|---------|-------------------|
| **Email** (SendGrid) | Secret path segment in webhook URL or basic auth | N/A (server-side secret comparison) | Secret in URL query parameter |
| **WhatsApp** (Twilio) | HMAC-SHA1 via `twilio.webhook()` middleware | `twilio` SDK | `X-Twilio-Signature` header |

Webhook auth middleware:
1. Validates vendor signature (rejects with 403 if invalid)
2. Extracts sender identity (email or phone number)
3. Resolves sender to a Helix `User` record
4. Attaches resolved user to request context

### 6.2 Identity Resolution

| Channel | Sender Field | Match Field |
|---------|-------------|-------------|
| Email | `from` address (parsed from SendGrid POST body) | `User.email` (exact match) |
| WhatsApp | `From` number (E.164, parsed from Twilio POST body) | `User.phone` (exact match) |

**Unregistered senders:** If the sender email/phone does not match any active user, the webhook responds with a rejection message:
- Email: Auto-reply explaining the sender is not registered
- WhatsApp: Reply message with registration instructions

**Multi-org resolution:** Defaults to the user's primary organization (`organizationId` field on User model). Explicit org context in messages is deferred to post-MVP.

### 6.3 Authorization Rules

Each inbound operation maps to the existing permission model:

| Operation | Required Permission | Reference |
|-----------|-------------------|-----------|
| View ticket status | Active user | `requireAuth` gate |
| Create ticket | Active user + org membership | Ticket creation requires `organizationId` |
| Post comment | Active user | Comment routes |
| @Helix query | Active user | Same as post comment |
| Approve / reject ticket | Active developer | `approval-controller.ts` |
| Queue for staging | Active developer | Developer-gated staging queue |
| Trigger deployment | Active developer | Deployment routes |
| Inspect (repos/db/logs/api) | Active developer or admin | Inspection auth |

### 6.4 Data Sensitivity Guards

**Never include in outbound messages:**
- Database connection strings (matched by `(postgres|mysql|mongodb):\/\/`)
- API keys (matched by `sk-*`, `hxi_*`, `SG.*`, `AC*` patterns)
- Encryption keys, password hashes, OAuth tokens
- Environment variable dumps

**Inspect query result protections:**
- **Row limit:** Truncate to 50 rows maximum
- **Pattern redaction:** Scan and redact connection strings, API key formats, credential patterns
- **Length limit:** 4000 characters for WhatsApp; 50KB for email
- **Warning prefix:** "Results may be truncated. View full results at [web UI link]" when truncation occurs

**Explicitly excluded from messaging:** `preview db-url` (outputs raw Neon connection strings that must never transit external messaging infrastructure).

### 6.5 Excluded Operations

42 operations are explicitly excluded from messaging interfaces:

| Category | Examples | Reason |
|----------|----------|--------|
| Destructive | `delete-ticket`, `archive-ticket` | Require web UI confirmation |
| Security-sensitive | `preview db-url`, `manage-credentials`, `manage-inspection-keys` | Credential/connection data must not transit messaging |
| Complex forms | `update-ticket`, `manage-settings`, `tickets continue` | Multi-line editing, complex nested forms |
| Filesystem | `skill install`, `tickets bundle`, `update` | Require local filesystem access |
| Admin workflows | `manage-sprint`, `assign-sprint-tickets`, `manage-repositories` | Low-frequency admin operations |
| Rich-UI-dependent | `tickets artifacts`, `library show`, `get-analytics` | Large content requiring web rendering |
| Context-stateful | `org switch`, `login`, `token add` | Authentication/session state not applicable to messaging |

---

## 7. Client-Side Implementation

The client (helix-global-client) is a Vite 7 + React 19 + Tailwind CSS v4 + TanStack React Query 5 SPA. No new npm dependencies are required.

### 7.1 New Files

| File | Responsibility |
|------|---------------|
| `src/routes/settings/notifications-tab.tsx` | Notification preferences UI: phone entry section, preference toggle grid |
| `src/api/notification-preferences.ts` | Query options and mutation hooks for preference CRUD |

### 7.2 Modified Files

| File | Change |
|------|--------|
| `src/types/api.ts` | Add `DeliveryChannel`, `NotificationPreference` types; extend `User` type with `phone`/`phoneVerified` |
| `src/routes/settings.tsx` | Add `"notifications"` to `TabId` union, add tab entry to `tabs` array, import `NotificationsTab` |

**Files NOT Changed:**
| File | Reason |
|------|--------|
| `notification-sidebar.tsx` | Operates on in-app Notification records via 30s polling; completely independent of external delivery |
| `notification-toast.tsx` | In-app toast UI via sonner library; unaffected |
| `approval-section.tsx` | Approval UI in web context; no changes needed |

### 7.3 Type Definitions

New types in `src/types/api.ts`:

```typescript
export type DeliveryChannel = "EMAIL" | "WHATSAPP";

export type NotificationPreference = {
  id: string;
  channel: DeliveryChannel;
  notificationType: NotificationType;
  enabled: boolean;
};
```

User type extension:
```typescript
phone: string | null;
phoneVerified: boolean;
```

### 7.4 UX Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Toggle behavior** | Immediate save on toggle (optimistic update with rollback on error) | Each toggle is discrete; TanStack Query handles it cleanly |
| **WhatsApp when phone unverified** | Disabled (grayed out) with helper text | Showing disabled toggles teaches users about the capability |
| **Phone entry location** | Notifications tab (above preference grid), not Profile page | Phone is exclusively for WhatsApp; cohesive with channel configuration |
| **Phone validation** | Client-side E.164 regex (`/^\+[1-9]\d{1,14}$/`) + server validation | Prevents unnecessary API round-trips |

**Notifications tab layout:**
1. **Phone number section** (top) — E.164 input field, verification status indicator, save button
2. **Preference toggle grid** (below) — rows = notification types, columns = channels (EMAIL, WHATSAPP)
3. WhatsApp toggles disabled/grayed when phone is unverified, with helper text explaining why

---

## 8. Phased Implementation Roadmap

### 8.1 Phase 1: Schema and Outbound Email Delivery

**Goal:** Users receive email notifications for all 4 notification types.

**Scope:**
1. Add schema changes: `User.phone`/`phoneVerified`, `NotificationPreference`, `NotificationDelivery`, `MessageThread`, `DeliveryChannel`, `DeliveryStatus` enums
2. Generate and apply Prisma migration (single migration file committed with schema changes)
3. Add `@sendgrid/mail` and `@sendgrid/helpers` dependencies
4. Implement `channel-router.ts` — query preferences, dispatch to delivery services
5. Implement `email-delivery-service.ts` — format and send via SendGrid, create delivery records
6. Implement `message-formatter.ts` — format ticket data for email (HTML + plain-text)
7. Add `dispatchExternalDeliveries()` hook to all 4 functions in `notification-service.ts`
8. Implement `delivery-worker.ts` — background retry with 30s poll interval
9. Add 3 SendGrid env vars to `config/env.ts`
10. Register delivery worker in `server.ts` startup/shutdown
11. Add notification preference API endpoints (`GET` + `PUT` on `/api/notification-preferences`)

**Dependencies:** SendGrid account, DNS configuration (MX, CNAME, SPF), environment variables

**Estimated effort:** 2-3 weeks

### 8.2 Phase 2: Inbound Email Processing

**Goal:** Users can reply to email notifications to post comments, approve tickets, and execute commands.

**Scope:**
1. Configure SendGrid Inbound Parse domain
2. Implement `webhook-auth.ts` — SendGrid secret URL segment verification + sender identity resolution
3. Implement `inbound-parser.ts` — four parsing modes (reply correlation, keyword, @Helix, help)
4. Add `POST /api/webhooks/sendgrid/inbound` route before `requireAuth`, with `multer().none()` middleware
5. Implement `MessageThread` creation in outbound email flow (store `Message-ID` for thread correlation)
6. Implement reply correlation using email `In-Reply-To`/`References` headers
7. Implement keyword command recognition (APPROVE, REJECT, status, create, queue, deploy, rerun, list tickets, inspect)
8. Implement help fallback response (email format)

**Dependencies:** Phase 1 complete, SendGrid Inbound Parse DNS (MX record)

**Estimated effort:** 2-3 weeks

### 8.3 Phase 3: WhatsApp Channel

**Goal:** Users receive WhatsApp notifications and can respond via WhatsApp.

**Scope:**
1. Add `twilio` dependency
2. Add 3 Twilio env vars to `config/env.ts`
3. Submit and get approval for 4 WhatsApp template messages (see Section 11.2)
4. Implement `whatsapp-delivery-service.ts` — template message sending via Twilio SDK
5. Add WhatsApp channel to `channel-router.ts` dispatch
6. Implement Twilio webhook signature verification in `webhook-auth.ts`
7. Add `POST /api/webhooks/twilio/whatsapp` route before `requireAuth`
8. Add WhatsApp conversation context to `inbound-parser.ts`
9. Implement interactive button handling for approval flows (ButtonPayload parsing)
10. Add phone number verification flow (one-time code via WhatsApp)

**Dependencies:** Phase 1 complete, Twilio account, Meta Business Manager verification, template approval (~24h)

**Estimated effort:** 2-3 weeks

### 8.4 Phase 4: Org-Level Concierge and @Helix Routing

**Goal:** Deploy the org-level concierge agent and enable @Helix queries and inspect commands via messaging.

**Scope:**
1. Add `ConciergeSession` model to Prisma schema and generate migration
2. Implement concierge session management — warm-start via `claudeSessionId` resume, idle TTL (30-minute default following MCP server pattern), periodic cleanup of expired sessions
3. Register the full MCP tool surface (39 tools, 13 categories) for the concierge agent
4. Implement @Helix routing to the concierge from `inbound-parser.ts` — all @Helix queries route to the org-level concierge, not to per-ticket host agent sessions
5. Add @Helix detection to `inbound-parser.ts` (regex: `/\bhelix\b/i`)
6. Implement inspect command parsing (`db`, `logs`, `api`, `repos`) with data sensitivity guards (result truncation, pattern redaction)
7. Add inspect permission checks (`isDeveloper`/`isAdmin`) to webhook auth
8. Implement multi-turn conversation context for @Helix queries via the concierge's session persistence
9. Test end-to-end @Helix query via email and WhatsApp, verifying warm-start response times (seconds for warm sessions)

**Dependencies:** Phases 1-3 complete, Claude Agent SDK and Sprites infrastructure available

**Estimated effort:** 2-3 weeks

### 8.5 Client UI (Parallel Track)

**Goal:** Users can manage notification preferences and enter phone numbers from the web UI.

**Can run in parallel with Phase 1.** Requires the notification preference API endpoints from Phase 1.

**Scope:**
1. Add `DeliveryChannel` and `NotificationPreference` types to `types/api.ts`
2. Extend `User` type with `phone`/`phoneVerified`
3. Add `"notifications"` tab to Settings page (`settings.tsx`)
4. Create `notifications-tab.tsx` with phone entry and preference toggle grid
5. Create `notification-preferences.ts` with TanStack Query hooks
6. Implement optimistic toggle updates with rollback

**Estimated effort:** 1 week

### Timeline Summary

```
Week 1-3:   Phase 1 (Schema + Outbound Email)
            Client UI (Parallel — after preference API endpoints ready)
Week 3-5:   Phase 2 (Inbound Email Processing)
Week 4-7:   Phase 3 (WhatsApp Channel — can start after Phase 1, partial overlap with Phase 2)
Week 7-10:  Phase 4 (Org-Level Concierge + @Helix Routing)
```

**Total estimated timeline:** 8-12 weeks (with parallelism)

---

## 9. Dependencies and Environment

### 9.1 New npm Packages

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `@sendgrid/mail` | latest stable | Outbound email sending via SendGrid REST API | ~2MB |
| `@sendgrid/helpers` | latest stable | Email parsing utilities, webhook helpers (peer dep of `@sendgrid/mail`) | ~1MB |
| `twilio` | latest stable | WhatsApp sending, `webhook()` middleware, `validateRequest()` | ~5MB |

All three packages have TypeScript type definitions. Total node_modules impact: ~5-10MB.

**Existing dependencies reused:**
- `multer` — for SendGrid Inbound Parse multipart/form-data parsing
- `express` — `express.urlencoded()` already handles Twilio webhook body parsing
- `@prisma/client` — new models

### 9.2 Environment Variables

Six new variables in `helix-global-server/src/config/env.ts`:

```typescript
// Email (SendGrid)
sendgridApiKey:        string | null    // SENDGRID_API_KEY
sendgridFromEmail:     string           // SENDGRID_FROM_EMAIL (e.g., helix@notifications.gethelix.ai)
sendgridInboundDomain: string | null    // SENDGRID_INBOUND_DOMAIN (e.g., inbound.gethelix.ai)

// WhatsApp (Twilio)
twilioAccountSid:      string | null    // TWILIO_ACCOUNT_SID
twilioAuthToken:       string | null    // TWILIO_AUTH_TOKEN
twilioWhatsappNumber:  string | null    // TWILIO_WHATSAPP_NUMBER (e.g., +1234567890)
```

All messaging-related vars are nullable (except `sendgridFromEmail` with a default) to allow graceful degradation when not configured. The system operates without external messaging if vendor keys are absent.

### 9.3 DNS Configuration

One-time setup required before Phase 1 email delivery:

| Record Type | Domain | Value | Purpose |
|-------------|--------|-------|---------|
| MX | `inbound.gethelix.ai` | `mx.sendgrid.net` (priority 10) | Route inbound email to SendGrid Inbound Parse |
| CNAME | (provided by SendGrid) | (provided by SendGrid) | DKIM authentication for outbound email |
| CNAME | (provided by SendGrid) | (provided by SendGrid) | Return-Path for bounce handling |
| TXT | `gethelix.ai` | `v=spf1 include:sendgrid.net ~all` | SPF record authorizing SendGrid to send on behalf of domain |

### 9.4 External Service Setup

| Service | Setup Steps | Lead Time |
|---------|-------------|-----------|
| **SendGrid account** | Create account, verify sender domain, configure Inbound Parse, obtain API key | 1-2 days |
| **Twilio account** | Create account, register WhatsApp Business number, connect to Meta Business Manager | 2-5 days |
| **Meta Business Manager** | Business verification (one-time); required for WhatsApp Business API | 1-7 days |
| **WhatsApp template approval** | Submit 4 template messages via Twilio dashboard; Meta reviews | ~24 hours per template |

---

## 10. Vendor Selection Rationale

### 10.1 Email: SendGrid

**Selected over:** Mailgun, Amazon SES

| Dimension | SendGrid | Mailgun | Amazon SES |
|-----------|----------|---------|------------|
| **Outbound + Inbound** | Single SDK for both; Inbound Parse auto-parses email into structured POST | Separate inbound routing rules | S3 + Lambda + receipt rules pipeline |
| **Integration Complexity** | Low | Low-Medium | High |
| **Pricing (50K/mo)** | ~$19.95 (Essentials) | ~$35 (Foundation) | ~$5 (pay-per-message) |

**Why SendGrid:** Best balance of outbound and inbound in a single service. Inbound Parse Webhook eliminates custom email parsing. While SES is 4x cheaper, its inbound processing requires building an S3 + Lambda pipeline — significant architectural complexity for a feature starting at low volume.

### 10.2 WhatsApp: Twilio

**Selected over:** Direct WhatsApp Cloud API (Meta)

| Dimension | Twilio | Direct Meta Cloud API |
|-----------|--------|----------------------|
| **Abstraction** | High — BSP manages template approval, webhook routing | Low — self-manage everything |
| **SDK** | Mature `twilio` Node.js SDK with WhatsApp helpers | Community SDK or raw HTTP |
| **Per-Message Cost** | Meta fee + ~$0.005 Twilio platform fee | Meta fee only |
| **Integration Complexity** | Low | High |

**Why Twilio:** BSP abstraction significantly reduces integration effort — manages template submission/approval, provides webhook management, offers `validateRequest()` for signature verification. The ~$0.005/message platform fee is justified by reduced development and operational overhead.

### 10.3 Cost Projections

Assumptions: average 20 notifications per user per day, 50% email opt-in, 30% WhatsApp opt-in.

| Scenario | Users | Monthly Emails | Email Cost | Monthly WhatsApp | WhatsApp Cost | **Total** |
|----------|-------|----------------|------------|------------------|---------------|-----------|
| **Current** | 32 | ~10,000 | $19.95 | ~6,000 | ~$60 | **~$80/mo** |
| **Medium** | 100 | ~30,000 | $19.95 | ~18,000 | ~$180 | **~$200/mo** |
| **High** | 500 | ~150,000 | ~$89.95 | ~90,000 | ~$900 | **~$990/mo** |

WhatsApp pricing is per 24-hour conversation (not per message). Utility conversations cost ~$0.005 in the US. User-initiated conversations (inbound) are currently free.

---

## 11. Inbound Command Processing

### 11.1 Supported Commands

| Command Pattern | Operation | Required Context | Example |
|----------------|-----------|-----------------|---------|
| `APPROVE` | Approve ticket | Reply to approval notification | Reply "APPROVE" |
| `APPROVE <reason>` | Approve with reason | Reply to approval notification | "APPROVE Looks good" |
| `REJECT <reason>` / `NEEDS DEFENSE <reason>` | Request defense | Reply to approval notification | "NEEDS DEFENSE Missing error handling" |
| `status <ticket-ref>` | Get ticket status | None | "status RSH-596" or "status 596" |
| `create ticket: <title>` | Create ticket | Body = description; repos in body or prompted | Email: subject = title, body = description |
| `queue` / `staging queue` | View staging queue | None | "staging queue" |
| `deploy <ticket-ref>` | Trigger deployment | Ticket must be staging-ready | "deploy RSH-596" |
| `rerun <ticket-ref>` | Rerun ticket | Active developer | "rerun RSH-596" |
| `list tickets` | List recent tickets | Active user | "list tickets" |
| `inspect repos` | List repositories | Developer/admin | "inspect repos" |
| `inspect db <repo>: <SQL>` | Database query | Developer/admin | "inspect db my-repo: SELECT count(*) FROM users" |
| `inspect logs <repo>: <query>` | Log query | Developer/admin | "inspect logs my-repo: error" |
| `inspect api <repo>: <path>` | API call | Developer/admin | "inspect api my-repo: /health" |
| `@Helix <question>` | AI agent query | Ticket context or general query | "@Helix what were the last 30 orders?" |
| *(reply to notification)* | Post comment | Auto-resolved from thread | Reply to any notification |

**Ticket reference resolution:** Flexible matching by exact internal ID, short ID (case-insensitive, e.g., `RSH-596`), or numeric suffix (e.g., `596`). Same patterns as `resolve-ticket.ts` in helix-cli.

### 11.2 WhatsApp Template Messages

Four pre-approved templates (one per notification type):

| Template Name | Category | Content | Buttons |
|---------------|----------|---------|---------|
| `helix_comment_notification` | UTILITY | "New comment on {{ticket_title}} by {{author}}: {{comment_preview}}" | "View in Helix" |
| `helix_ticket_completed` | UTILITY | "{{ticket_title}} has been deployed successfully. {{summary}}" | "View Details" |
| `helix_approval_request` | UTILITY | "Approval needed for {{ticket_title}}: {{defense_text_preview}}" | "Approve", "Needs Defense" |
| `helix_approval_response` | UTILITY | "{{responder}} {{action}} {{ticket_title}}: {{reason}}" | "View Ticket" |

**Template constraints:** Maximum 1024 characters body, up to 3 interactive buttons, `{{1}}`/`{{2}}` placeholder syntax, approval required before first use, changes require re-approval.

**24-hour window:** All outbound notifications require templates (sent outside user-initiated sessions). When a user replies within 24 hours, free-form responses are allowed. Interactive buttons work regardless of the window. If the session expires, the system re-engages with a template.

### 11.3 Error Handling and Help Fallback

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

**Error responses:** Permission denied, ticket not found, invalid SQL, and other operation failures return channel-appropriate error messages with actionable suggestions. Errors never expose stack traces, internal IDs, or system configuration details.

---

## 12. Capability Matrix

17 operations exposed via messaging (10 full support, 7 partial) out of ~69 total across CLI and MCP.

### Summary

| Interface | Total | Supported (Y) | Partial (P) | Not Supported (N) |
|-----------|-------|----------------|-------------|-------------------|
| **CLI** | 27 | 27 | 0 | 0 |
| **MCP** | 39 | 39 | 0 | 0 |
| **Email** | -- | 10 | 7 | ~42 |
| **WhatsApp** | -- | 10 | 7 | ~42 |

### Full Support (10)

| Operation | Via |
|-----------|-----|
| Receive notifications (all 4 types) | Automatic delivery to opted-in channels |
| Post comment (reply to notification) | Reply to notification email/WhatsApp |
| Approve ticket | Reply "APPROVE" or tap WhatsApp button |
| Reject / needs defense | Reply "REJECT" or tap WhatsApp button |
| Check ticket status | "status RSH-596" |
| View staging queue | "staging queue" |
| Trigger deployment | "deploy RSH-596" |
| Rerun ticket | "rerun RSH-596" |
| List inspect repos | "inspect repos" |
| @Helix AI query | "@Helix [question]" |

### Partial Support (7)

| Operation | Limitation |
|-----------|-----------|
| Create ticket | Email: natural (subject=title, body=description). WhatsApp: structured message, repo selection limited |
| List tickets | Returns recent 5 only (truncated for messaging) |
| Inspect db | Results truncated to 50 rows; sensitive data redacted |
| Inspect logs | Results truncated |
| Inspect api | Response truncated |
| Staging queue (enqueue) | Enqueue only; no remove/retry via messaging |
| List deployments | Summary of recent only |

---

## 13. Performance Expectations

| Metric | Expected Value | Rationale |
|--------|---------------|-----------|
| **Outbound delivery latency** | ~200-500ms per vendor API call | Fire-and-forget; does not affect notification creation response time |
| **Delivery worker throughput** | ~500 deliveries/day at current scale | 32 users x 20 notifications x 50% email + 30% WhatsApp |
| **Inbound webhook processing** | <500ms per message | Identity resolution query + command parsing + operation dispatch |
| **DB table growth** | ~15K-20K NotificationDelivery rows/month | 1-2 rows per notification at current scale |
| **Memory footprint** | ~5-10MB additional node_modules | Three new npm dependencies; no in-memory caches |
| **Bundle impact (client)** | ~2-5KB gzipped | New notifications tab component; no new npm deps |

---

## 14. Risks and Mitigations

| # | Risk | Type | Impact | Mitigation |
|---|------|------|--------|------------|
| 1 | SendGrid Inbound Parse multipart parsing compatibility | Technical | Inbound emails may fail to parse | Using existing `multer` dependency; fallback to raw body parsing if needed |
| 2 | Twilio `validateRequest()` URL construction edge cases | Technical | Webhook verification may fail with proxied URLs | Using `twilio.webhook()` SDK middleware which handles edge cases |
| 3 | WhatsApp template approval delay | External | Phase 3 launch blocked | Submit templates early; utility templates typically approved in <24h |
| 4 | Meta Business Manager verification delay | External | WhatsApp integration blocked for days | Start verification process during Phase 1 |
| 5 | Email reply parsing complexity | Technical | Quoted text and signatures in replies | Use SendGrid's stripped `text` field; custom parsing as fallback |
| 6 | WhatsApp 24-hour session window | Platform | Free-form replies expire | All outbound uses templates; interactive buttons always work regardless of window |
| 7 | Spam filter risk for automated emails | Delivery | Emails not reaching recipients | SPF/DKIM/DMARC configuration; dedicated sender domain; warm-up sending volume |
| 8 | Vendor service outage | Operational | Temporary delivery failure | Background retry worker (3 attempts); delivery records track status for monitoring |

---

## 15. Deferred Items

| Item | Reason | Recommended Timing |
|------|--------|--------------------|
| SMS as third channel | Same Twilio infra; validate WhatsApp adoption first | After Phase 3 stable |
| Daily digest notifications | Aggregation logic and scheduling needed | After Phase 1 usage data |
| Rich HTML email templates | Start simple; iterate on feedback | After Phase 1 feedback |
| Delivery analytics dashboard | New client UI; delivery infra must stabilize first | After Phase 2 |
| Org-level notification policies | Admin feature; individual preferences first | Post-MVP |
| Per-channel rate limiting | 32 users unlikely to trigger issues | After scaling evidence |
| Multi-org context in messages | Complex UX; default to primary org | Post-MVP |
| SendGrid delivery/bounce webhooks | Status callback for DELIVERED state | After Phase 1 |
| Phone verification flow UI (client) | MVP shows status only; server-triggered verification | Post-Phase 1 |
| Voice/IVR approval | Different tech stack | Separate initiative |

---

## 16. Success Criteria

1. All 4 notification types delivered to opted-in email channels within seconds of creation
2. All 4 notification types delivered to opted-in WhatsApp channels via approved templates
3. Users can reply to email notifications to post comments and approve/reject tickets
4. Users can reply to WhatsApp notifications (interactive buttons or text) to approve/reject
5. Keyword commands (status, deploy, rerun, staging queue, list tickets, create ticket, inspect) execute via both channels
6. @Helix queries via messaging route to the org-level concierge agent with full 39-tool MCP access and return responses in the same channel
7. Inspect results via messaging are truncated and redacted per data sensitivity guards
8. Existing in-app notification path (DB records, polling, toasts) continues unchanged
9. Background delivery worker retries failed deliveries up to 3 times
10. Unrecognized messages receive a help response with available commands
11. New "Notifications" tab in client Settings page with per-channel, per-type toggles
12. Phone number entry with E.164 validation in Notifications tab

---

## Data Sources

This development plan synthesizes findings from:

- **RSH-596 Research Report** — Original architecture design covering vision, technical analysis, schema design, security model, vendor selection, and implementation roadmap
- **Code inspection** of helix-global-server (notification-service.ts, comment-controller.ts, api.ts, server.ts, env.ts, schema.prisma, middleware.ts, app.ts) and helix-global-client (settings.tsx, types/api.ts, notification-sidebar.tsx)
- **Runtime evidence** — Production DB schema verification, active user count (32), log search confirming zero existing messaging integration
- **Vendor documentation** — SendGrid Inbound Parse (multipart/form-data format, stripped text), Twilio webhook validation (`twilio.webhook()` middleware), WhatsApp template message constraints
- **Tech-research validation** — 8 architecture decisions for helix-global-server, 4 for helix-global-client, all evaluated against alternatives with evidence-backed rationale

## Attachments
- (none)
