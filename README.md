# School Admission System — Backend API

A concurrency-safe, first-come-first-served school admission seat reservation system built with **ASP.NET Core 8**, **Entity Framework Core**, and **PostgreSQL**.

---

## Technology Stack

| Component | Technology |
|---|---|
| Runtime | .NET 8 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL 13+ |
| Testing | xUnit + `Microsoft.AspNetCore.Mvc.Testing` |
| Containerisation | Docker + Docker Compose |

---

## Quick Start

### Local Development (without Docker)

**Prerequisites**: .NET 8 SDK, PostgreSQL running locally.

1. Copy the settings template:
   ```bash
   cp backend/appsettings.Development.json.example backend/appsettings.Development.json
   ```
2. Edit the connection string in `appsettings.Development.json` with your PostgreSQL credentials.

3. Run the API:
   ```bash
   cd backend
   dotnet run
   ```
   The API starts on `http://localhost:5076` (or the port shown in the console).

---

### Docker Compose (recommended)

```bash
# Build and start both PostgreSQL and the API
docker compose up --build

# Start without rebuilding
docker compose up

# Stop (preserves PostgreSQL data volume)
docker compose down

# Stop AND wipe data (use with caution)
docker compose down -v
```

The API will be available at **http://localhost:8080**.

> **Data persistence**: PostgreSQL data is stored in a named Docker volume (`pgdata`). Running `docker compose down` (without `-v`) followed by `docker compose up` will retain all data.

---

## Configuration

| Key | Environment Variable | Default | Description |
|---|---|---|---|
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings__DefaultConnection` | — | PostgreSQL connection string |
| `AdmissionSettings:HoldDurationSeconds` | `AdmissionSettings__HoldDurationSeconds` | `600` | Duration in seconds a seat hold remains valid |

---

## API Reference

All endpoints return JSON. All `X-Student-Id` headers must contain **exactly 17 numeric digits**.

### Base URL
- Local: `http://localhost:5076`
- Docker: `http://localhost:8080`

---

### Phase 2: Class Management

#### `POST /classes` — Create a class

```http
POST /classes
Content-Type: application/json

{ "name": "Class 6 - Morning Shift", "totalSeats": 120 }
```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "name": "Class 6 - Morning Shift",
  "totalSeats": 120,
  "heldSeats": 0,
  "confirmedSeats": 0,
  "availableSeats": 120,
  "createdAt": "2026-11-11T01:00:00Z",
  "updatedAt": "2026-11-11T01:00:00Z"
}
```

| Status | Meaning |
|---|---|
| 201 | Class created |
| 400 | Invalid name or zero/negative seats |

---

#### `GET /classes` — List all classes

```http
GET /classes
```

**Response 200 OK:** Array of class objects with real-time seat counts.

---

#### `GET /classes/{classId}` — Get class by ID

```http
GET /classes/{classId}
```

| Status | Meaning |
|---|---|
| 200 | Class returned |
| 404 | Class not found |

---

### Phase 3: Admission Hold

#### `POST /classes/{classId}/holds` — Create a seat hold (Endpoint A)

```http
POST /classes/{classId}/holds
X-Student-Id: 20152691234567890
Content-Type: application/json

{}
```

**Response 201 Created:**
```json
{
  "holdId": "uuid",
  "classId": "uuid",
  "studentId": "20152691234567890",
  "status": "HELD",
  "expiresAt": "2026-11-11T01:10:00Z"
}
```

| Status | Meaning |
|---|---|
| 201 | Hold created |
| 400 | Missing or invalid `X-Student-Id` |
| 404 | Class not found |
| 409 | No seats available, or student already has an active application |

---

#### `GET /holds/{holdId}` — Get hold details (Endpoint B)

```http
GET /holds/{holdId}
```

If the hold has passed `expiresAt` and is still `HELD`, its status is automatically updated to `EXPIRED` before returning.

**Response 200 OK:**
```json
{
  "holdId": "uuid",
  "classId": "uuid",
  "studentId": "20152691234567890",
  "status": "HELD",
  "expiresAt": "2026-11-11T01:10:00Z"
}
```

| Status | Meaning |
|---|---|
| 200 | Hold returned |
| 404 | Hold not found |

---

### Phase 4: Hold Lifecycle

#### `POST /holds/{holdId}/confirm` — Confirm a hold

```http
POST /holds/{holdId}/confirm
X-Student-Id: 20152691234567890
```

Converts a `HELD` application into a permanent `CONFIRMED` admission. **Idempotent** — confirming an already-confirmed hold belonging to the same student returns 200 again.

**Response 200 OK:**
```json
{
  "holdId": "uuid",
  "status": "CONFIRMED"
}
```

| Status | Meaning |
|---|---|
| 200 | Confirmed (or idempotently already confirmed) |
| 400 | Missing or invalid `X-Student-Id` |
| 404 | Hold not found, or hold belongs to a different student |
| 409 | Hold is expired, cancelled, or otherwise cannot be confirmed |

---

#### `DELETE /holds/{holdId}` — Cancel a hold

```http
DELETE /holds/{holdId}
X-Student-Id: 20152691234567890
```

Changes a `HELD` application to `CANCELLED` and immediately releases the seat. The hold record is preserved. **Idempotent** — cancelling an already-cancelled hold returns 204.

**Response: 204 No Content**

| Status | Meaning |
|---|---|
| 204 | Cancelled (or idempotently already cancelled) |
| 400 | Missing or invalid `X-Student-Id` |
| 404 | Hold not found, or hold belongs to a different student |
| 409 | Hold is `CONFIRMED` — confirmed admissions cannot be cancelled |

---

#### `GET /me/holds` — Get my applications

```http
GET /me/holds
X-Student-Id: 20152691234567890
```

Returns all admission applications belonging to the requesting student, including class names. Any stale `HELD` records are automatically transitioned to `EXPIRED` before the response is returned.

**Response 200 OK:**
```json
[
  {
    "holdId": "uuid",
    "classId": "uuid",
    "className": "Class 6 - Morning Shift",
    "studentId": "20152691234567890",
    "status": "HELD",
    "expiresAt": "2026-11-11T01:10:00Z"
  }
]
```

Returns `[]` if the student has no application history.

| Status | Meaning |
|---|---|
| 200 | List returned (may be empty) |
| 400 | Missing or invalid `X-Student-Id` |

---

## Seat Count Calculations

Seat counts are **never stored as counters** — they are computed dynamically from hold records:

```
heldSeats      = COUNT of HELD records where ExpiresAt > now
confirmedSeats = COUNT of CONFIRMED records
availableSeats = totalSeats - heldSeats - confirmedSeats
```

---

## Hold Lifecycle State Machine

```
HELD ──(confirm before expiry)──► CONFIRMED
HELD ──(cancel)─────────────────► CANCELLED
HELD ──(ExpiresAt <= now)────────► EXPIRED
```

Expiration is detected **lazily** at the point an endpoint accesses a hold, rather than via a background timer. See `ASSUMPTIONS.md` for the rationale.

---

## Running the Tests

All tests are real PostgreSQL integration tests. The test runner uses `WebApplicationFactory<Program>` and connects to your local PostgreSQL instance using the credentials in `appsettings.Development.json`.

```bash
dotnet test tests/SchoolAdmissionAPI.Tests/SchoolAdmissionAPI.Tests.csproj
```

Expected output:

```
Passed! - Failed: 0, Passed: 58, Skipped: 0, Total: 58
```

---

## Project Structure

```
backend/
├── Configuration/      AdmissionSettings.cs
├── Controllers/        AdmissionHoldsController.cs, ClassesController.cs
├── Data/               ApplicationDbContext.cs, Migrations/
├── DTOs/               Request and response data-transfer objects
├── Exceptions/         NotFoundException.cs, ConflictException.cs
├── Middleware/         GlobalExceptionMiddleware.cs
├── Models/             AdmissionClass.cs, AdmissionHold.cs, AdmissionHoldStatus.cs
├── Services/           AdmissionHoldService.cs, ClassService.cs
│   └── Interfaces/     IAdmissionHoldService.cs, IClassService.cs
├── Dockerfile
└── Program.cs

tests/
└── SchoolAdmissionAPI.Tests/
    ├── ClassesApiIntegrationTests.cs       (Phase 2 — 9 tests)
    ├── AdmissionHoldsApiIntegrationTests.cs (Phase 3 — 18 tests)
    └── HoldLifecycleIntegrationTests.cs    (Phase 4 — 31 tests)

docker-compose.yml
README.md
ASSUMPTIONS.md
DATABASE.md
```
