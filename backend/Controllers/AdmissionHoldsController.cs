namespace SchoolAdmissionAPI.Controllers;

using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Services.Interfaces;

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

    private IActionResult InvalidStudentIdResult() => BadRequest(new
    {
        statusCode = StatusCodes.Status400BadRequest,
        error = "Bad Request",
        message = "Header 'X-Student-Id' is required and must contain exactly 17 numeric digits.",
        timestamp = DateTime.UtcNow
    });

    private bool IsValidStudentId(string? id) =>
        !string.IsNullOrWhiteSpace(id) && StudentIdRegex.IsMatch(id);

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
        if (!IsValidStudentId(studentId))
            return InvalidStudentIdResult();

        var hold = await _holdService.CreateHoldAsync(classId, studentId!, cancellationToken);

        return CreatedAtAction(
            nameof(GetHoldById),
            new { holdId = hold.HoldId },
            hold);
    }

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

    [HttpPost("holds/{holdId:guid}/confirm")]
    [ProducesResponseType(typeof(ConfirmHoldResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ConfirmHold(
        [FromRoute] Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (!IsValidStudentId(studentId))
            return InvalidStudentIdResult();

        var result = await _holdService.ConfirmHoldAsync(holdId, studentId!, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("holds/{holdId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelHold(
        [FromRoute] Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (!IsValidStudentId(studentId))
            return InvalidStudentIdResult();

        await _holdService.CancelHoldAsync(holdId, studentId!, cancellationToken);
        return NoContent();
    }

    [HttpGet("me/holds")]
    [ProducesResponseType(typeof(IEnumerable<StudentApplicationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMyApplications(
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (!IsValidStudentId(studentId))
            return InvalidStudentIdResult();

        var applications = await _holdService.GetStudentApplicationsAsync(studentId!, cancellationToken);
        return Ok(applications);
    }
}
