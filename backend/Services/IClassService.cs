namespace SchoolAdmissionAPI.Services;

using SchoolAdmissionAPI.DTOs;

/// <summary>
/// Service contract for managing admission classes and computing real-time seat availability.
/// </summary>
public interface IClassService
{
    /// <summary>
    /// Creates a new admission class option and saves it to the database.
    /// </summary>
    Task<ClassResponseDto> CreateClassAsync(CreateClassRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all admission classes with dynamic seat counts (held, confirmed, available).
    /// </summary>
    Task<IEnumerable<ClassResponseDto>> GetAllClassesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a single admission class by ID with dynamic seat counts, or null if not found.
    /// </summary>
    Task<ClassResponseDto?> GetClassByIdAsync(Guid classId, CancellationToken cancellationToken = default);
}
