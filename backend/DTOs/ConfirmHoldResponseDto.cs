namespace SchoolAdmissionAPI.DTOs;

public class ConfirmHoldResponseDto
{
    public Guid HoldId { get; set; }

    public string Status { get; set; } = string.Empty;
}
