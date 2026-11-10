namespace SchoolAdmissionAPI.DTOs;

/// <summary>
/// Response payload for an admission class, including dynamically computed seat counts.
/// Note: HeldSeats, ConfirmedSeats, and AvailableSeats are calculated dynamically
/// and are never stored as static columns in the database.
/// </summary>
public class ClassResponseDto
{
    /// <summary>
    /// Unique identifier for the admission class (UUID).
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the admission class and shift (e.g. "Class 6 - Morning Shift").
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Total seat capacity configured for this admission option.
    /// </summary>
    public int TotalSeats { get; set; }

    /// <summary>
    /// Number of active holds currently reserved (Status = HELD and ExpiresAt > Current UTC Time).
    /// </summary>
    public int HeldSeats { get; set; }

    /// <summary>
    /// Number of permanently confirmed applications (Status = CONFIRMED).
    /// </summary>
    public int ConfirmedSeats { get; set; }

    /// <summary>
    /// Remaining seats available for application: TotalSeats - HeldSeats - ConfirmedSeats.
    /// </summary>
    public int AvailableSeats { get; set; }

    /// <summary>
    /// UTC timestamp when the class was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UTC timestamp when the class was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
