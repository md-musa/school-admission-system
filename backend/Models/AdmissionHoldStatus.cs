namespace SchoolAdmissionAPI.Models;

/// <summary>
/// Lifecycle status of an admission hold / reservation.
/// Stored as string in PostgreSQL ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED').
/// </summary>
public enum AdmissionHoldStatus
{
    /// <summary>
    /// Temporary seat reservation awaiting confirmation. Holds a seat until ExpiresAt.
    /// Active application status.
    /// </summary>
    HELD,

    /// <summary>
    /// Completed admission. Permanently consumes a seat.
    /// Active application status.
    /// </summary>
    CONFIRMED,

    /// <summary>
    /// Reservation expired after HOLD_DURATION_SECONDS. Seat is released back to available pool.
    /// Inactive status: student can apply again.
    /// </summary>
    EXPIRED,

    /// <summary>
    /// Explicitly cancelled reservation. Seat is released back to available pool.
    /// Inactive status: student can apply again.
    /// </summary>
    CANCELLED
}
