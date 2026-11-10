namespace SchoolAdmissionAPI.Exceptions;

/// <summary>
/// Exception thrown when a business conflict occurs (e.g. no seats available, student already has active application).
/// Translated to HTTP 409 Conflict by GlobalExceptionMiddleware.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
