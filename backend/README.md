# Sneaker Store — Backend

A full-stack sneaker e-commerce backend built with Node.js, Express, Prisma 7, and PostgreSQL (hosted on Supabase). Built as a learning project with an emphasis on understanding every architectural and security decision, not just getting things working.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (Supabase, connected via the session pooler)
- **ORM:** Prisma 7.8.0 (`prisma-client-js` generator, custom output path)
- **Driver Adapter:** `@prisma/adapter-pg` (Prisma 7 removed its built-in connection engine — a driver adapter is now required)
- **Auth:** JWT (`jsonwebtoken`) stored in an `httpOnly` cookie, passwords hashed with `bcrypt`
- **Dev tooling:** `nodemon`

---

## Project Structure

```
backend/
├── controllers/       # Business logic — one file per resource
├── routes/             # Route definitions only (path → controller mapping)
├── middleware/          # verifyToken, requireAdmin
├── lib/
│   └── prisma.js         # Singleton PrismaClient instance (with adapter + SSL config)
├── prisma/
│   ├── schema.prisma      # Data model
│   ├── seed.js             # Seed script — repeatable test data
│   └── migrations/          # Full migration history
├── prisma.config.ts        # Prisma 7: connection URL + migration config (NOT schema.prisma anymore)
├── server.js                # Express app entry point
└── .env                       # DATABASE_URL, JWT_SECRET (never committed)
```

**Why this structure:** Routes only declare "which URL maps to which function." Controllers hold all the actual logic (DB queries, validation, response shaping) so it's reusable and testable independent of Express. Middleware holds cross-cutting checks (auth, role) that apply across many routes without being copy-pasted into each controller.

---

## Database Schema

Six core tables, arrived at through iteration — not the first draft:

```
Sneaker
  └─ SneakerColorway  (color, colorCode — added mid-project, see below)
        ├─ SneakerVariant  (size, price, stock)
        └─ SneakerImage

User
  ├─ Cart → CartItem → SneakerVariant
  └─ Order → OrderItem → SneakerVariant
```

### Key schema decisions

**Why `SneakerColorway` exists as its own table.**
The first schema draft attached `color` directly to `SneakerVariant`, and images directly to `Sneaker`. This broke down once we asked: *does a Black-size-8 and a Black-size-9 need separate photos?* No — but a Black and a White colorway do. Color is the thing that actually determines "which set of photos applies," not size, and not the sneaker as a whole. So color (plus a `colorCode` hex value, for UI swatches) was pulled into its own table sitting between `Sneaker` and both `SneakerVariant` and `SneakerImage`. This is a textbook case of **normalization**: when two different things (variants and images) both need to reference the same concept (a colorway), that concept deserves its own table instead of being duplicated as a loose field on both sides.

**Why `OrderItem.purchasedPrice` exists, but `CartItem` has no price field at all.**
An order is a historical, completed fact — if a sneaker's price changes next month, last month's order total should not silently change with it. So `OrderItem` snapshots `purchasedPrice` at the moment of purchase. A cart, by contrast, isn't a transaction yet — it should always reflect the *current* live price, so it just references `SneakerVariant.discountedPrice` through the relation, with no stored price of its own.

**Why soft deletes, not hard deletes.**
`Sneaker` and `SneakerVariant` both have an `isDeleted` boolean instead of ever being truly removed. Reasoning: `OrderItem.variantId` is a real foreign key pointing at a variant. If an admin removed a sneaker from the catalog with a genuine `DELETE`, every past customer's order history referencing that variant would break (orphaned foreign key, or worse, silently wrong data). Soft-deleting hides the item from public browsing and cart-adding, while leaving all historical order data completely intact.

**Composite unique constraints** are used in two places to make bad states structurally impossible rather than just "checked for":
- `CartItem`: `@@unique([cartId, variantId])` — one cart can never have two separate rows for the same variant
- `SneakerVariant`: `@@unique([colorwayId, size])` — one colorway can never have two rows for the same size

### Order status state machine

```
PENDING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED → RETURN_REQUESTED
   ↓
CANCELLED   (only reachable from PENDING)
```

Enforced in code via a `validTransitions` lookup object — any transition not explicitly listed is rejected with `400`, regardless of who's asking. Separately, *which* transitions a given requester is allowed to attempt is gated by role: regular users are restricted to `CANCELLED`/`RETURN_REQUESTED` on their own orders; admins can drive the full lifecycle on any order, but are still bound by the same state machine (no skipping steps).

---

## Auth Architecture

- **Registration:** validates input → hashes password with `bcrypt` (cost factor 10) → creates user → immediately issues a JWT (auto-login on register, via a shared `sendTokenResponse` helper also used by login)
- **Duplicate email protection is two-layered:** a `findUnique` pre-check for fast, friendly UX, *and* a `try/catch` on Prisma's `P2002` (unique constraint violation) error code as the real, race-condition-proof guarantee. The pre-check alone isn't sufficient — two near-simultaneous registrations could both pass it before either write completes; only the database's own `@unique` constraint is atomic.
- **JWT payload:** `{ userId, role }`, signed with a secret from `.env`, stored in an `httpOnly`, `sameSite: 'lax'` cookie, `secure` only in production (since local dev runs on plain HTTP).
- **Why JWT over sessions:** no server-side lookup needed on every request — the token carries its own signed data. Tradeoff: no server-side "kill switch" for an individual token (logout only clears the browser's copy; a stolen token remains valid until natural expiry).
- **Login/register error messages are deliberately identical** for "no such account" and "wrong password" — distinguishing them would let an attacker enumerate valid accounts by trial and error.

### Middleware chain

```
verifyToken  → reads JWT from cookie, verifies signature, attaches req.user
requireAdmin → runs AFTER verifyToken, checks req.user.role === 'ADMIN'
```

`401` = not authenticated at all. `403` = authenticated, but not allowed to do this specific thing. `404` = used deliberately (instead of `403`) for ownership mismatches on user-owned resources (orders, cart items), so a logged-in user can't distinguish "this doesn't exist" from "this exists but isn't yours."

---

## Checkout — Transactions

Checkout has to do four things as one atomic unit: verify stock, create the `Order` + `OrderItem`s, decrement stock on each purchased variant, and clear the cart. If a crash happened between "order created" and "stock decremented," you could end up selling the same physical last pair to two different customers.

Solved with `prisma.$transaction(async (tx) => { ... })` — if *any* step inside throws, everything already done inside that block is rolled back automatically. Verified manually: simulated an over-stock checkout mid-transaction and confirmed via Prisma Studio that no `Order` row, no `OrderItem` rows, and no stock changes persisted.

---

## API Routes

### Public
| Method | Path | Notes |
|---|---|---|
| GET | `/api/sneakers` | List, excludes soft-deleted |
| GET | `/api/sneakers/:id` | Single sneaker + nested colorways/variants/images |
| POST | `/api/register` | Auto-login on success |
| POST | `/api/login` | |
| POST | `/api/logout` | Clears cookie only — no server-side session to invalidate |

### Protected (logged-in user)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/me` | Requires `verifyToken` |
| GET | `/api/cart` | Get-or-create via `upsert` |
| POST | `/api/cart/items` | Duplicate-safe (merges quantity), stock-checked |
| PATCH | `/api/cart/items/:id` | Delta-based quantity change; auto-deletes at 0 |
| DELETE | `/api/cart/items/:id` | |
| POST | `/api/orders/checkout` | Transactional — see above |
| GET | `/api/orders` | Own orders only |
| GET | `/api/orders/:id` | Ownership-scoped, 404 on mismatch |
| PATCH | `/api/orders/:id` | Cancel/return (user) or full progression (admin) |

### Admin only (`verifyToken` + `requireAdmin`)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/sneakers` | Multi-colorway nested creation in one call |
| POST | `/api/sneakers/:id/variants` | Add variant(s) to an existing colorway; partial-success on duplicate sizes |
| PUT | `/api/sneakers/:id` | Update name/description/brand/mrp |
| PATCH | `/api/sneakers/variants/:variantId` | Stock update |
| DELETE | `/api/sneakers/:id` | Soft delete |
| DELETE | `/api/sneakers/variants/:variantId` | Soft delete |

**Route ordering note:** literal/specific paths must be defined before dynamic (`:param`) routes *only* when their segment shapes could actually collide (e.g. `/checkout` vs `/:id`, both one segment). Routes with different segment counts (`/variants/:id` vs `/:id`) or different HTTP methods never collide regardless of order.

---

## Prisma 7 Gotchas (things that cost real debugging time)

Worth keeping for future projects, since these aren't well-covered in older tutorials yet:

1. **`prisma init`'s default template no longer includes `url = env("DATABASE_URL")`** in the datasource block, and nudges toward Prisma's own hosted Postgres. If you're using an external provider (Supabase, Neon, etc.), you must know this and configure the connection deliberately.
2. **The connection URL moved out of `schema.prisma` entirely** — it now lives in `prisma.config.ts` (for the CLI/migrations) and must be passed explicitly to the driver adapter in code (for the running app).
3. **Prisma 7 removed the built-in connection engine.** `new PrismaClient()` with no arguments now throws. You must construct a driver adapter (`@prisma/adapter-pg` for Postgres) and pass it in: `new PrismaClient({ adapter })`.
4. **The `provider = "prisma-client"` generator emits TypeScript source files by default**, which plain `require()` cannot load in a non-TypeScript project. Use `provider = "prisma-client-js"` instead for a CommonJS/JS project.
5. **Supabase's direct connection host is IPv6-only**, which fails silently (`P1001`) on networks without IPv6 support. Use the **session pooler** connection string instead (IPv4-compatible).
6. **Supabase's SSL certificate chain trips Node's default strict verification** (`self-signed certificate in certificate chain`). Fix: pass `ssl: { rejectUnauthorized: false }` to the adapter — but do **not** also put `sslmode=require` in the connection string URL, since that forces strict verification and overrides the adapter's setting, causing the two to conflict.
7. **`lib/prisma.js` must load `dotenv` itself**, not rely on `server.js` having done it first — any standalone script (like a seed file) that imports the Prisma client directly, without going through `server.js`, will otherwise get `undefined` for `DATABASE_URL`.

---

## Local Setup

```bash
cd backend
npm install
```

Create `.env`:
```
DATABASE_URL="your-supabase-session-pooler-connection-string"
JWT_SECRET="a-long-random-string"
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run migrations:
```bash
npx prisma migrate dev
```

Seed test data:
```bash
node prisma/seed.js
```

Start the dev server:
```bash
npm run dev
```

Browse the database visually:
```bash
npx prisma studio
```

---

## Roadmap

- [ ] Frontend — React + Vite
- [ ] Cart-sync-on-login (merge guest cart into account cart)
- [ ] Real payment integration (currently mocked — order creation happens without a payment step)
- [ ] Second project: Multi-Vendor Local Business Platform (MERN) — planning phase, open question on whether `Vendor` should be a separate collection referencing `User` or embedded directly on `User`

---

## Learning Notes

This project was built with a deliberate "understand before implement" approach — every route was designed and reasoned through before code was written, and most controllers were attempted independently first, then corrected. Recurring bug patterns worth remembering for next time:

- Route param name mismatches (`:variantId` in the route vs `req.params.id` in the controller) — always match exactly.
- Forgetting `await` on a Prisma call doesn't crash immediately — it silently produces a Promise object instead of real data, causing confusing failures downstream.
- `in` checks object keys/array indexes; `.includes()` checks array values. Easy to confuse, very different results.
- Object literals use `:` to associate key-value pairs, never `=`.
- Always check `!thing` before accessing `thing.nestedProperty` — never the other way around.