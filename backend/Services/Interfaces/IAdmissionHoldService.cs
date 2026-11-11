namespace SchoolAdmissionAPI.Services.Interfaces;

using SchoolAdmissionAPI.DTOs;

public interface IAdmissionHoldService
{
    /// <summary>
    /// Creates a seat reservation (hold) for a student in a class using PostgreSQL row-level locking.
    /// </summary>
    Task<CreateHoldResponseDto> CreateHoldAsync(Guid classId, string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves hold details by ID, automatically updating status to EXPIRED if expired.
    /// </summary>
    Task<HoldDetailsResponseDto?> GetHoldByIdAsync(Guid holdId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Confirms an active seat reservation (hold) using row-level locking to prevent concurrency races with expiration.
    /// Idempotent for already-confirmed holds belonging to the same student.
    /// </summary>
    Task<ConfirmHoldResponseDto> ConfirmHoldAsync(Guid holdId, string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels an active seat reservation (hold) and releases the held seat immediately.
    /// </summary>
    Task CancelHoldAsync(Guid holdId, string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all admission applications for the requesting student, transitioning any stale holds to EXPIRED.
    /// </summary>
    Task<IEnumerable<StudentApplicationDto>> GetStudentApplicationsAsync(string studentId, CancellationToken cancellationToken = default);
}
