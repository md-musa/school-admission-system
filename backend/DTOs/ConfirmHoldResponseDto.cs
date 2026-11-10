namespace SchoolAdmissionAPI.DTOs;

/// <summary>
/// Response returned upon successful confirmation of an admission hold.
/// </summary>
public class ConfirmHoldResponseDto
{
    /// <summary>
    /// Unique identifier of the confirmed hold.
    /// </summary>
    public Guid HoldId { get; set; }

    /// <summary>
    /// Updated status ("CONFIRMED").
    /// </summary>
    public string Status { get; set; } = string.Empty;
}
