namespace SchoolAdmissionAPI.Controllers;

using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Services.Interfaces;

/// <summary>
/// API Controller for Admission Hold operations.
/// Exposes endpoints to reserve seats and inspect hold details.
/// </summary>
[ApiController]
[Produces("application/json")]
public class AdmissionHoldsController : ControllerBase
{
    private static readonly Regex StudentIdRegex = new(@"^[0-9]{17}$", RegexOptions.Compiled);

    private readonly IAdmissionHoldService _holdService;
    private readonly ILogger<AdmissionHoldsController> _logger;

    public AdmissionHoldsController(
        IAdmissionHoldService holdService,
        ILogger<AdmissionHoldsController> logger)
    {
        _holdService = holdService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a temporary admission seat hold for the specified class.
    /// Student ID must be supplied via the X-Student-Id header (exactly 17 numeric digits).
    /// </summary>
    /// <param name="classId">Admission class identifier (UUID).</param>
    /// <param name="studentId">17-digit student identifier from X-Student-Id header.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>HTTP 201 Created with the created hold details.</returns>
    [HttpPost("classes/{classId:guid}/holds")]
    [ProducesResponseType(typeof(CreateHoldResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateHold(
        [FromRoute] Guid classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId) || !StudentIdRegex.IsMatch(studentId))
        {
            return BadRequest(new
            {
                statusCode = StatusCodes.Status400BadRequest,
                error = "Bad Request",
                message = "Header 'X-Student-Id' is required and must contain exactly 17 numeric digits.",
                timestamp = DateTime.UtcNow
            });
        }

        var hold = await _holdService.CreateHoldAsync(classId, studentId, cancellationToken);

        return CreatedAtAction(
            nameof(GetHoldById),
            new { holdId = hold.HoldId },
            hold);
    }

    /// <summary>
    /// Retrieves details of an existing admission hold.
    /// If the hold has passed its expiration time, its status is automatically updated to EXPIRED.
    /// </summary>
    /// <param name="holdId">Unique hold identifier (UUID).</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>HTTP 200 OK with hold details, or HTTP 404 Not Found if hold does not exist.</returns>
    [HttpGet("holds/{holdId:guid}")]
    [ProducesResponseType(typeof(HoldDetailsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHoldById(
        [FromRoute] Guid holdId,
        CancellationToken cancellationToken)
    {
        var hold = await _holdService.GetHoldByIdAsync(holdId, cancellationToken);
        if (hold == null)
        {
            return NotFound(new
            {
                statusCode = StatusCodes.Status404NotFound,
                error = "Not Found",
                message = $"Admission hold with ID '{holdId}' was not found.",
                timestamp = DateTime.UtcNow
            });
        }

        return Ok(hold);
    }
}
