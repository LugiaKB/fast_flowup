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

        endpoints.MapPost("/api/workshops", async (CreateWorkshopRequest request, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
            ToCommandResult(await ExecuteAsync(() => useCase.CreateAsync(request.Nome, request.DataRealizacao, request.Descricao, request.ColaboradorIds, cancellationToken)), true))
        .WithName("createWorkshop")
        .WithTags("Workshops")
        .RequireAuthorization()
        .Produces<WorkshopDetailResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status409Conflict);

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

        endpoints.MapPut("/api/workshops/{id:int}", async (int id, WorkshopInput request, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
            ToCommandResult(await ExecuteAsync(() => useCase.UpdateAsync(id, request.Nome, request.DataRealizacao, request.Descricao, cancellationToken)), false))
        .WithName("updateWorkshop")
        .WithTags("Workshops")
        .RequireAuthorization();

        endpoints.MapDelete("/api/workshops/{id:int}", async (int id, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
            await useCase.ArchiveAsync(id, cancellationToken) ? Results.NoContent() : NotFound())
        .WithName("archiveWorkshop")
        .WithTags("Workshops")
        .RequireAuthorization();

        endpoints.MapPost("/api/workshops/{id:int}/restaurar", async (int id, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
            ToCommandResult(await useCase.RestoreAsync(id, cancellationToken), false))
        .WithName("restoreWorkshop")
        .WithTags("Workshops")
        .RequireAuthorization();

        endpoints.MapPut("/api/workshops/{id:int}/participantes", async (int id, ReplaceParticipantesRequest request, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
            ToCommandResult(await useCase.ReplaceParticipantsAsync(id, request.ColaboradorIds, cancellationToken), false))
        .WithName("replaceParticipantes")
        .WithTags("Participantes")
        .RequireAuthorization();

        endpoints.MapPut("/api/workshops/{id:int}/participantes/{colaboradorId:int}", async (int id, int colaboradorId, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
        {
            var result = await useCase.AddParticipantAsync(id, colaboradorId, cancellationToken);
            return result.Error is null ? Results.NoContent() : ToCommandResult(result, false);
        })
        .WithName("addParticipante")
        .WithTags("Participantes")
        .RequireAuthorization();

        endpoints.MapDelete("/api/workshops/{id:int}/participantes/{colaboradorId:int}", async (int id, int colaboradorId, ManageWorkshopsUseCase useCase, CancellationToken cancellationToken) =>
            await useCase.RemoveParticipantAsync(id, colaboradorId, cancellationToken) ? Results.NoContent() : NotFound())
        .WithName("removeParticipante")
        .WithTags("Participantes")
        .RequireAuthorization();

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

    private static async Task<WorkshopResult> ExecuteAsync(Func<Task<WorkshopResult>> operation)
    {
        try { return await operation(); }
        catch (WorkshopTracker.Domain.DomainValidationException) { return new WorkshopResult(null, "validation"); }
    }

    private static IResult ToCommandResult(WorkshopResult result, bool created) => result.Error switch
    {
        null when created => Results.Created($"/api/workshops/{result.Workshop!.Id}", WorkshopDetailResponse.FromDomain(result.Workshop)),
        null => Results.Ok(WorkshopDetailResponse.FromDomain(result.Workshop!)),
        "not_found" => NotFound(),
        "quarter_conflict" => Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "Já existe um workshop ativo neste trimestre.", extensions: new Dictionary<string, object?> { ["code"] = "quarter_conflict" }),
        _ => Results.ValidationProblem(new Dictionary<string, string[]> { ["colaboradorIds"] = ["Os participantes devem ser colaboradores ativos e não duplicados."] }),
    };

    private static IResult NotFound() => Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Workshop não encontrado", extensions: new Dictionary<string, object?> { ["code"] = "workshop_not_found" });

    public sealed record WorkshopInput(string Nome, DateTimeOffset DataRealizacao, string Descricao);
    public sealed record CreateWorkshopRequest(string Nome, DateTimeOffset DataRealizacao, string Descricao, IReadOnlyCollection<int>? ColaboradorIds);
    public sealed record ReplaceParticipantesRequest(IReadOnlyCollection<int> ColaboradorIds);
}
