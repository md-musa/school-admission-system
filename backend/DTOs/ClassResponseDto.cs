namespace SchoolAdmissionAPI.DTOs;

/// <summary>
/// Response payload for an admission class, including dynamically computed seat counts.
/// Note: HeldSeats, ConfirmedSeats, and AvailableSeats are calculated dynamically
/// and are never stored as static columns in the database.
/// </summary>
public class ClassResponseDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int TotalSeats { get; set; }

    public int HeldSeats { get; set; }

    public int ConfirmedSeats { get; set; }

    public int AvailableSeats { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
