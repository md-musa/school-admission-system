# Assumptions

1. **Concurrency:** I used PostgreSQL row-level locking with `SELECT FOR UPDATE` to prevent overbooking. When two backend processes use the same database, only one process can lock a class row at a time during seat allocation. The second process waits until the lock is released and then checks the updated seat count. This ensures that HELD + CONFIRMED applications never exceed `totalSeats`.

2. **Student ID:** A student ID must contain exactly 17 numeric digits. I store it as a string instead of a number.

3. **Active Application:** A student can have only one active application at a time. HELD and CONFIRMED are considered active statuses.

4. **Hold Duration:** A seat is held for 10 minutes by default. This duration can be changed using the `HOLD_DURATION_SECONDS` environment variable.

5. **Payment:** Admission confirmation is simulated. No real payment gateway is used.

6. **Cancellation:** Only HELD applications can be cancelled. CONFIRMED applications cannot be cancelled.

7. **Seat Availability:** Available seats are calculated from the number of HELD and CONFIRMED applications.

8. **Database:** PostgreSQL data is stored in a Docker volume so that data remains available after restarting the containers.
