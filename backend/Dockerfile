FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/Directory.Packages.props backend/WorkshopTracker.slnx ./
COPY backend/src/WorkshopTracker.Domain/WorkshopTracker.Domain.csproj src/WorkshopTracker.Domain/
COPY backend/src/WorkshopTracker.Application/WorkshopTracker.Application.csproj src/WorkshopTracker.Application/
COPY backend/src/WorkshopTracker.Infrastructure/WorkshopTracker.Infrastructure.csproj src/WorkshopTracker.Infrastructure/
COPY backend/src/WorkshopTracker.Api/WorkshopTracker.Api.csproj src/WorkshopTracker.Api/
RUN dotnet restore src/WorkshopTracker.Api/WorkshopTracker.Api.csproj
COPY backend/ ./
RUN dotnet publish src/WorkshopTracker.Api/WorkshopTracker.Api.csproj --no-restore -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "WorkshopTracker.Api.dll"]
