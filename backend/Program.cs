using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Data;
using SchoolAdmissionAPI.Middleware;
using SchoolAdmissionAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// =============================================================================
// Database Configuration (Entity Framework Core with PostgreSQL)
// =============================================================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' not found. " +
        "Ensure it is configured in appsettings.json or via the 'ConnectionStrings__DefaultConnection' environment variable.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// =============================================================================
// Application Services & Dependency Injection
// =============================================================================
// Register business logic services
builder.Services.AddScoped<IClassService, ClassService>();

// Register MVC controllers with automatic model validation and camelCase JSON
builder.Services.AddControllers();

var app = builder.Build();

// =============================================================================
// HTTP Request Pipeline Middleware
// =============================================================================
// Global error handling middleware (prevents leaking internal details)
app.UseMiddleware<GlobalExceptionMiddleware>();

// Only enforce HTTPS redirection in non-development environments
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Map API Controllers (/classes, etc.)
app.MapControllers();

// Root health check endpoint for quick verification
app.MapGet("/", () => Results.Ok(new
{
    status = "healthy",
    service = "SchoolAdmissionAPI",
    message = "Phase 2: Class Management APIs active."
}));

app.Run();

// Expose Program class for WebApplicationFactory integration tests
public partial class Program { }
