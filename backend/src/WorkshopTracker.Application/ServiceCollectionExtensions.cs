using Microsoft.Extensions.DependencyInjection;
using WorkshopTracker.Application.Colaboradores;

namespace WorkshopTracker.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ListColaboradoresUseCase>();
        return services;
    }
}
