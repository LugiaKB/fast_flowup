using WorkshopTracker.Application.Workshops;

namespace WorkshopTracker.Api.Endpoints;

public static class WorkshopsEndpoints
{
    public static IEndpointRouteBuilder MapWorkshopsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/workshops", async (
            HttpRequest request,
            ListWorkshopsUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var errors = ValidateQuery(request.Query, out var query);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            return Results.Ok(await useCase.ExecuteAsync(query!, cancellationToken));
        })
        .WithName("listWorkshops")
        .WithTags("Workshops")
        .Produces<PagedWorkshops>()
        .ProducesValidationProblem();

        endpoints.MapGet("/api/workshops/{id:int}", async (
            int id,
            GetWorkshopUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            if (id < 1)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]> { ["id"] = ["O identificador deve ser positivo."] });
            }

            var workshop = await useCase.ExecuteAsync(id, cancellationToken);
            return workshop is null
                ? Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Workshop não encontrado",
                    type: "about:blank",
                    extensions: new Dictionary<string, object?> { ["code"] = "workshop_not_found" })
                : Results.Ok(workshop);
        })
        .WithName("getWorkshop")
        .WithTags("Workshops")
        .Produces<WorkshopDetailResponse>()
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem();

        return endpoints;
    }

    private static Dictionary<string, string[]> ValidateQuery(IQueryCollection values, out ListWorkshopsQuery? query)
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
            query = new ListWorkshopsQuery(search, offset, limit);
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
