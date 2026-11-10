namespace SchoolAdmissionAPI.DTOs;

/// <summary>
/// Response payload returned when querying admission hold details.
/// </summary>
public class HoldDetailsResponseDto
{
    /// <summary>
    /// Unique identifier of the hold (UUID).
    /// </summary>
    public Guid HoldId { get; set; }

    /// <summary>
    /// Identifier of the admission class offering.
    /// </summary>
    public Guid ClassId { get; set; }

    /// <summary>
    /// 17-digit student identifier.
    /// </summary>
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Lifecycle status of the hold (HELD, CONFIRMED, EXPIRED, CANCELLED).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Expiration timestamp in UTC.
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}
