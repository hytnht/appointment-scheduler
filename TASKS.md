# Appointment Scheduler — Implementation Tasks

Stack: NestJS 11 + TypeORM + MySQL 8. yarn. Each task atomic, stop for review before next.

## Status legend

- `[ ]` not started
- `[>]` in progress
- `[x]` done — awaiting review
- `[✓]` reviewed & confirmed

---

## Task 1 — Deps + bootstrap config

`[ ]`

- `yarn add @nestjs/typeorm typeorm mysql2 @nestjs/config class-validator class-transformer @nestjs/swagger`
- `src/config/database.config.ts` — TypeORM options from env (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_SYNCHRONIZE`)
- `.env.example` with all required vars + `PORT`
- `src/app.module.ts` — `ConfigModule.forRoot({ isGlobal: true })` + `TypeOrmModule.forRootAsync()`
- `src/main.ts` — `ValidationPipe({ whitelist: true, transform: true })`, `setGlobalPrefix('api')`, `SwaggerModule.setup()`

**Verify:** `yarn build` passes (no DB required at build time)

---

## Task 2 — Common infrastructure

`[ ]` _(depends on: Task 1)_

- `src/common/filters/http-exception.filter.ts` — catches `HttpException`; catches `ER_DUP_ENTRY` → 409; `{ statusCode, message, error }` body
- `src/common/interceptors/logging.interceptor.ts` — `AsyncLocalStorage` correlation-id, logs `{ correlationId, method, url, statusCode, durationMs }`
- Register both globally in `main.ts`

**Verify:** `yarn build`; unit test filter maps `ER_DUP_ENTRY` → 409 response shape

---

## Task 3 — Dealership module

`[ ]` _(depends on: Task 1)_

- `src/dealership/dealership.entity.ts` — `id, name, timezone, open_time (TIME), close_time (TIME), created_at, updated_at`
- DTOs: `create-dealership.dto.ts`, `update-dealership.dto.ts` (PartialType)
- `src/dealership/dealership.service.ts` — `findAll`, `findOne`, `create`, `update`
- `src/dealership/dealership.controller.ts` — `GET /dealerships`, `POST /dealerships`, `GET /dealerships/:id`, `PATCH /dealerships/:id`
- `src/dealership/dealership.module.ts` + register in `AppModule`

**Verify:** `yarn build`; unit tests for service; `GET /api/dealerships` → `[]`

---

## Task 4 — Customer module

`[ ]` _(depends on: Task 1; parallel-safe with 3, 6)_

- `src/customer/customer.entity.ts` — `id, name, email (UNIQUE), phone, created_at, updated_at`
- DTOs, service (`findAll`, `findOne`, `create`, `update`), controller (CRUD), module
- Register in `AppModule`

**Verify:** `yarn build`; unit tests; `GET /api/customers` → `[]`

---

## Task 5 — Vehicle module

`[ ]` _(depends on: Task 4 — customer FK)_

- `src/vehicle/vehicle.entity.ts` — `id, customer_id FK→customer.id, vin (UNIQUE), make, model, year (int), created_at, updated_at`
- DTOs, service, controller, module; register in `AppModule`

**Verify:** `yarn build`; unit tests; `GET /api/vehicles` → `[]`

---

## Task 6 — ServiceType module

`[ ]` _(depends on: Task 1; parallel-safe with 3, 4)_

- `src/service-type/service-type.entity.ts` — `id, code (UNIQUE), name, duration_minutes (int), created_at, updated_at`
- DTOs, service, controller, module; register in `AppModule`

**Verify:** `yarn build`; unit tests; `GET /api/service-types` → `[]`

---

## Task 7 — ServiceBay module

`[ ]` _(depends on: Task 3 — dealership FK)_

- `src/service-bay/service-bay.entity.ts` — `id, dealership_id FK→dealership.id, name, active (boolean, default true), created_at, updated_at`
- DTOs, service, controller (`GET/POST /service-bays`, `GET/PATCH /service-bays/:id`), module; register in `AppModule`

**Verify:** `yarn build`; unit tests; `GET /api/service-bays` → `[]`

---

## Task 8 — Technician module

`[ ]` _(depends on: Tasks 3, 6 — dealership FK + service-type FK for junction)_

- `src/technician/technician.entity.ts` — `id, dealership_id FK, name, active (boolean, default true), created_at, updated_at`
- `src/technician/technician-service-type.entity.ts` — composite PK `(technician_id, service_type_id)`
- DTOs for technician; `QualificationDto { serviceTypeId }`
- Service: `findAll`, `findOne`, `create`, `update`, `addQualification`, `removeQualification`
- Controller: CRUD + `POST /technicians/:id/qualifications`, `DELETE /technicians/:id/qualifications/:serviceTypeId`
- Module; register in `AppModule`

**Verify:** `yarn build`; unit tests incl. qualification add/remove; `GET /api/technicians` → `[]`

---

## Task 9 — Appointment entities + slot math

`[ ]` _(depends on: Tasks 3–8 — all FKs needed)_

- `src/appointment/slot.util.ts` — pure functions:
  - `computeSlots(startAt: Date, durationMinutes: number, slotSize?: number): Date[]`
  - `roundUpToSlotGrid(minutes: number, slotSize: number): number`
- `src/appointment/appointment.entity.ts` — all fields; `status ENUM('CONFIRMED','CANCELLED','COMPLETED','NO_SHOW')`; `idempotency_key VARCHAR(64) UNIQUE NULL`
- `src/appointment/resource-reservation.entity.ts` — `resource_type ENUM('TECH','BAY'), resource_id BIGINT, slot_start DATETIME, appointment_id FK`; composite PK `(resource_type, resource_id, slot_start)`
- `src/appointment/appointment.module.ts` — `TypeOrmModule.forFeature([Appointment, ResourceReservation])`; register in `AppModule`

**Verify:** `yarn build`; unit tests: normal slots, grid rounding, 1-slot service, boundary at close time

---

## Task 10 — Availability query

`[ ]` _(depends on: Task 9)_

- `src/appointment/dto/get-availability.dto.ts` — `{ serviceTypeId: string, date: string }` (query params)
- `AppointmentService.getAvailability(dealershipId, serviceTypeId, date)`:
  1. Load dealership open/close + timezone; load service-type duration
  2. Build all slot windows within business hours
  3. For each window: ≥1 qualified active tech AND ≥1 active bay both free every slot → include start time
  4. Return `{ availableStartTimes: string[] }` (ISO UTC)
- `AppointmentController` — `GET /dealerships/:id/availability?serviceTypeId=&date=`

**Verify:** `yarn build`; unit tests: all-free → times returned; fully-booked → empty list; partial-tech overlap → excluded; partial-bay overlap → excluded

---

## Task 11 — Booking transaction

`[ ]` _(depends on: Task 10)_

- `src/appointment/dto/create-appointment.dto.ts` — `{ dealershipId, vehicleId, serviceTypeId, startAt }`; `@IsISO8601()` on `startAt`
- `AppointmentService.createAppointment(dto, idempotencyKey?)`:
  1. Idempotency check — return existing if key found
  2. Compute slots; validate within dealership hours → 422 if not
  3. Verify ≥1 qualified tech at dealership → 422 if none
  4. `queryRunner BEGIN`
  5. Candidate loop (**hotspot-safe assignment**):
     - Build top-K qualified active technicians by load, randomize order
     - Build top-K active free bays by load, randomize order
     - Pair candidates and lock chosen rows with `FOR UPDATE SKIP LOCKED`
     - `INSERT appointment` (status CONFIRMED)
     - `INSERT resource_reservation` for each slot (TECH + BAY rows)
     - `ER_DUP_ENTRY` → rollback to savepoint, next candidate
  6. All exhausted → `ROLLBACK`; fetch fresh alternatives → throw `ConflictException({ alternatives })`
  7. `COMMIT`; return appointment with full relations
- `POST /appointments` + `Idempotency-Key` header

**Verify:** `yarn build`; unit tests: success path; idempotency return; dup-entry → retry next; all-exhausted → 409 + alternatives; outside-hours → 422; contention case does not always choose same first technician under concurrent requests

---

## Task 12 — Cancel, reschedule, fetch

`[ ]` _(depends on: Task 11)_

- `src/appointment/dto/patch-appointment.dto.ts` — `{ action: 'cancel' | 'reschedule', startAt?: string }`
- `AppointmentService.cancelAppointment(id)` — txn: `status = CANCELLED`, delete reservations
- `AppointmentService.rescheduleAppointment(id, newStartAt)` — txn: delete old reservations, re-run booking attempt at new time
- `AppointmentController`:
  - `GET /appointments/:id` — fetch with all relations
  - `PATCH /appointments/:id` — route to cancel or reschedule

**Verify:** `yarn build`; unit tests: cancel clears reservations; reschedule retry-on-dup; reschedule outside-hours → 422; GET returns relations

---

## Decisions (locked)

- yarn (not npm)
- TypeORM `queryRunner` for atomic booking txn
- `DB_SYNCHRONIZE=true` in dev; prod uses migrations (out of scope)
- No auth — explicitly out of scope
- Slot size: 30 min constant in `slot.util.ts`
- `Idempotency-Key` HTTP header → `UNIQUE` column on `appointment`
- PATCH body: `{ action: 'cancel' | 'reschedule', startAt?: string }`
- Out of scope: notifications, payments, frontend, auth, multi-region
