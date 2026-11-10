namespace SchoolAdmissionAPI.Services.Interfaces;

using SchoolAdmissionAPI.DTOs;

/// <summary>
/// Service contract for managing admission holds, row-level concurrency locking,
/// seat availability verification, and hold lifecycle transitions.
/// </summary>
public interface IAdmissionHoldService
{
    /// <summary>
    /// Creates a seat reservation (hold) for a student in a class using PostgreSQL row-level locking.
    /// </summary>
    /// <param name="classId">Admission class identifier.</param>
    /// <param name="studentId">17-digit student identifier from X-Student-Id header.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>Created hold information.</returns>
    Task<CreateHoldResponseDto> CreateHoldAsync(Guid classId, string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves hold details by ID, automatically updating status to EXPIRED if expired.
    /// </summary>
    /// <param name="holdId">Unique identifier of the hold.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>Hold details if found, or null if not found.</returns>
    Task<HoldDetailsResponseDto?> GetHoldByIdAsync(Guid holdId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Confirms an active seat reservation (hold) for the student.
    /// Uses row-level locking to prevent concurrency races with expiration.
    /// Idempotent for already-confirmed holds belonging to the same student.
    /// </summary>
    /// <param name="holdId">Unique identifier of the hold.</param>
    /// <param name="studentId">17-digit student identifier from X-Student-Id header.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>Confirmation result containing hold ID and updated status.</returns>
    Task<ConfirmHoldResponseDto> ConfirmHoldAsync(Guid holdId, string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels an active seat reservation (hold) for the student.
    /// Releases the held seat immediately. Rejects cancellation of confirmed applications.
    /// </summary>
    /// <param name="holdId">Unique identifier of the hold.</param>
    /// <param name="studentId">17-digit student identifier from X-Student-Id header.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    Task CancelHoldAsync(Guid holdId, string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all admission applications for the requesting student, including class names.
    /// Stale unexpired holds are automatically transitioned to EXPIRED before returning.
    /// </summary>
    /// <param name="studentId">17-digit student identifier from X-Student-Id header.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>List of applications belonging to the student.</returns>
    Task<IEnumerable<StudentApplicationDto>> GetStudentApplicationsAsync(string studentId, CancellationToken cancellationToken = default);
}
