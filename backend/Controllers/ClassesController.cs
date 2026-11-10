namespace SchoolAdmissionAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Services;

/// <summary>
/// API Controller for Admission Class management.
/// Handles HTTP request binding, status codes, and delegates business logic to IClassService.
/// </summary>
[ApiController]
[Route("classes")]
[Produces("application/json")]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;
    private readonly ILogger<ClassesController> _logger;

    public ClassesController(IClassService classService, ILogger<ClassesController> logger)
    {
        _classService = classService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new admission class option (e.g. "Class 6 - Morning Shift").
    /// </summary>
    /// <param name="request">Class name and total seat capacity.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>HTTP 201 Created with the newly created class object.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ClassResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateClass(
        [FromBody] CreateClassRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdClass = await _classService.CreateClassAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetClassById),
            new { classId = createdClass.Id },
            createdClass);
    }

    /// <summary>
    /// Retrieves all admission classes with dynamic real-time seat availability.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>HTTP 200 OK with list of all admission classes.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ClassResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClasses(CancellationToken cancellationToken)
    {
        var classes = await _classService.GetAllClassesAsync(cancellationToken);
        return Ok(classes);
    }

    /// <summary>
    /// Retrieves a single admission class by ID with real-time seat availability.
    /// </summary>
    /// <param name="classId">Unique UUID of the admission class.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>HTTP 200 OK if found, or HTTP 404 Not Found if the class does not exist.</returns>
    [HttpGet("{classId:guid}")]
    [ProducesResponseType(typeof(ClassResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClassById(
        [FromRoute] Guid classId,
        CancellationToken cancellationToken)
    {
        var admissionClass = await _classService.GetClassByIdAsync(classId, cancellationToken);
        if (admissionClass == null)
        {
            return NotFound(new
            {
                error = "Not Found",
                message = $"Admission class with ID '{classId}' was not found."
            });
        }

        return Ok(admissionClass);
    }
}
