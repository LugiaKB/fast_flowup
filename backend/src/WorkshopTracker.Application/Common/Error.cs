namespace WorkshopTracker.Application.Common;

public sealed record Error(string Code, string Message, ErrorKind Kind)
{
    public static Error Validation(string code, string message) => new(code, message, ErrorKind.Validation);

    public static Error Conflict(string code, string message) => new(code, message, ErrorKind.Conflict);

    public static Error NotFound(string code, string message) => new(code, message, ErrorKind.NotFound);

    public static Error Unauthorized(string code, string message) => new(code, message, ErrorKind.Unauthorized);

    public static Error Unexpected(string code, string message) => new(code, message, ErrorKind.Unexpected);
}

public enum ErrorKind
{
    Validation,
    Conflict,
    NotFound,
    Unauthorized,
    Unexpected,
}
