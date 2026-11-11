namespace SchoolAdmissionAPI.Models;

/// <summary>
/// Represents an admission offering for a specific class and shift combination
/// (e.g. "Class 6 - Morning Shift").
/// Each class and shift combination is a separate AdmissionClass record with its own seat capacity.
/// </summary>
public class AdmissionClass
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int TotalSeats { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<AdmissionHold> Holds { get; set; } = new List<AdmissionHold>();
}
