using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class WorkshopTrackerDbContext(DbContextOptions<WorkshopTrackerDbContext> options)
    : DbContext(options)
{
    public DbSet<Colaborador> Colaboradores => Set<Colaborador>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var collaborator = modelBuilder.Entity<Colaborador>();
        collaborator.ToTable("Colaboradores");
        collaborator.HasKey(item => item.Id);
        collaborator.Property(item => item.Nome).HasMaxLength(160).IsRequired();
        collaborator.Property(item => item.CreatedAt).IsRequired();
        collaborator.Property(item => item.UpdatedAt).IsRequired();
        collaborator.HasIndex(item => item.Nome);
    }
}
