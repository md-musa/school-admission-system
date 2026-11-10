# School Admission System — Assumptions & Design Decisions

This document records business decisions and design assumptions made during development.

---

## 1. Confirmed applications cannot be cancelled via `DELETE /holds/{holdId}`

### Decision
A `CONFIRMED` admission cannot be cancelled through the `DELETE /holds/{holdId}` endpoint. Attempting to do so returns **HTTP 409 Conflict**.

### Rationale
Confirming an admission is a significant, deliberate commitment that creates a binding record of the student's admission. Once confirmed:

- The school administration relies on confirmed records for class roster planning, roll numbers, and fee collection.
- Allowing casual cancellation through the same API endpoint used for temporary holds would create data integrity risks and open avenues for abuse (e.g., holding and releasing seats to block others).
- Confirmed admissions in a real institution require formal procedures — submission of documents, payment, and approval from administrative staff. These are out-of-scope for the current API phase.

If confirmed admission reversal is required in the future, it should be implemented as a **dedicated administrative endpoint** with appropriate access controls and audit logging, not through the same mechanism used for hold cancellation.

---

## 2. Expiration is handled lazily (on-demand), not by a background worker

### Decision
Hold expiration is not processed by a background job or scheduled timer in Phase 3 or Phase 4. Instead, a hold's status is updated from `HELD` to `EXPIRED` at the point where an API request reads or acts on it.

### How it is processed
Expiration checks occur in the following situations:

| Endpoint | Expiration Behaviour |
|---|---|
| `POST /classes/{classId}/holds` | Expires stale HELD records for the requested class and for the requesting student before seat calculation |
| `GET /holds/{holdId}` | Transitions a single hold to EXPIRED if `ExpiresAt <= now` |
| `POST /holds/{holdId}/confirm` | Detects expiry under the row lock; sets status to EXPIRED and rejects confirmation |
| `DELETE /holds/{holdId}` | Treats an expired HELD record as EXPIRED during cancellation |
| `GET /me/holds` | Expires all stale HELD records for the student before returning the list |

### Why this approach is correct for concurrency
Seat counts never depend on the status field being up-to-date in the database. The seat count query uses `ExpiresAt > NOW()` as the live truth:

```sql
heldSeats = COUNT(*) WHERE Status = 'HELD' AND ExpiresAt > NOW()
```

This means an expired hold that still has status `HELD` in the database **does not occupy a seat** in availability calculations. Lazy status updates are therefore a UI concern (showing the student the correct status), not a correctness concern for seat capacity.

A Phase 5 background expiration worker (`IHostedService`) is recommended for keeping status fields clean without requiring user activity.

---

## 3. Hold ownership is hidden — 404 is returned instead of 403 for mismatched ownership

### Decision
When a student tries to confirm or cancel a hold that belongs to a different student, the API returns **HTTP 404 Not Found** rather than **403 Forbidden**.

### Rationale
Returning 403 would confirm that the hold ID exists in the system, which leaks information about other students' applications. Returning 404 is consistent with the security principle of not revealing the existence of resources the requesting party has no ownership over.

---

## 4. Idempotency of cancellation for already-cancelled holds

### Decision
Cancelling an already-`CANCELLED` hold returns **HTTP 204 No Content** (success) rather than 409 Conflict.

### Rationale
Idempotent DELETE semantics are standard REST practice. If a client sends the same cancel request twice (e.g., due to a network retry), the second request should not fail. The end state (hold is cancelled) is already achieved.

---

## 5. Idempotency of confirmation for already-confirmed holds

### Decision
Confirming an already-`CONFIRMED` hold (by the same student) returns **HTTP 200 OK** rather than 409 Conflict.

### Rationale
Idempotent POST semantics for confirmation prevent spurious errors on network retries. The seat is counted only once regardless of how many times confirmation is called — the confirmed seat count is calculated from the number of CONFIRMED records, not from the number of confirmation API calls.

---

## 6. StudentId is never stored as a numeric type

### Decision
`StudentId` is always stored as a `varchar(17)` string in PostgreSQL and as `string` in C#. It is never parsed as `long`, `int`, or any other numeric type.

### Rationale
- Bangladeshi national ID numbers can begin with zero in some formats; integer parsing would truncate leading zeros and corrupt the identifier.
- The system uses a POSIX regex check constraint (`"StudentId" ~ '^[0-9]{17}$'`) to enforce the format at the database level without numeric conversion.

---

## 7. No separate Students table

By design, this system does not maintain a Students table or require student registration. Any valid 17-digit string provided in `X-Student-Id` is treated as a student identifier. This follows the first-come-first-served, anonymous application model defined in the requirements.

---

## 8. `ON DELETE RESTRICT` for class-to-hold foreign key

A class cannot be deleted if any holds (including historical EXPIRED or CANCELLED ones) exist for it. This preserves the admission history and audit trail. Administrators who need to delete a class should first archive or remove associated hold records through a dedicated administrative workflow.
