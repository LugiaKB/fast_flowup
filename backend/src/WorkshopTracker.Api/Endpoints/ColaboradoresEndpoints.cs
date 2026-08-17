using WorkshopTracker.Application.Colaboradores;
using System.Security.Claims;

namespace WorkshopTracker.Api.Endpoints;

public static class ColaboradoresEndpoints
{
    public static IEndpointRouteBuilder MapColaboradoresEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/colaboradores", async (
            HttpRequest request,
            ClaimsPrincipal user,
            ListColaboradoresUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var validationErrors = ValidateQuery(request.Query, out var query);
            if (validationErrors.Count > 0)
            {
                return Results.ValidationProblem(validationErrors);
            }

            if (query!.Status != "active" && user.Identity?.IsAuthenticated != true)
            {
                return Unauthorized();
            }

            var result = await useCase.ExecuteAsync(query, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("listColaboradores")
        .WithTags("Colaboradores")
        .Produces<PagedColaboradores>()
        .ProducesValidationProblem();

        endpoints.MapGet("/api/colaboradores/{id:int}", async (
            int id,
            ClaimsPrincipal user,
            GetColaboradorUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var collaborator = await useCase.ExecuteAsync(id, user.Identity?.IsAuthenticated == true, cancellationToken);
            return collaborator is null
                ? Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Colaborador não encontrado", extensions: new Dictionary<string, object?> { ["code"] = "collaborator_not_found" })
                : Results.Ok(collaborator);
        })
        .WithName("getColaborador")
        .WithTags("Colaboradores")
        .Produces<ColaboradorResponse>()
        .Produces(StatusCodes.Status404NotFound);

        endpoints.MapPost("/api/colaboradores", async (
            ColaboradorInput input,
            ManageColaboradoresUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var result = await ExecuteAsync(async () => await useCase.CreateAsync(input.Nome, cancellationToken));
            return result is null
                ? ValidationProblem()
                : Results.Created($"/api/colaboradores/{result.Id}", ColaboradorResponse.FromDomain(result));
        })
        .WithName("createColaborador")
        .WithTags("Colaboradores")
        .RequireAuthorization()
        .Produces<ColaboradorResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem();

        endpoints.MapPut("/api/colaboradores/{id:int}", async (
            int id,
            ColaboradorInput input,
            ManageColaboradoresUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var result = await ExecuteAsync(() => useCase.UpdateAsync(id, input.Nome, cancellationToken));
            return result is null ? Results.NotFound() : Results.Ok(ColaboradorResponse.FromDomain(result));
        })
        .WithName("updateColaborador")
        .WithTags("Colaboradores")
        .RequireAuthorization()
        .Produces<ColaboradorResponse>()
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem();

        endpoints.MapDelete("/api/colaboradores/{id:int}", async (
            int id,
            ManageColaboradoresUseCase useCase,
            CancellationToken cancellationToken) =>
            await useCase.ArchiveAsync(id, cancellationToken) ? Results.NoContent() : Results.NotFound())
        .WithName("archiveColaborador")
        .WithTags("Colaboradores")
        .RequireAuthorization()
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        endpoints.MapPost("/api/colaboradores/{id:int}/restaurar", async (
            int id,
            ManageColaboradoresUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            var result = await useCase.RestoreAsync(id, cancellationToken);
            return result is null ? Results.NotFound() : Results.Ok(ColaboradorResponse.FromDomain(result));
        })
        .WithName("restoreColaborador")
        .WithTags("Colaboradores")
        .RequireAuthorization()
        .Produces<ColaboradorResponse>()
        .Produces(StatusCodes.Status404NotFound);

        return endpoints;
    }

    private static Dictionary<string, string[]> ValidateQuery(
        IQueryCollection values,
        out ListColaboradoresQuery? query)
    {
        query = null;
        var errors = new Dictionary<string, string[]>();
        var search = values["query"].ToString().Trim();
        var status = values["status"].ToString();
        if (string.IsNullOrEmpty(status)) status = "active";
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

        if (status is not ("active" or "archived" or "all"))
        {
            errors["status"] = ["O status deve ser active, archived ou all."];
        }

        if (errors.Count == 0)
        {
            query = new ListColaboradoresQuery(search, offset, limit, status);
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

    private static async Task<WorkshopTracker.Domain.Colaboradores.Colaborador?> ExecuteAsync(
        Func<Task<WorkshopTracker.Domain.Colaboradores.Colaborador?>> operation)
    {
        try
        {
            return await operation();
        }
        catch (WorkshopTracker.Domain.DomainValidationException)
        {
            return null;
        }
    }

    private static IResult ValidationProblem() => Results.ValidationProblem(new Dictionary<string, string[]>
    {
        ["nome"] = ["O nome do colaborador deve ter entre 1 e 160 caracteres."],
    });

    private static IResult Unauthorized() => Results.Problem(
        statusCode: StatusCodes.Status401Unauthorized,
        title: "Autenticação administrativa necessária",
        extensions: new Dictionary<string, object?> { ["code"] = "unauthorized" });

    public sealed record ColaboradorInput(string Nome);
}
