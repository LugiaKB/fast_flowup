using WorkshopTracker.Application.Colaboradores;

namespace WorkshopTracker.Api.Endpoints;

public static class ColaboradoresEndpoints
{
    public static IEndpointRouteBuilder MapColaboradoresEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/colaboradores", async (
            HttpRequest request,
            ListColaboradoresUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var validationErrors = ValidateQuery(request.Query, out var query);
            if (validationErrors.Count > 0)
            {
                return Results.ValidationProblem(validationErrors);
            }

            var result = await useCase.ExecuteAsync(query!, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("listColaboradores")
        .WithTags("Colaboradores")
        .Produces<PagedColaboradores>()
        .ProducesValidationProblem();

        return endpoints;
    }

    private static Dictionary<string, string[]> ValidateQuery(
        IQueryCollection values,
        out ListColaboradoresQuery? query)
    {
        query = null;
        var errors = new Dictionary<string, string[]>();
        var search = values["query"].ToString().Trim();
        if (search.Length > 200)
        {
            errors["query"] = ["A busca deve ter no máximo 200 caracteres."];
        }

        if (!TryParseInt(values["offset"], 0, out var offset) || offset < 0)
        {
            errors["offset"] = ["O deslocamento deve ser zero ou positivo."];
        }

        if (!TryParseInt(values["limit"], 20, out var limit) || limit is < 1 or > 100)
        {
            errors["limit"] = ["O limite deve estar entre 1 e 100."];
        }

        if (errors.Count == 0)
        {
            query = new ListColaboradoresQuery(search, offset, limit);
        }

        return errors;
    }

    private static bool TryParseInt(Microsoft.Extensions.Primitives.StringValues value, int fallback, out int parsed)
    {
        if (string.IsNullOrEmpty(value))
        {
            parsed = fallback;
            return true;
        }

        return int.TryParse(value, out parsed);
    }
}
