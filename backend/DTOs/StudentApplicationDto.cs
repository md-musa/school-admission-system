namespace SchoolAdmissionAPI.DTOs;

public class StudentApplicationDto
{
    public Guid HoldId { get; set; }

    public Guid ClassId { get; set; }

    public string StudentId { get; set; } = string.Empty;

    public string ClassName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
}
