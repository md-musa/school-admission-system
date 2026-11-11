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
        if (string.IsNullOrWhiteSpace(studentId) || !StudentIdRegex.IsMatch(studentId))
        {
            throw new ArgumentException(
                "Header 'X-Student-Id' is required and must contain exactly 17 numeric digits.",
                nameof(studentId));
        }

        var holdDurationSeconds = _settings.HoldDurationSeconds > 0 ? _settings.HoldDurationSeconds : 600;

        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.ReadCommitted,
            cancellationToken);

        try
        {
            // Lock the selected AdmissionClass row using SELECT ... FOR UPDATE
            var admissionClass = (await _context.AdmissionClasses
                .FromSqlInterpolated($"SELECT * FROM \"AdmissionClasses\" WHERE \"Id\" = {classId} FOR UPDATE")
                .ToListAsync(cancellationToken))
                .FirstOrDefault();

            if (admissionClass == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new NotFoundException($"Admission class with ID '{classId}' was not found.");
            }

            var now = DateTime.UtcNow;

            // Expire stale HELD records for the selected class and for the requesting student across all classes
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

            var hasActiveApplication = await _context.AdmissionHolds
                .AnyAsync(h => h.StudentId == studentId
                            && (h.Status == AdmissionHoldStatus.HELD || h.Status == AdmissionHoldStatus.CONFIRMED),
                          cancellationToken);

            if (hasActiveApplication)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException("Student already has an active application.");
            }

            var heldSeats = await _context.AdmissionHolds
                .CountAsync(h => h.ClassId == classId
                              && h.Status == AdmissionHoldStatus.HELD
                              && h.ExpiresAt > now,
                            cancellationToken);

            var confirmedSeats = await _context.AdmissionHolds
                .CountAsync(h => h.ClassId == classId
                              && h.Status == AdmissionHoldStatus.CONFIRMED,
                            cancellationToken);

            // Seat allocation: availableSeats = totalSeats - heldSeats - confirmedSeats
            var availableSeats = admissionClass.TotalSeats - heldSeats - confirmedSeats;

            if (availableSeats <= 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException("No available seats in the selected class.");
            }

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

    /// <inheritdoc />
    public async Task<ConfirmHoldResponseDto> ConfirmHoldAsync(
        Guid holdId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.ReadCommitted, cancellationToken);

        try
        {
            // Lock the hold row using SELECT … FOR UPDATE so expiration and confirmation cannot race
            var hold = (await _context.AdmissionHolds
                .FromSqlInterpolated($"SELECT * FROM \"AdmissionHolds\" WHERE \"Id\" = {holdId} FOR UPDATE")
                .ToListAsync(cancellationToken))
                .FirstOrDefault();

            if (hold == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new NotFoundException($"Admission hold with ID '{holdId}' was not found.");
            }

            if (hold.StudentId != studentId)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new NotFoundException($"Admission hold with ID '{holdId}' was not found.");
            }

            var now = DateTime.UtcNow;

            // Idempotent: already confirmed by the same student → return 200 immediately
            if (hold.Status == AdmissionHoldStatus.CONFIRMED)
            {
                await transaction.RollbackAsync(cancellationToken);
                return new ConfirmHoldResponseDto { HoldId = hold.Id, Status = "CONFIRMED" };
            }

            if (hold.Status == AdmissionHoldStatus.CANCELLED)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException("A cancelled hold cannot be confirmed.");
            }

            if (hold.Status == AdmissionHoldStatus.EXPIRED)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException("The hold has expired and the seat has been released. Please create a new hold.");
            }

            // Detect expiration (even if still stored as HELD)
            if (hold.Status == AdmissionHoldStatus.HELD && hold.ExpiresAt <= now)
            {
                hold.Status = AdmissionHoldStatus.EXPIRED;
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                _logger.LogInformation("Hold {HoldId} expired at confirmation time. Status set to EXPIRED.", holdId);
                throw new ConflictException("The hold has expired and the seat has been released. Please create a new hold.");
            }

            hold.Status = AdmissionHoldStatus.CONFIRMED;
            hold.ConfirmedAt = now;
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Hold {HoldId} confirmed for student {StudentId}.", holdId, studentId);
            return new ConfirmHoldResponseDto { HoldId = hold.Id, Status = "CONFIRMED" };
        }
        catch (Exception ex) when (ex is not NotFoundException && ex is not ConflictException)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Unexpected error confirming hold {HoldId} for student {StudentId}.", holdId, studentId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task CancelHoldAsync(
        Guid holdId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.ReadCommitted, cancellationToken);

        try
        {
            // Lock the hold row using SELECT ... FOR UPDATE
            var hold = (await _context.AdmissionHolds
                .FromSqlInterpolated($"SELECT * FROM \"AdmissionHolds\" WHERE \"Id\" = {holdId} FOR UPDATE")
                .ToListAsync(cancellationToken))
                .FirstOrDefault();

            if (hold == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new NotFoundException($"Admission hold with ID '{holdId}' was not found.");
            }

            if (hold.StudentId != studentId)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new NotFoundException($"Admission hold with ID '{holdId}' was not found.");
            }

            if (hold.Status == AdmissionHoldStatus.CONFIRMED)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new ConflictException(
                    "A confirmed admission cannot be cancelled through this endpoint. " +
                    "Please contact the admission office.");
            }

            // Idempotent: already cancelled or expired → succeed silently
            if (hold.Status == AdmissionHoldStatus.CANCELLED || hold.Status == AdmissionHoldStatus.EXPIRED)
            {
                await transaction.RollbackAsync(cancellationToken);
                return;
            }

            // Handle expired-but-still-HELD records consistently
            var now = DateTime.UtcNow;
            if (hold.Status == AdmissionHoldStatus.HELD && hold.ExpiresAt <= now)
            {
                hold.Status = AdmissionHoldStatus.EXPIRED;
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                _logger.LogInformation("Hold {HoldId} had already expired; recorded as EXPIRED during cancel.", holdId);
                return;
            }

            hold.Status = AdmissionHoldStatus.CANCELLED;
            hold.CancelledAt = now;
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Hold {HoldId} cancelled by student {StudentId}.", holdId, studentId);
        }
        catch (Exception ex) when (ex is not NotFoundException && ex is not ConflictException)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Unexpected error cancelling hold {HoldId} for student {StudentId}.", holdId, studentId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<StudentApplicationDto>> GetStudentApplicationsAsync(
        string studentId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        // Expire any stale HELD records for this student before fetching
        var staleHolds = await _context.AdmissionHolds
            .Where(h => h.StudentId == studentId
                     && h.Status == AdmissionHoldStatus.HELD
                     && h.ExpiresAt <= now)
            .ToListAsync(cancellationToken);

        if (staleHolds.Count > 0)
        {
            foreach (var stale in staleHolds)
                stale.Status = AdmissionHoldStatus.EXPIRED;

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Expired {Count} stale hold(s) for student {StudentId} during application history retrieval.",
                staleHolds.Count, studentId);
        }

        var applications = await _context.AdmissionHolds
            .AsNoTracking()
            .Where(h => h.StudentId == studentId)
            .Join(_context.AdmissionClasses,
                  h => h.ClassId,
                  c => c.Id,
                  (h, c) => new StudentApplicationDto
                  {
                      HoldId = h.Id,
                      ClassId = h.ClassId,
                      ClassName = c.Name,
                      StudentId = h.StudentId,
                      Status = h.Status.ToString(),
                      ExpiresAt = h.ExpiresAt
                  })
            .OrderByDescending(a => a.ExpiresAt)
            .ToListAsync(cancellationToken);

        return applications;
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
