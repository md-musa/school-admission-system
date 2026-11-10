namespace SchoolAdmissionAPI.Services;

using System.Data;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using SchoolAdmissionAPI.Configuration;
using SchoolAdmissionAPI.Data;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Exceptions;
using SchoolAdmissionAPI.Models;
using SchoolAdmissionAPI.Services.Interfaces;

/// <summary>
/// Handles business logic, row-level locking concurrency protection, seat calculations,
/// and lifecycle state transitions for admission holds.
/// </summary>
public class AdmissionHoldService : IAdmissionHoldService
{
    private static readonly Regex StudentIdRegex = new(@"^[0-9]{17}$", RegexOptions.Compiled);

    private readonly ApplicationDbContext _context;
    private readonly AdmissionSettings _settings;
    private readonly ILogger<AdmissionHoldService> _logger;

    public AdmissionHoldService(
        ApplicationDbContext context,
        IOptions<AdmissionSettings> settings,
        ILogger<AdmissionHoldService> logger)
    {
        _context = context;
        _settings = settings.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<CreateHoldResponseDto> CreateHoldAsync(
        Guid classId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        // 1. Validate student ID format
        if (string.IsNullOrWhiteSpace(studentId) || !StudentIdRegex.IsMatch(studentId))
        {
            throw new ArgumentException(
                "Header 'X-Student-Id' is required and must contain exactly 17 numeric digits.",
                nameof(studentId));
        }

        var holdDurationSeconds = _settings.HoldDurationSeconds > 0 ? _settings.HoldDurationSeconds : 600;

        // 2. Begin database transaction
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.ReadCommitted,
            cancellationToken);

        try
        {
            // 3. Lock the selected AdmissionClass row using SELECT ... FOR UPDATE
            var admissionClass = (await _context.AdmissionClasses
                .FromSqlInterpolated($"SELECT * FROM \"AdmissionClasses\" WHERE \"Id\" = {classId} FOR UPDATE")
                .ToListAsync(cancellationToken))
                .FirstOrDefault();

            // 4. Verify that the class exists
            if (admissionClass == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new NotFoundException($"Admission class with ID '{classId}' was not found.");
            }

            var now = DateTime.UtcNow;

            // 5. Expire stale HELD records for the selected class AND for the requesting student across all classes
            var staleHolds = await _context.AdmissionHolds
                .Where(h => (h.ClassId == classId || h.StudentId == studentId)
                            && h.Status == AdmissionHoldStatus.HELD
                            && h.ExpiresAt <= now)
                .ToListAsync(cancellationToken);

            if (staleHolds.Count > 0)
            {
                foreach (var staleHold in staleHolds)
                {
                    staleHold.Status = AdmissionHoldStatus.EXPIRED;
                }
                await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation(
                    "Expired {Count} stale hold(s) during hold creation for class {ClassId} / student {StudentId}",
                    staleHolds.Count, classId, studentId);
            }

            // 6. Check whether the student has an existing active application
            var hasActiveApplication = await _context.AdmissionHolds
                .AnyAsync(h => h.StudentId == studentId
                            && (h.Status == AdmissionHoldStatus.HELD || h.Status == AdmissionHoldStatus.CONFIRMED),
                          cancellationToken);

            if (hasActiveApplication)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException("Student already has an active application.");
            }

            // 7. Count active HELD and CONFIRMED records for the selected class
            var heldSeats = await _context.AdmissionHolds
                .CountAsync(h => h.ClassId == classId
                              && h.Status == AdmissionHoldStatus.HELD
                              && h.ExpiresAt > now,
                            cancellationToken);

            var confirmedSeats = await _context.AdmissionHolds
                .CountAsync(h => h.ClassId == classId
                              && h.Status == AdmissionHoldStatus.CONFIRMED,
                            cancellationToken);

            // 8. Calculate availableSeats = totalSeats - heldSeats - confirmedSeats
            var availableSeats = admissionClass.TotalSeats - heldSeats - confirmedSeats;

            // 9. If no seats are available, return HTTP 409 Conflict
            if (availableSeats <= 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException("No available seats in the selected class.");
            }

            // 10. Insert a new AdmissionHold with status HELD
            var expiresAt = now.AddSeconds(holdDurationSeconds);
            var newHold = new AdmissionHold
            {
                Id = Guid.NewGuid(),
                ClassId = classId,
                StudentId = studentId,
                Status = AdmissionHoldStatus.HELD,
                CreatedAt = now,
                ExpiresAt = expiresAt,
                ConfirmedAt = null,
                CancelledAt = null
            };

            _context.AdmissionHolds.Add(newHold);
            await _context.SaveChangesAsync(cancellationToken);

            // 11. Commit the transaction
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully created hold {HoldId} for student {StudentId} in class {ClassId}. Available seats remaining: {Remaining}",
                newHold.Id, studentId, classId, availableSeats - 1);

            return new CreateHoldResponseDto
            {
                HoldId = newHold.Id,
                ClassId = newHold.ClassId,
                StudentId = newHold.StudentId,
                Status = newHold.Status.ToString(),
                ExpiresAt = newHold.ExpiresAt
            };
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogWarning(ex, "Unique constraint violation: Student {StudentId} already has an active application.", studentId);
            throw new ConflictException("Student already has an active application.");
        }
        catch (Exception ex) when (ex is not NotFoundException && ex is not ConflictException && ex is not ArgumentException)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Unexpected error while creating admission hold for class {ClassId} and student {StudentId}", classId, studentId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<HoldDetailsResponseDto?> GetHoldByIdAsync(
        Guid holdId,
        CancellationToken cancellationToken = default)
    {
        var hold = await _context.AdmissionHolds
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        if (hold.Status == AdmissionHoldStatus.HELD && hold.ExpiresAt <= now)
        {
            hold.Status = AdmissionHoldStatus.EXPIRED;
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Hold {HoldId} has expired. Status updated to EXPIRED.", hold.Id);
        }

        return new HoldDetailsResponseDto
        {
            HoldId = hold.Id,
            ClassId = hold.ClassId,
            StudentId = hold.StudentId,
            Status = hold.Status.ToString(),
            ExpiresAt = hold.ExpiresAt
        };
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        if (ex.InnerException is PostgresException postgresException)
        {
            return postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
        }
        return false;
    }
}
