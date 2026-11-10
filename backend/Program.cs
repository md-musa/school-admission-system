using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// =============================================================================
// Database Configuration (Entity Framework Core with PostgreSQL)
// =============================================================================
// In ASP.NET Core:
// - builder.Configuration reads sequentially from appsettings.json,
//   appsettings.{Environment}.json, user secrets, and environment variables.
// - builder.Configuration.GetConnectionString("DefaultConnection") looks for:
//     "ConnectionStrings": { "DefaultConnection": "..." }
//   and automatically accepts the standard environment variable override:
//     ConnectionStrings__DefaultConnection
// - Docker Compose sets: ConnectionStrings__DefaultConnection="Host=db;Port=5432;Database=school_admission_db;Username=postgres;Password=..."
// - Local execution outside Docker uses: Host=localhost
// =============================================================================

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' not found. " +
        "Ensure it is configured in appsettings.json or via the 'ConnectionStrings__DefaultConnection' environment variable.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

var app = builder.Build();

app.UseHttpsRedirection();

// Root health check endpoint for quick verification
app.MapGet("/", () => Results.Ok(new
{
    status = "healthy",
    service = "SchoolAdmissionAPI",
    message = "Phase 1: Database and EF Core configuration active."
}));

app.Run();
