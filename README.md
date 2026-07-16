# Service Scheduler

## Overview

REST API for scheduling vehicle-service appointments at dealerships.

App runs at `http://localhost:4001`.

Swagger UI: `http://localhost:4001/api-docs`

To change expose port,  override `PORT` in `.env`. 
## Option A — Fully dockerized (app + DB)

### Build & Run

```bash
cp .env.docker.example .env
docker compose up -d
```
 
To seed reference data on first boot, set `SEED=true` in `.env`.

## Option B — Local app + Docker DB only
#### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22  |
| Yarn | 1.x |
| Docker + Docker Compose | any recent version |

### Build
Start only the database containers:

```bash
cp .env.example .env
docker compose up mysql-primary mysql-replica
```

Then build the app:

```bash
yarn 
yarn build
```

Seed manually if needed:

```bash
yarn seed
```
### Run
```bash
yarn dev # watch mode
# or
yarn start
```
### Test

Unit tests (no DB required):

```bash
yarn test
```

E2E tests (requires running DB):

```bash
yarn test:e2e
```

Lint:

```bash
yarn lint
```

## AI Collaboration Narrative

I used GitHub Copilot as a pair programmer throughout, but kept it on a tight leash.

### Strategy 
Started by reviewing the requirements and writing a brief design documents myself, then brainstormed the approach with AI before writing any code. Once the design was stable, I switched to plan mode to break work into tasks in `TASKS.md`. I reviewed and rewrote those tasks, adjusting algorithms if the first pass was wrong. AI was required to confirm after each task was done before moving to the next; for tasks that couldn't be parallelized, nothing started until the prior task was marked reviewed.

### Verification
 Self-review first: read every generated file, check types compile, check the logic matches the specification. Then code review via CodeRabbit integrated with GitHub to catch other missing bugs. Design docs and `TASKS.md` were updated whenever a review surfaced a gap. Small or low-to-medium fixes I applied directly; for anything larger I re-prompted the AI with the specific finding. 

**QA.** Each task's verify step ran in watch mode, then unit tests and `yarn lint`. On top of automated tests, I also manually tested the booking flow end-to-end via Swagger/Postman. The contention unit test was written before the implementation to pin down expected rollback-and-retry behaviour.
