namespace SchoolAdmissionAPI.Models;

/// <summary>
/// Represents an admission offering for a specific class and shift combination
/// (e.g. "Class 6 - Morning Shift").
/// Each class and shift combination is a separate AdmissionClass record with its own seat capacity.
/// </summary>
public class AdmissionClass
{
    /// <summary>
    /// Primary key, generated UUID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the admission class option (e.g. "Class 6 - Morning Shift").
    /// Required, maximum length 150 characters.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Total seat capacity for this class offering.
    /// Must be greater than zero.
    /// </summary>
    public int TotalSeats { get; set; }

    /// <summary>
    /// UTC creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UTC update timestamp.
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Associated admission holds for this class option.
    /// Configured with restrictive deletion behavior (cannot delete class if holds exist).
    /// </summary>
    public ICollection<AdmissionHold> Holds { get; set; } = new List<AdmissionHold>();
}
