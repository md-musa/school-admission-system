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

public class AdmissionHoldsApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly ConcurrentBag<Guid> _trackedClassIds = new();

    public AdmissionHoldsApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private ApplicationDbContext GetDbContext()
    {
        var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }

    private static string GenerateStudentId() =>
        Random.Shared.NextInt64(10000000000000000, 99999999999999999).ToString();

    private async Task<ClassResponseDto> CreateTestClassAsync(int totalSeats = 10, string? namePrefix = null)
    {
        var request = new CreateClassRequestDto
        {
            Name = $"{namePrefix ?? "Test Class"} - {Guid.NewGuid().ToString()[..8]}",
            TotalSeats = totalSeats
        };
        var response = await _client.PostAsJsonAsync("/classes", request);
        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(created);
        _trackedClassIds.Add(created.Id);
        return created;
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        if (_trackedClassIds.IsEmpty) return;

        await using var db = GetDbContext();
        var ids = _trackedClassIds.ToList();

        var holds = await db.AdmissionHolds
            .Where(h => ids.Contains(h.ClassId))
            .ToListAsync();
        if (holds.Any())
        {
            db.AdmissionHolds.RemoveRange(holds);
        }

        var classes = await db.AdmissionClasses
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
        if (classes.Any())
        {
            db.AdmissionClasses.RemoveRange(classes);
        }

        await db.SaveChangesAsync();
    }

    // =========================================================================
    // Scenario 1: Valid hold creation
    // =========================================================================
    [Fact]
    public async Task CreateHold_ValidRequest_Returns201Created()
    {
        // Arrange
        var testClass = await CreateTestClassAsync(totalSeats: 10, "Hold Valid Creation");
        var studentId = GenerateStudentId();

        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        request.Headers.Add("X-Student-Id", studentId);
        request.Content = JsonContent.Create(new { });

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var hold = await response.Content.ReadFromJsonAsync<CreateHoldResponseDto>();
        Assert.NotNull(hold);
        Assert.NotEqual(Guid.Empty, hold.HoldId);
        Assert.Equal(testClass.Id, hold.ClassId);
        Assert.Equal(studentId, hold.StudentId);
        Assert.Equal("HELD", hold.Status);
        Assert.True(hold.ExpiresAt > DateTime.UtcNow);

        // Verify hold is persisted in database
        await using var db = GetDbContext();
        var dbHold = await db.AdmissionHolds.FindAsync(hold.HoldId);
        Assert.NotNull(dbHold);
        Assert.Equal(AdmissionHoldStatus.HELD, dbHold.Status);
        Assert.Equal(studentId, dbHold.StudentId);
        Assert.Equal(testClass.Id, dbHold.ClassId);
    }

    // =========================================================================
    // Scenario 2: Missing Student ID
    // =========================================================================
    [Fact]
    public async Task CreateHold_MissingStudentIdHeader_Returns400BadRequest()
    {
        // Arrange
        var testClass = await CreateTestClassAsync(totalSeats: 10, "Hold Missing StudentId");

        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        request.Content = JsonContent.Create(new { });

        // Act (no X-Student-Id header provided)
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // =========================================================================
    // Scenario 3: Invalid Student ID length
    // =========================================================================
    [Theory]
    [InlineData("12345")]                   // Too short (5 digits)
    [InlineData("1234567890123456")]       // 16 digits
    [InlineData("123456789012345678")]     // Too long (18 digits)
    public async Task CreateHold_InvalidStudentIdLength_Returns400BadRequest(string invalidStudentId)
    {
        // Arrange
        var testClass = await CreateTestClassAsync(totalSeats: 10, "Hold Invalid Length");

        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        request.Headers.Add("X-Student-Id", invalidStudentId);
        request.Content = JsonContent.Create(new { });

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // =========================================================================
    // Scenario 4: Non-numeric Student ID
    // =========================================================================
    [Theory]
    [InlineData("2015269123456789A")]      // Letter in 17-char string
    [InlineData("2015269123456789-")]      // Hyphen
    [InlineData(" 0152691234567890")]      // Leading space
    [InlineData("2015269123456789 ")]      // Trailing space
    public async Task CreateHold_NonNumericStudentId_Returns400BadRequest(string nonNumericStudentId)
    {
        // Arrange
        var testClass = await CreateTestClassAsync(totalSeats: 10, "Hold Non-Numeric");

        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        request.Headers.Add("X-Student-Id", nonNumericStudentId);
        request.Content = JsonContent.Create(new { });

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // =========================================================================
    // Scenario 5: Nonexistent class
    // =========================================================================
    [Fact]
    public async Task CreateHold_NonexistentClass_Returns404NotFound()
    {
        // Arrange
        var nonExistentClassId = Guid.NewGuid();
        var studentId = GenerateStudentId();

        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{nonExistentClassId}/holds");
        request.Headers.Add("X-Student-Id", studentId);
        request.Content = JsonContent.Create(new { });

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // =========================================================================
    // Scenario 6: No available seats
    // =========================================================================
    [Fact]
    public async Task CreateHold_NoAvailableSeats_Returns409Conflict()
    {
        // Arrange: Class with strictly 1 seat
        var testClass = await CreateTestClassAsync(totalSeats: 1, "Hold Capacity 1");
        var student1 = GenerateStudentId();
        var student2 = GenerateStudentId();

        // First hold consumes the only available seat
        using var req1 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        req1.Headers.Add("X-Student-Id", student1);
        req1.Content = JsonContent.Create(new { });
        var res1 = await _client.SendAsync(req1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Act: Second student attempts to hold a seat when availableSeats == 0
        using var req2 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        req2.Headers.Add("X-Student-Id", student2);
        req2.Content = JsonContent.Create(new { });
        var res2 = await _client.SendAsync(req2);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);
    }

    // =========================================================================
    // Scenario 7: Student already has an active HELD application
    // =========================================================================
    [Fact]
    public async Task CreateHold_StudentAlreadyHasActiveHeldApplication_Returns409Conflict()
    {
        // Arrange: Class with plenty of seats
        var testClass = await CreateTestClassAsync(totalSeats: 10, "Student Repeated Hold");
        var studentId = GenerateStudentId();

        // First hold succeeds
        using var req1 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        req1.Headers.Add("X-Student-Id", studentId);
        req1.Content = JsonContent.Create(new { });
        var res1 = await _client.SendAsync(req1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Act: Same student attempts to create another hold in the same class
        using var req2 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        req2.Headers.Add("X-Student-Id", studentId);
        req2.Content = JsonContent.Create(new { });
        var res2 = await _client.SendAsync(req2);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);
    }

    // =========================================================================
    // Scenario 8: Student already has a CONFIRMED application
    // =========================================================================
    [Fact]
    public async Task CreateHold_StudentAlreadyHasConfirmedApplication_Returns409Conflict()
    {
        // Arrange: Seed a confirmed application for this student directly in DB
        var testClass1 = await CreateTestClassAsync(totalSeats: 10, "Class With Confirmed");
        var testClass2 = await CreateTestClassAsync(totalSeats: 10, "Class for New Application");
        var studentId = GenerateStudentId();

        await using (var db = GetDbContext())
        {
            var now = DateTime.UtcNow;
            db.AdmissionHolds.Add(new AdmissionHold
            {
                Id = Guid.NewGuid(),
                ClassId = testClass1.Id,
                StudentId = studentId,
                Status = AdmissionHoldStatus.CONFIRMED,
                CreatedAt = now.AddHours(-1),
                ExpiresAt = now.AddMinutes(30),
                ConfirmedAt = now.AddMinutes(-30)
            });
            await db.SaveChangesAsync();
        }

        // Act: Student attempts to create a hold in Class 2
        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass2.Id}/holds");
        request.Headers.Add("X-Student-Id", studentId);
        request.Content = JsonContent.Create(new { });
        var response = await _client.SendAsync(request);

        // Assert: 409 Conflict because student already has a confirmed admission
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    // =========================================================================
    // Scenario 9: Expired previous hold allows a new application
    // =========================================================================
    [Fact]
    public async Task CreateHold_ExpiredPreviousHold_AllowsNewApplication()
    {
        // Arrange: Seed an expired hold for this student in DB
        var testClass1 = await CreateTestClassAsync(totalSeats: 10, "Class With Expired");
        var testClass2 = await CreateTestClassAsync(totalSeats: 10, "Class For New Application");
        var studentId = GenerateStudentId();

        var expiredHoldId = Guid.NewGuid();
        await using (var db = GetDbContext())
        {
            var now = DateTime.UtcNow;
            db.AdmissionHolds.Add(new AdmissionHold
            {
                Id = expiredHoldId,
                ClassId = testClass1.Id,
                StudentId = studentId,
                Status = AdmissionHoldStatus.HELD,
                CreatedAt = now.AddMinutes(-30),
                ExpiresAt = now.AddMinutes(-10) // Expired 10 minutes ago
            });
            await db.SaveChangesAsync();
        }

        // Act: Student applies for Class 2
        using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass2.Id}/holds");
        request.Headers.Add("X-Student-Id", studentId);
        request.Content = JsonContent.Create(new { });
        var response = await _client.SendAsync(request);

        // Assert: Successfully created!
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<CreateHoldResponseDto>();
        Assert.NotNull(created);
        Assert.Equal("HELD", created.Status);
        Assert.Equal(testClass2.Id, created.ClassId);

        // Verify the old hold status was updated to EXPIRED
        await using (var db = GetDbContext())
        {
            var oldHold = await db.AdmissionHolds.FindAsync(expiredHoldId);
            Assert.NotNull(oldHold);
            Assert.Equal(AdmissionHoldStatus.EXPIRED, oldHold.Status);
        }
    }

    // =========================================================================
    // Scenario 10: Expired hold is returned as EXPIRED
    // =========================================================================
    [Fact]
    public async Task GetHoldById_ExpiredHold_ReturnsStatusExpiredAndUpdatesDatabase()
    {
        // Arrange: Create a valid hold first
        var testClass = await CreateTestClassAsync(totalSeats: 10, "Hold Expiration Test");
        var studentId = GenerateStudentId();

        using var createReq = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
        createReq.Headers.Add("X-Student-Id", studentId);
        createReq.Content = JsonContent.Create(new { });
        var createRes = await _client.SendAsync(createReq);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var createdDto = await createRes.Content.ReadFromJsonAsync<CreateHoldResponseDto>();
        Assert.NotNull(createdDto);

        // Backdate ExpiresAt in the database to simulate expiration
        await using (var db = GetDbContext())
        {
            var dbHold = await db.AdmissionHolds.FindAsync(createdDto.HoldId);
            Assert.NotNull(dbHold);
            dbHold.ExpiresAt = DateTime.UtcNow.AddSeconds(-10); // Expired 10s ago
            await db.SaveChangesAsync();
        }

        // Act: Retrieve hold details via GET /holds/{holdId}
        var getRes = await _client.GetAsync($"/holds/{createdDto.HoldId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
        var holdDetails = await getRes.Content.ReadFromJsonAsync<HoldDetailsResponseDto>();
        Assert.NotNull(holdDetails);
        Assert.Equal("EXPIRED", holdDetails.Status);

        // Verify database row status was updated to EXPIRED
        await using (var db = GetDbContext())
        {
            var updatedDbHold = await db.AdmissionHolds.FindAsync(createdDto.HoldId);
            Assert.NotNull(updatedDbHold);
            Assert.Equal(AdmissionHoldStatus.EXPIRED, updatedDbHold.Status);
        }
    }

    [Fact]
    public async Task GetHoldById_NonexistentHold_Returns404NotFound()
    {
        // Act
        var response = await _client.GetAsync($"/holds/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // =========================================================================
    // Scenario 11: Two simultaneous requests for the last available seat: exactly one must succeed
    // =========================================================================
    [Fact]
    public async Task CreateHold_TwoSimultaneousRequestsForLastSeat_ExactlyOneSucceeds()
    {
        // Arrange: Class with exactly 1 total seat
        var testClass = await CreateTestClassAsync(totalSeats: 1, "Concurrency 1 Seat");
        var student1 = GenerateStudentId();
        var student2 = GenerateStudentId();

        var client1 = _factory.CreateClient();
        var client2 = _factory.CreateClient();

        Func<HttpClient, string, Task<HttpResponseMessage>> sendHoldRequest = async (httpClient, studentId) =>
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, $"/classes/{testClass.Id}/holds");
            req.Headers.Add("X-Student-Id", studentId);
            req.Content = JsonContent.Create(new { });
            return await httpClient.SendAsync(req);
        };

        // Act: Fire both requests simultaneously
        var task1 = sendHoldRequest(client1, student1);
        var task2 = sendHoldRequest(client2, student2);

        var responses = await Task.WhenAll(task1, task2);

        // Assert: Exactly one 201 Created and exactly one 409 Conflict
        var createdCount = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
        var conflictCount = responses.Count(r => r.StatusCode == HttpStatusCode.Conflict);

        Assert.Equal(1, createdCount);
        Assert.Equal(1, conflictCount);

        // Verify class dynamic seat calculations
        var classRes = await _client.GetAsync($"/classes/{testClass.Id}");
        var classDto = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(classDto);
        Assert.Equal(1, classDto.TotalSeats);
        Assert.Equal(1, classDto.HeldSeats);
        Assert.Equal(0, classDto.AvailableSeats);

        // Verify in database: Exactly 1 hold exists for this class
        await using var db = GetDbContext();
        var holdCount = await db.AdmissionHolds.CountAsync(h => h.ClassId == testClass.Id);
        Assert.Equal(1, holdCount);
    }

    // =========================================================================
    // Scenario 12: Simultaneous requests by the same student to two different classes: at most one active hold must be created
    // =========================================================================
    [Fact]
    public async Task CreateHold_SimultaneousRequestsBySameStudentToDifferentClasses_AtMostOneActiveHoldCreated()
    {
        // Arrange: Two distinct classes, each with available seats
        var testClassA = await CreateTestClassAsync(totalSeats: 5, "Class A Different");
        var testClassB = await CreateTestClassAsync(totalSeats: 5, "Class B Different");
        var studentId = GenerateStudentId();

        var client1 = _factory.CreateClient();
        var client2 = _factory.CreateClient();

        Func<HttpClient, Guid, Task<HttpResponseMessage>> sendHoldRequest = async (httpClient, classId) =>
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
            req.Headers.Add("X-Student-Id", studentId);
            req.Content = JsonContent.Create(new { });
            return await httpClient.SendAsync(req);
        };

        // Act: Fire requests for the same student to two different classes simultaneously
        var task1 = sendHoldRequest(client1, testClassA.Id);
        var task2 = sendHoldRequest(client2, testClassB.Id);

        var responses = await Task.WhenAll(task1, task2);

        // Assert: At most one succeeded with 201 Created; the other must be 409 Conflict
        var createdCount = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
        var conflictCount = responses.Count(r => r.StatusCode == HttpStatusCode.Conflict);

        Assert.Equal(1, createdCount);
        Assert.Equal(1, conflictCount);

        // Verify database: Exactly 1 active hold exists across the entire database for this student
        await using var db = GetDbContext();
        var activeHolds = await db.AdmissionHolds
            .Where(h => h.StudentId == studentId && (h.Status == AdmissionHoldStatus.HELD || h.Status == AdmissionHoldStatus.CONFIRMED))
            .ToListAsync();

        Assert.Single(activeHolds);
    }
}
