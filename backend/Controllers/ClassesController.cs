namespace SchoolAdmissionAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using SchoolAdmissionAPI.DTOs;
using SchoolAdmissionAPI.Services;

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

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ClassResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClasses(CancellationToken cancellationToken)
    {
        var classes = await _classService.GetAllClassesAsync(cancellationToken);
        return Ok(classes);
    }

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
