namespace SchoolAdmissionAPI.Data;

using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<AdmissionClass> AdmissionClasses => Set<AdmissionClass>();

    public DbSet<AdmissionHold> AdmissionHolds => Set<AdmissionHold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AdmissionClass>(entity =>
        {
            entity.ToTable("AdmissionClasses", t =>
            {
                t.HasCheckConstraint(
                    "CK_AdmissionClasses_TotalSeats_Positive",
                    "\"TotalSeats\" > 0"
                );
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.TotalSeats)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            entity.HasMany(e => e.Holds)
                .WithOne(h => h.AdmissionClass)
                .HasForeignKey(h => h.ClassId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AdmissionHold>(entity =>
        {
            entity.ToTable("AdmissionHolds", t =>
            {
                t.HasCheckConstraint(
                    "CK_AdmissionHolds_StudentId_Format",
                    "\"StudentId\" ~ '^[0-9]{17}$'"
                );

                t.HasCheckConstraint(
                    "CK_AdmissionHolds_Status_Valid",
                    "\"Status\" IN ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED')"
                );
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.ClassId)
                .IsRequired();

            entity.Property(e => e.StudentId)
                .IsRequired()
                .HasMaxLength(17);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            entity.Property(e => e.ExpiresAt)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            entity.Property(e => e.ConfirmedAt)
                .IsRequired(false)
                .HasColumnType("timestamp with time zone");

            entity.Property(e => e.CancelledAt)
                .IsRequired(false)
                .HasColumnType("timestamp with time zone");

            entity.HasIndex(e => new { e.ClassId, e.Status })
                .HasDatabaseName("IX_AdmissionHolds_ClassId_Status");

            entity.HasIndex(e => new { e.Status, e.ExpiresAt })
                .HasDatabaseName("IX_AdmissionHolds_Status_ExpiresAt");

            // Unique Partial Index on StudentId where Status IN ('HELD', 'CONFIRMED')
            // Guarantees at database level that a student can have at most ONE active application
            // across all admission classes at any given time.
            entity.HasIndex(e => e.StudentId)
                .IsUnique()
                .HasDatabaseName("IX_AdmissionHolds_StudentId_Active")
                .HasFilter("\"Status\" IN ('HELD', 'CONFIRMED')");
        });
    }
}
