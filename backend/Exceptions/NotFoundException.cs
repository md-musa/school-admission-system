namespace SchoolAdmissionAPI.Exceptions;

/// <summary>
/// Exception thrown when a requested resource is not found.
/// Translated to HTTP 404 Not Found by GlobalExceptionMiddleware.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
