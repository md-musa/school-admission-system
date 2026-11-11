namespace SchoolAdmissionAPI.DTOs;

using System.ComponentModel.DataAnnotations;

public class CreateClassRequestDto
{
    [Required(ErrorMessage = "Class name is required.")]
    [StringLength(150, MinimumLength = 1, ErrorMessage = "Class name cannot exceed 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "TotalSeats is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "TotalSeats must be greater than zero.")]
    public int TotalSeats { get; set; }
}
