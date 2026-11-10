namespace SchoolAdmissionAPI.Models;

/// <summary>
/// Represents a seat reservation (hold) or confirmed admission application by a student.
/// </summary>
public class AdmissionHold
{
    /// <summary>
    /// Primary key, generated UUID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key referencing the associated AdmissionClass.
    /// </summary>
    public Guid ClassId { get; set; }

    /// <summary>
    /// Student identifier from X-Student-Id HTTP header.
    /// Exactly 17 digits, stored as string to preserve digit structure.
    /// </summary>
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Status of the hold (HELD, CONFIRMED, EXPIRED, CANCELLED).
    /// Stored as a string in PostgreSQL.
    /// </summary>
    public AdmissionHoldStatus Status { get; set; }

    /// <summary>
    /// UTC creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UTC expiration timestamp.
    /// Holds expire after HOLD_DURATION_SECONDS (default 600s) if not confirmed.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// UTC confirmation timestamp (null if not confirmed).
    /// </summary>
    public DateTime? ConfirmedAt { get; set; }

    /// <summary>
    /// UTC cancellation timestamp (null if not cancelled).
    /// </summary>
    public DateTime? CancelledAt { get; set; }

    /// <summary>
    /// Navigation property to the parent AdmissionClass.
    /// </summary>
    public AdmissionClass? AdmissionClass { get; set; }
}
