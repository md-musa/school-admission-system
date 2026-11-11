namespace SchoolAdmissionAPI.Services;

using SchoolAdmissionAPI.DTOs;

public interface IClassService
{
    Task<ClassResponseDto> CreateClassAsync(CreateClassRequestDto request, CancellationToken cancellationToken = default);

    Task<IEnumerable<ClassResponseDto>> GetAllClassesAsync(CancellationToken cancellationToken = default);

    Task<ClassResponseDto?> GetClassByIdAsync(Guid classId, CancellationToken cancellationToken = default);
}
