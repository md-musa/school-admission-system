using Microsoft.EntityFrameworkCore;
using SchoolAdmissionAPI.Configuration;
using SchoolAdmissionAPI.Data;
using SchoolAdmissionAPI.Middleware;
using SchoolAdmissionAPI.Services;
using SchoolAdmissionAPI.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' not found. " +
        "Ensure it is configured in appsettings.json or via the 'ConnectionStrings__DefaultConnection' environment variable.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.Configure<AdmissionSettings>(
    builder.Configuration.GetSection(AdmissionSettings.SectionName));

builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IAdmissionHoldService, AdmissionHoldService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:4173"
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("FrontendDev");

if (!app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("EnableHttpsRedirection", false))
{
    app.UseHttpsRedirection();
}

app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    status = "healthy",
    service = "SchoolAdmissionAPI",
    message = "Phase 4: Admission Hold Lifecycle active."
}));

app.Run();

public partial class Program { }
