using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class WorkshopTrackerDbContextFactory : IDesignTimeDbContextFactory<WorkshopTrackerDbContext>
{
    public WorkshopTrackerDbContext CreateDbContext(string[] args)
    {
        var provider = Environment.GetEnvironmentVariable("DATABASE__PROVIDER") ?? "Sqlite";
        var connectionString = Environment.GetEnvironmentVariable("CONNECTIONSTRINGS__DEFAULTCONNECTION")
            ?? "Data Source=workshop-tracker.db";
        var options = new DbContextOptionsBuilder<WorkshopTrackerDbContext>();

        if (string.Equals(provider, "MySql", StringComparison.OrdinalIgnoreCase))
        {
            options.UseMySQL(connectionString);
        }
        else
        {
            options.UseSqlite(connectionString);
        }

        return new WorkshopTrackerDbContext(options.Options);
    }
}
