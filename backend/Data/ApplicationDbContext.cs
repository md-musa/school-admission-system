namespace SchoolAdmissionAPI.Data;

using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Models;

/// <summary>
/// Entity Framework Core DbContext for the School Admission System.
/// Manages entity mapping, relationships, constraints, and indexes.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Admission class offerings (e.g. "Class 6 - Morning Shift").
    /// </summary>
    public DbSet<AdmissionClass> AdmissionClasses => Set<AdmissionClass>();

    /// <summary>
    /// Student admission reservations and applications.
    /// </summary>
    public DbSet<AdmissionHold> AdmissionHolds => Set<AdmissionHold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // 1. AdmissionClasses Table Configuration
        // ==========================================
        modelBuilder.Entity<AdmissionClass>(entity =>
        {
            entity.ToTable("AdmissionClasses", t =>
            {
                // Constraint: TotalSeats must be greater than zero
                t.HasCheckConstraint(
                    "CK_AdmissionClasses_TotalSeats_Positive",
                    "\"TotalSeats\" > 0"
                );
            });

            // Primary Key: Id (UUID)
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            // Name: Required, varchar(150)
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150);

            // TotalSeats: Required integer > 0
            entity.Property(e => e.TotalSeats)
                .IsRequired();

            // CreatedAt: timestamptz (timestamp with time zone)
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            // UpdatedAt: timestamptz (timestamp with time zone)
            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            // Relationship: AdmissionClasses (1) -------- (Many) AdmissionHolds
            // Restrictive deletion behavior: do not allow deletion of a class that has holds
            entity.HasMany(e => e.Holds)
                .WithOne(h => h.AdmissionClass)
                .HasForeignKey(h => h.ClassId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==========================================
        // 2. AdmissionHolds Table Configuration
        // ==========================================
        modelBuilder.Entity<AdmissionHold>(entity =>
        {
            entity.ToTable("AdmissionHolds", t =>
            {
                // Constraint: StudentId must be exactly 17 digits
                t.HasCheckConstraint(
                    "CK_AdmissionHolds_StudentId_Format",
                    "\"StudentId\" ~ '^[0-9]{17}$'"
                );

                // Constraint: Status must only be one of the permitted enum values
                t.HasCheckConstraint(
                    "CK_AdmissionHolds_Status_Valid",
                    "\"Status\" IN ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED')"
                );
            });

            // Primary Key: Id (UUID)
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            // Foreign Key: ClassId
            entity.Property(e => e.ClassId)
                .IsRequired();

            // StudentId: varchar(17), exactly 17 digits
            entity.Property(e => e.StudentId)
                .IsRequired()
                .HasMaxLength(17);

            // Status: stored as string in PostgreSQL (varchar(20)), not integer
            entity.Property(e => e.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            // CreatedAt: timestamptz
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            // ExpiresAt: timestamptz
            entity.Property(e => e.ExpiresAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            // ConfirmedAt: nullable timestamptz
            entity.Property(e => e.ConfirmedAt)
                .IsRequired(false)
                .HasColumnType("timestamp with time zone");

            // CancelledAt: nullable timestamptz
            entity.Property(e => e.CancelledAt)
                .IsRequired(false)
                .HasColumnType("timestamp with time zone");

            // Index 1: (ClassId, Status) - speeds up seat calculation and queries
            entity.HasIndex(e => new { e.ClassId, e.Status })
                .HasDatabaseName("IX_AdmissionHolds_ClassId_Status");

            // Index 2: (Status, ExpiresAt) - speeds up hold expiration queries
            entity.HasIndex(e => new { e.Status, e.ExpiresAt })
                .HasDatabaseName("IX_AdmissionHolds_Status_ExpiresAt");

            // Index 3: Unique Partial Index on StudentId where Status IN ('HELD', 'CONFIRMED')
            // Guarantees at database level that a student can have at most ONE active application
            // across all admission classes at any given time.
            entity.HasIndex(e => e.StudentId)
                .IsUnique()
                .HasDatabaseName("IX_AdmissionHolds_StudentId_Active")
                .HasFilter("\"Status\" IN ('HELD', 'CONFIRMED')");
        });
    }
}
