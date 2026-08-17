namespace WorkshopTracker.Application.Common;

public sealed class Result
{
    private Result(bool isSuccess, Error? error)
    {
        IsSuccess = isSuccess;
        Error = error!;
    }

    public bool IsSuccess { get; }

    public Error Error { get; } = null!;

    public static Result Success() => new(true, null);

    public static Result Failure(Error error) => new(false, error ?? throw new ArgumentNullException(nameof(error)));
}
