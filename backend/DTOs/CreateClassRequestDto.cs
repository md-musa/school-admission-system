namespace SchoolAdmissionAPI.DTOs;

using System.ComponentModel.DataAnnotations;

/// <summary>
/// Request payload for creating a new admission class and shift option.
/// </summary>
public class CreateClassRequestDto
{
    /// <summary>
    /// Name of the admission class (e.g., "Class 6 - Morning Shift").
    /// </summary>
    [Required(ErrorMessage = "Class name is required.")]
    [StringLength(150, MinimumLength = 1, ErrorMessage = "Class name cannot exceed 150 characters.")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Total seat capacity for this admission class.
    /// Must be strictly greater than zero.
    /// </summary>
    [Required(ErrorMessage = "TotalSeats is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "TotalSeats must be greater than zero.")]
    public int TotalSeats { get; set; }
}
