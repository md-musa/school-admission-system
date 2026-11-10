namespace SchoolAdmissionAPI.Tests;

using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmissionAPI.Data;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Models;
using Xunit;

public class ClassesApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly ConcurrentBag<Guid> _trackedClassIds = new();

    public ClassesApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private ApplicationDbContext GetDbContext()
    {
        var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        if (_trackedClassIds.IsEmpty) return;

        await using var db = GetDbContext();
        var ids = _trackedClassIds.ToList();

        // 1. Remove holds created for test classes
        var holds = await db.AdmissionHolds
            .Where(h => ids.Contains(h.ClassId))
            .ToListAsync();
        if (holds.Any())
        {
            db.AdmissionHolds.RemoveRange(holds);
        }

        // 2. Remove test classes
        var classes = await db.AdmissionClasses
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
        if (classes.Any())
        {
            db.AdmissionClasses.RemoveRange(classes);
        }

        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task CreateClass_WithValidPayload_Returns201Created()
    {
        // Arrange
        var request = new CreateClassRequestDto
        {
            Name = "Class 9 - Morning Shift " + Guid.NewGuid().ToString()[..8],
            TotalSeats = 80
        };

        // Act
        var response = await _client.PostAsJsonAsync("/classes", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var responseDto = await response.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(responseDto);
        Assert.NotEqual(Guid.Empty, responseDto.Id);
        _trackedClassIds.Add(responseDto.Id);

        Assert.Equal(request.Name, responseDto.Name);
        Assert.Equal(80, responseDto.TotalSeats);
        Assert.Equal(0, responseDto.HeldSeats);
        Assert.Equal(0, responseDto.ConfirmedSeats);
        Assert.Equal(80, responseDto.AvailableSeats);
    }

    [Theory]
    [InlineData("", 50)]              // Empty name
    [InlineData("   ", 50)]           // Whitespace name
    [InlineData("Valid Name", 0)]     // Zero totalSeats
    [InlineData("Valid Name", -10)]   // Negative totalSeats
    public async Task CreateClass_WithInvalidPayload_Returns400BadRequest(string name, int totalSeats)
    {
        // Arrange
        var request = new CreateClassRequestDto
        {
            Name = name,
            TotalSeats = totalSeats
        };

        // Act
        var response = await _client.PostAsJsonAsync("/classes", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAllClasses_Returns200OK_WithAllClasses()
    {
        // Arrange: Create at least one class
        var createRequest = new CreateClassRequestDto
        {
            Name = "Class 10 - Science " + Guid.NewGuid().ToString()[..8],
            TotalSeats = 45
        };
        var createResponse = await _client.PostAsJsonAsync("/classes", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(created);
        _trackedClassIds.Add(created.Id);

        // Act
        var response = await _client.GetAsync("/classes");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var classes = await response.Content.ReadFromJsonAsync<List<ClassResponseDto>>();
        Assert.NotNull(classes);
        Assert.NotEmpty(classes);
        Assert.Contains(classes, c => c.Name == createRequest.Name && c.TotalSeats == 45);
    }

    [Fact]
    public async Task GetClassById_ExistingClass_Returns200OK_WithCorrectFields()
    {
        // Arrange
        var createRequest = new CreateClassRequestDto
        {
            Name = "Class 8 - Commerce " + Guid.NewGuid().ToString()[..8],
            TotalSeats = 50
        };
        var createResponse = await _client.PostAsJsonAsync("/classes", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(created);
        _trackedClassIds.Add(created.Id);

        // Act
        var response = await _client.GetAsync($"/classes/{created.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var fetched = await response.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal(createRequest.Name, fetched.Name);
        Assert.Equal(50, fetched.TotalSeats);
        Assert.Equal(0, fetched.HeldSeats);
        Assert.Equal(0, fetched.ConfirmedSeats);
        Assert.Equal(50, fetched.AvailableSeats);
    }

    [Fact]
    public async Task GetClassById_NonExistentClass_Returns404NotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/classes/{nonExistentId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetClass_SeatCalculations_CalculatesHeldConfirmedAndAvailableCorrectly()
    {
        // Arrange: Create a class with 100 seats
        var createRequest = new CreateClassRequestDto
        {
            Name = "Class 6 - Seat Calculation Test " + Guid.NewGuid().ToString()[..8],
            TotalSeats = 100
        };
        var createResponse = await _client.PostAsJsonAsync("/classes", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(created);
        _trackedClassIds.Add(created.Id);

        // Seed holds directly in the database to test dynamic calculations:
        // Hold 1: Active HELD (unexpired) -> must count as HeldSeats (+1)
        // Hold 2: Expired HELD (ExpiresAt in the past) -> must NOT count as HeldSeats (+0)
        // Hold 3: CONFIRMED -> must count as ConfirmedSeats (+1)
        // Hold 4: CANCELLED -> must NOT count (+0)
        await using (var db = GetDbContext())
        {
            var now = DateTime.UtcNow;
            string s1 = Random.Shared.NextInt64(10000000000000000, 99999999999999999).ToString();
            string s2 = Random.Shared.NextInt64(10000000000000000, 99999999999999999).ToString();
            string s3 = Random.Shared.NextInt64(10000000000000000, 99999999999999999).ToString();
            string s4 = Random.Shared.NextInt64(10000000000000000, 99999999999999999).ToString();

            db.AdmissionHolds.AddRange(
                new AdmissionHold
                {
                    Id = Guid.NewGuid(),
                    ClassId = created.Id,
                    StudentId = s1,
                    Status = AdmissionHoldStatus.HELD,
                    CreatedAt = now,
                    ExpiresAt = now.AddMinutes(10) // Active hold
                },
                new AdmissionHold
                {
                    Id = Guid.NewGuid(),
                    ClassId = created.Id,
                    StudentId = s2,
                    Status = AdmissionHoldStatus.HELD,
                    CreatedAt = now.AddMinutes(-20),
                    ExpiresAt = now.AddMinutes(-10) // Expired hold
                },
                new AdmissionHold
                {
                    Id = Guid.NewGuid(),
                    ClassId = created.Id,
                    StudentId = s3,
                    Status = AdmissionHoldStatus.CONFIRMED,
                    CreatedAt = now.AddMinutes(-30),
                    ExpiresAt = now.AddMinutes(-20),
                    ConfirmedAt = now.AddMinutes(-25) // Confirmed admission
                },
                new AdmissionHold
                {
                    Id = Guid.NewGuid(),
                    ClassId = created.Id,
                    StudentId = s4,
                    Status = AdmissionHoldStatus.CANCELLED,
                    CreatedAt = now.AddMinutes(-40),
                    ExpiresAt = now.AddMinutes(-30),
                    CancelledAt = now.AddMinutes(-35) // Cancelled hold
                }
            );

            await db.SaveChangesAsync();
        }

        // Act: Fetch class by ID
        var response = await _client.GetAsync($"/classes/{created.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(result);

        Assert.Equal(100, result.TotalSeats);
        Assert.Equal(1, result.HeldSeats);          // Only 1 unexpired HELD
        Assert.Equal(1, result.ConfirmedSeats);     // Only 1 CONFIRMED
        Assert.Equal(98, result.AvailableSeats);    // 100 - 1 - 1 = 98!
    }
}
