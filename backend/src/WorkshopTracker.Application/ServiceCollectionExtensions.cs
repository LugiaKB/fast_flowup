using Microsoft.Extensions.DependencyInjection;
using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Application.Workshops;

namespace WorkshopTracker.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ListColaboradoresUseCase>();
        services.AddScoped<ListWorkshopsUseCase>();
        services.AddScoped<GetWorkshopUseCase>();
        return services;
    }
}
