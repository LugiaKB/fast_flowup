using WorkshopTracker.Infrastructure.Persistence;
using WorkshopTracker.Api.Endpoints;
using WorkshopTracker.Application;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var frontendOrigin = builder.Configuration["FrontendOrigin"]
    ?? throw new InvalidOperationException("FrontendOrigin é obrigatório.");

builder.Services.AddProblemDetails();
builder.Services.AddValidation();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddCors(options => options.AddPolicy("frontend", policy => policy
    .WithOrigins(frontendOrigin)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors("frontend");
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapColaboradoresEndpoints();

if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var database = scope.ServiceProvider.GetRequiredService<WorkshopTrackerDbContext>();
    await database.Database.MigrateAsync();
}

app.Run();

public partial class Program;
