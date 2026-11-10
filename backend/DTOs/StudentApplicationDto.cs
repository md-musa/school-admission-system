namespace SchoolAdmissionAPI.DTOs;

/// <summary>
/// Represents a student's admission application record, including class details and lifecycle status.
/// </summary>
public class StudentApplicationDto
{
    /// <summary>
    /// Unique identifier of the hold record.
    /// </summary>
    public Guid HoldId { get; set; }

    /// <summary>
    /// Unique identifier of the associated class offering.
    /// </summary>
    public Guid ClassId { get; set; }

    /// <summary>
    /// 17-digit student identifier.
    /// </summary>
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the admission class (e.g. "Class 6 - Morning Shift").
    /// </summary>
    public string ClassName { get; set; } = string.Empty;

    /// <summary>
    /// Lifecycle status of the application (HELD, CONFIRMED, EXPIRED, CANCELLED).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// UTC expiration timestamp of the hold reservation.
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}
