namespace SchoolAdmissionAPI.Services;

using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Data;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Models;

/// <summary>
/// Handles business logic and real-time seat calculations for admission classes.
/// Keeps database queries and business calculations separate from HTTP controllers.
/// </summary>
public class ClassService : IClassService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ClassService> _logger;

    public ClassService(ApplicationDbContext context, ILogger<ClassService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ClassResponseDto> CreateClassAsync(CreateClassRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Class name cannot be empty or whitespace.", nameof(request.Name));
        }

        var trimmedName = request.Name.Trim();
        if (trimmedName.Length > 150)
        {
            throw new ArgumentException("Class name cannot exceed 150 characters.", nameof(request.Name));
        }

        if (request.TotalSeats <= 0)
        {
            throw new ArgumentException("TotalSeats must be greater than zero.", nameof(request.TotalSeats));
        }

        var now = DateTime.UtcNow;
        var admissionClass = new AdmissionClass
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            TotalSeats = request.TotalSeats,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.AdmissionClasses.Add(admissionClass);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created new admission class '{Name}' (ID: {ClassId}, TotalSeats: {Seats})",
            admissionClass.Name, admissionClass.Id, admissionClass.TotalSeats);

        return new ClassResponseDto
        {
            Id = admissionClass.Id,
            Name = admissionClass.Name,
            TotalSeats = admissionClass.TotalSeats,
            HeldSeats = 0,
            ConfirmedSeats = 0,
            AvailableSeats = admissionClass.TotalSeats,
            CreatedAt = admissionClass.CreatedAt,
            UpdatedAt = admissionClass.UpdatedAt
        };
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ClassResponseDto>> GetAllClassesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        // Perform dynamic seat count calculations directly within a single database query.
        // EF Core translates this to correlated subqueries / joins executed efficiently in PostgreSQL.
        var classes = await _context.AdmissionClasses
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new ClassResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                TotalSeats = c.TotalSeats,
                HeldSeats = c.Holds.Count(h => h.Status == AdmissionHoldStatus.HELD && h.ExpiresAt > now),
                ConfirmedSeats = c.Holds.Count(h => h.Status == AdmissionHoldStatus.CONFIRMED),
                AvailableSeats = c.TotalSeats - (
                    c.Holds.Count(h => h.Status == AdmissionHoldStatus.HELD && h.ExpiresAt > now) +
                    c.Holds.Count(h => h.Status == AdmissionHoldStatus.CONFIRMED)
                ),
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return classes;
    }

    /// <inheritdoc />
    public async Task<ClassResponseDto?> GetClassByIdAsync(Guid classId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var classDto = await _context.AdmissionClasses
            .AsNoTracking()
            .Where(c => c.Id == classId)
            .Select(c => new ClassResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                TotalSeats = c.TotalSeats,
                HeldSeats = c.Holds.Count(h => h.Status == AdmissionHoldStatus.HELD && h.ExpiresAt > now),
                ConfirmedSeats = c.Holds.Count(h => h.Status == AdmissionHoldStatus.CONFIRMED),
                AvailableSeats = c.TotalSeats - (
                    c.Holds.Count(h => h.Status == AdmissionHoldStatus.HELD && h.ExpiresAt > now) +
                    c.Holds.Count(h => h.Status == AdmissionHoldStatus.CONFIRMED)
                ),
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        return classDto;
    }
}
