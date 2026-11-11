using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Configuration;
using SchoolAdmissionAPI.Data;
using SchoolAdmissionAPI.Middleware;
using SchoolAdmissionAPI.Services;
using SchoolAdmissionAPI.Services.Interfaces;

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
// Application Configuration & Options
// =============================================================================
builder.Services.Configure<AdmissionSettings>(
    builder.Configuration.GetSection(AdmissionSettings.SectionName));

// =============================================================================
// Application Services & Dependency Injection
// =============================================================================
// Register business logic services
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IAdmissionHoldService, AdmissionHoldService>();

// Register MVC controllers with automatic model validation and camelCase JSON
builder.Services.AddControllers();

// =============================================================================
// CORS — allow the Vite dev server and any local frontend origin
// =============================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:4173"   // vite preview
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// =============================================================================
// Auto-apply EF Core migrations on startup (safe in production containers)
// =============================================================================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// =============================================================================
// HTTP Request Pipeline Middleware
// =============================================================================
// Global error handling middleware (prevents leaking internal details)
app.UseMiddleware<GlobalExceptionMiddleware>();

// CORS must come before controllers
app.UseCors("FrontendDev");

// Only enforce HTTPS redirection when explicitly enabled (disabled by default in containerized/HTTP setups)
if (!app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("EnableHttpsRedirection", false))
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
    message = "Phase 4: Admission Hold Lifecycle active."
}));

app.Run();

// Expose Program class for WebApplicationFactory integration tests
public partial class Program { }
