namespace SchoolAdmissionAPI.Configuration;

/// <summary>
/// Configuration settings for the Admission System.
/// </summary>
public class AdmissionSettings
{
    public const string SectionName = "AdmissionSettings";

    /// <summary>
    /// Duration in seconds for which an admission seat hold remains valid.
    /// Defaults to 600 seconds (10 minutes).
    /// </summary>
    public int HoldDurationSeconds { get; set; } = 600;
}
