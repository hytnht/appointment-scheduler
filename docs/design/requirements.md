# Unified Service Scheduler — Requirements

Domain: **Ownership** · Replace manual dealership booking with an Appointment Scheduler.

## Functional (in scope)

1. **Resource-constrained booking** — a user requests a service appointment for a
   specific *vehicle*, *service type*, and *dealership* at a *desired time*.
2. **Real-time availability check** — before confirming, verify that **both** a
   `ServiceBay` **and** a *qualified* `Technician` are free for the **entire**
   service duration.
3. **Confirmed appointment record** — on success, persist an `Appointment`
   associating customer, vehicle, technician, and service bay (immutable core
   facts; status transitions allowed).
4. **Strict booking input validation** — booking `startAt` must be aligned to a
  fixed **15-minute** slot grid and within dealership operating hours; reject
  non-aligned or out-of-window requests.
5. **Duplicate request handling** — repeated requests for the same
  dealership+vehicle+`startAt` must not create a second appointment; return
  conflict.

## Non-functional

| Quality | Target / stance |
|---|---|
| Correctness (the core invariant) | **No technician and no bay is ever double-booked for overlapping time.** Strong, DB-enforced. |
| Concurrency safety | Appointment create + slot reservation happen in one DB transaction (all-or-nothing). |
| Consistency | Read-your-writes minimum; booking commit is strongly consistent (single relational source of truth). |
| Availability | Business-hours critical; single-region + HA primary is enough (see scale). |
| Latency | Availability check + confirm p95 < ~500 ms (interactive booking). |
| Durability | An Appointment must never be silently lost once confirmed. |
| Auditability | Who booked/assigned what, when — Ownership domain needs a trail. |

## Out of scope (named deliberately)

- Frontend / UX.
- **Authentication / authorization** — entirely out of scope (no auth layer designed).
- Payments / invoicing, parts inventory, technician payroll.
- **Notifications / appointment-confirmation to dealership side** — spec names no
  downstream, so no event bus / outbox is designed.
- Route/loaner-car logistics.
- Multi-region active-active, global scale (not justified by the numbers).

## Assumptions

- Bookings are **per-dealership**; a technician and a bay belong to one dealership.
- A `ServiceType` has a known **duration**.
- A `Technician` is directly linked to the `ServiceType`s they can perform;
  qualification = technician is linked to the requested service type.
- One appointment occupies **exactly one** technician and **one** bay for its duration.
- The user cannot pick a specific technician or bay — the system **auto-assigns**
  any qualified technician and any free bay when the appointment is created.
- Time is discretized to a fixed **15-minute** slot grid anchored in UTC (absolute
  anchor, independent from dealership `open_time`).
- Dealership operating hours only filter which aligned starts are allowed; changing
  `open_time`/`close_time` must not re-anchor slot boundaries.
- A service must fit fully within dealership hours.
- Duplicate booking is defined as same dealership+vehicle+`startAt`; it is
  rejected with conflict.
- Time handled in UTC; each dealership has a timezone for display/validation.
