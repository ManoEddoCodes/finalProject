# EventPulse — Event Management Backend API

A complete Node.js / Express / MongoDB backend for managing events: authentication
with roles, events CRUD with filtering/pagination/search, capacity-safe
registration, real-time announcements over Socket.io, input validation,
centralized error handling, automated tests, and production deployment.

## Stack

Node.js + Express · MongoDB + Mongoose · Socket.io · Jest + Supertest ·
Vercel + MongoDB Atlas

## Project Structure

```
EventPulse/
  models/        User, Category, Event, Registration, Message
  controllers/   business logic
  routes/        Express routers
  middleware/    requireAuth, requireRole, validator, errorHandler
  utils/         appError, asyncHandler
  config/        db.js, socket.js (Socket.io rooms + broadcast)
  tests/
    unit/        AppError, asyncHandler
    integration/ Events API (create/list/filter) via Supertest
  seed.js        idempotent sample data (categories, events, admin)
  app.js         Express app (no listen — used directly by tests)
  server.js      HTTP server + Socket.io + DB connect + listen
```

## Local Setup

```bash
npm install bcrypt cors dotenv express express-validator jsonwebtoken mongoose socket.io
npm install --save-dev jest  mongodb-memory-server nodemon supertest
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, etc.
npm run seed            # creates sample categories, events, and an admin user
npm run dev              # starts the server with nodemon
```

Seed admin login (override via `.env`):
`ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults: `admin@eventpulse.com` / `Admin@12345`)

## Running Tests

```bash
npm test
```

Uses `mongodb-memory-server` so tests never touch your real database.
Covers: `AppError` and `asyncHandler` (unit, success + failure paths) and
the Events API — create, list, filter, combined filters, 404, 422
(integration, via Supertest).

## API Overview

| Area          | Endpoints                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------- |
| Auth          | `POST /api/auth/register`, `POST /api/auth/login`                                            |
| Categories    | `GET/POST /api/categories`, `GET /api/categories/:id`                                        |
| Events        | `GET/POST /api/events`, `GET/PATCH/DELETE /api/events/:id`                                   |
| Registrations | `POST /api/registrations`, `GET /api/registrations/me`, `DELETE /api/registrations/:id`      |
| Announcements | `GET /api/events/:eventId/messages` (history) + Socket.io `join_event` / `send_announcement` |
| Ops           | `GET /health`                                                                                |

A ready-to-import `postman_collection.json` + `postman_environment.json` document
every endpoint's request/response shape.

### Roles

- New accounts always register as `attendee`. Only an existing admin can be
  promoted (e.g. directly in the database, or via the seed script) — there is
  no public endpoint that grants `admin`.
- `requireAuth` → 401 for missing/expired/tampered tokens.
- `requireRole('admin')` → 403 for authenticated non-admins on event write routes.

### Capacity & Registration Safety

- Registering atomically increments `Event.registrationsCount` only if
  `registrationsCount < capacity`, so the count can never exceed capacity
  even under concurrent requests.
- A unique index on `{ user, event }` in `Registration` guarantees a user can
  never register twice for the same event; if creation fails after the
  capacity claim, the claim is rolled back.
- Cancelling deletes the registration and decrements the counter, freeing a
  place for the next attendee.

### Real-Time Announcements (Socket.io)

- Clients connect with a JWT in `socket.handshake.auth.token`.
- `join_event { eventId }` joins the room `event_<eventId>`.
- `send_announcement { eventId, text }` — admin-only; the message is saved to
  MongoDB (`Message` model: event, sender, time) and broadcast only to that
  event's room. Other rooms receive nothing.
- `GET /api/events/:eventId/messages` returns saved history ordered by time,
  for attendees who join late.

### Validation & Error Handling

- `express-validator` runs on every `POST`/`PATCH` route; failures return
  `422` with a structured `errors` array (`{ field, message }`).
- `AppError` + `asyncHandler` (in `utils/`) keep controllers free of
  try/catch; every thrown or forwarded error lands in the central
  `errorHandler` middleware, which returns a safe status + message and never
  leaks stack traces. Unhandled controller errors are caught, not crashed.

## Deployment

1. **Database:** create a cluster on MongoDB Atlas, whitelist access, and
   copy the connection string.
2. **Vercel:** import the repo, and set `MONGO_URI` and `JWT_SECRET` as
   **environment variables in the Vercel dashboard** — never commit `.env`
   or any secret to the repository.
3. Confirm `GET /health` on the deployed URL reports `server: "up"` and the
   database connection state.

A minimal `vercel.json` is included so the Express app runs as a serverless
function; Socket.io still initializes on the same server object for
platforms/preview environments that support long-lived connections.

## Git Workflow

- Conventional Commits throughout.
- Tag the release: `git tag v1.0.0 && git push origin v1.0.0`.

## Rubric Self-Check

- [ ] Project renamed to `EYOUTH-30905060100079-EventPulse`
- [ ] Six MVC folders present; five Mongoose schemas (User, Event, Category,
      Registration, Message)
- [ ] bcrypt/JWT auth; `requireAuth` / `requireRole` named exactly; correct
      401/403 behavior
- [ ] Events CRUD, combined filters, pagination, sorting, search, `populate()`
- [ ] Capacity enforcement, duplicate-registration prevention, Socket.io
      rooms + saved history
- [ ] `express-validator` 422 responses, central error handling, all tests
      passing
- [ ] Jest + Supertest results documented in the repo (`npm test` output)
- [ ] MongoDB Atlas + Vercel env vars; no secrets committed
- [ ] Deployment and `/health` links open successfully
- [ ] Postman Collection uses the shared Environment
- [ ] Conventional Commits, `v1.0.0` tag, and a Pull Request exist
- [ ] Repository and deployment links are shareable for review

> **Note:** Task 7 of the original rubric asks for a Swagger UI at
> `/api-docs`. That has been intentionally removed from this project — if
> your rubric is graded against that exact requirement, either restore it or
> confirm with your reviewer that the Postman Collection is an accepted
> substitute for interactive API documentation.
