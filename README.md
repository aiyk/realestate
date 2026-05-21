# Realestate

Nigeria-focused real estate marketplace. Platform admin and verified agents upload listings; KYC-verified buyers reserve properties online with a Paystack deposit; agents earn commissions paid via Paystack Transfers; buyers, agents, and admins coordinate through in-app messaging.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · Postgres 16 · Auth.js v5 · Tailwind 4 · Cloudflare R2 · Paystack · Dojah · Resend**.

## Quick start

```bash
# 1. Postgres
docker compose up -d postgres

# 2. Install
pnpm install

# 3. Database
pnpm prisma migrate dev
pnpm db:seed

# 4. Dev server (port 3100 keeps it clear of other locally-running Next apps)
PORT=3100 pnpm dev
```

Seed admin: `admin@realestate.test` / `ChangeMe123!` (see `.env`).

## Environment variables

Copy `.env.example` → `.env` and fill in. Defaults work in dev with empty Paystack/Dojah/R2 keys — flows degrade to **dev simulators** noted below.

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (Docker default points to `localhost:5433`) |
| `AUTH_SECRET` | Auth.js signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App base URL — must match the port you run on |
| `PAYSTACK_*` | Paystack secret + public keys (leave as placeholder → dev simulator activates) |
| `DOJAH_*` | Dojah identity keys (leave empty → dev fallback) |
| `R2_*` | Cloudflare R2 (S3-compatible) for image and selfie storage |
| `RESEND_API_KEY` | Email sender |
| `SEED_ADMIN_*` | Used by `pnpm db:seed` |

## Roles & flows

- **BUYER** (default on signup): browses listings publicly, KYC-verifies, reserves properties, messages agents.
- **AGENT**: applies via multi-step wizard (business → KYC gate → Paystack-resolved bank account), once approved by admin can list properties (admin-moderated), see reservations on their listings, view earnings.
- **ADMIN**: full control — moderates listings, approves agents, processes payouts, manual conversions, oversees all messages, KYC queue.

## Verification flows (end-to-end)

### 1. Public browse, no auth
```
GET /            → homepage with featured listings
GET /listings    → filter by city, type, price, beds
GET /listings/[slug] → detail page with gallery + Reserve CTA
```
The CTA bounces unauthenticated users to `/login?next=…`.

### 2. Admin creates + publishes a listing
1. Sign in as admin.
2. `/admin/listings/new` → fill form (image URL is supported in dev; R2 presigned PUT for prod).
3. Save → `/admin/listings/[id]/edit` → **Publish**.
4. Confirm appearance on `/` and `/listings`.

### 3. Buyer KYC + reservation (with dev simulators)
Requires the placeholder Paystack/Dojah keys (default `.env`).
1. Sign up as a buyer.
2. Verify email (use the link from the Resend send, or manually flip `User.emailVerified` in Postgres for local).
3. `/account/kyc` → BVN **must start with `22222`** to verify in dev.
4. Click Reserve on a listing → `/dev/paystack/[ref]` simulator → **Pay now (simulated)** → return page shows PAID.

### 4. Agent application + agent listing flow
1. As a KYC'd buyer go to `/agent/apply` → wizard.
2. Bank account name matches (in dev, Paystack Resolve Account returns user's name as a match).
3. Submit → admin sees `/admin/agents` → **Approve**.
4. Once role flips, log out/in → `/agent/listings/new` → create → **Submit for review**.
5. Admin moderates at `/admin/listings/[id]/edit` → **Approve**.

### 5. Commission ledger + payout
1. After buyer reserves and pays an **agent listing**, admin (or the listing's agent) hits **Mark converted** on `/admin/reservations` (or `/agent/reservations`).
2. Listing → SOLD, `CommissionLedger` row created with snapshot of percentages.
3. `/agent/earnings` shows the entry as PENDING_PAYOUT.
4. Admin → `/admin/payouts` → **Initiate transfer** → ledger goes PROCESSING.
5. Replay the Paystack `transfer.success` test webhook to flip to PAID.

### 6. In-app messaging
1. Buyer clicks **Message the agent** on a listing detail page → thread created.
2. Agent/Admin sees the thread in their inbox.
3. Live updates via SSE on `/api/messages/stream/[threadId]`; recipients offline for >60 s get an email (debounced 10 min per thread per recipient).

## Dev simulators

The app gracefully degrades to local simulators when external keys are placeholders.

| Provider | Without keys | With keys |
|---|---|---|
| **Paystack** | Reservation redirects to `/dev/paystack/[ref]` with a "Pay now" button that fires a signed-with-`dev-simulator` webhook. Transfer init synthesises a recipient code and a `PAY_…` reference. | Real `transaction/initialize`, `transfer`, `transferrecipient`, and webhook HMAC verification. |
| **Dojah** | `kyc/initiate` accepts BVN starting with `22222` as verified. | Real BVN/NIN lookup with name-match check. |
| **R2** | Image upload step in admin/agent listing form falls back to "paste URL" only. | Presigned PUT to R2 buckets. |
| **Resend** | Emails log a warning and no-op. | Real send. |

This makes the full flow testable without provisioning external accounts.

## Idempotency & safety

- Reservation creation uses a Serializable transaction — two simultaneous buyers cannot both reserve the same listing.
- Paystack `charge.success` and `transfer.success` handlers are idempotent (checked via current ledger/reservation status).
- BVN/NIN are never stored in plaintext (`sha256` hash only). Logger middleware redacts BVN/NIN/email/phone shapes from log lines.
- Audit log written for every CUD on reservations, listings, agents, payouts, and KYC outcomes.

## Useful commands

```bash
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
pnpm test                 # vitest unit tests
pnpm db:studio            # Prisma Studio
pnpm prisma migrate dev   # apply schema changes
```

## Known dev caveats

- Next.js 16 prints a `middleware` → `proxy` deprecation warning; rename in a follow-up.
- Email delivery is mocked in dev (Resend not configured); flows log a warning instead.
- R2 image upload UI is URL-paste in dev. Wire up R2 keys to enable real uploads.
