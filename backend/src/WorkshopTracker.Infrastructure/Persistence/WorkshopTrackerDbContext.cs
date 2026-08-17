using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;
using WorkshopTracker.Domain.Authentication;
using WorkshopTracker.Infrastructure.Authentication;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class WorkshopTrackerDbContext(DbContextOptions<WorkshopTrackerDbContext> options)
    : IdentityDbContext<Administrator>(options)
{
    public DbSet<Colaborador> Colaboradores => Set<Colaborador>();
    public DbSet<Workshop> Workshops => Set<Workshop>();
    public DbSet<Participacao> Participacoes => Set<Participacao>();
    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();
    public DbSet<WorkshopArchiveEvent> WorkshopArchiveEvents => Set<WorkshopArchiveEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        var collaborator = modelBuilder.Entity<Colaborador>();
        collaborator.ToTable("Colaboradores");
        collaborator.HasKey(item => item.Id);
        collaborator.Property(item => item.Nome).HasMaxLength(160).IsRequired();
        collaborator.Property(item => item.CreatedAt).IsRequired();
        collaborator.Property(item => item.UpdatedAt).IsRequired();
        collaborator.HasIndex(item => item.Nome);

        var workshop = modelBuilder.Entity<Workshop>();
        workshop.ToTable("Workshops");
        workshop.HasKey(item => item.Id);
        workshop.Property(item => item.Nome).HasMaxLength(200).IsRequired();
        workshop.Property(item => item.Descricao).HasMaxLength(4000).IsRequired();
        workshop.Property(item => item.DataRealizacao)
            .HasConversion<DateTimeOffsetToBinaryConverter>()
            .IsRequired();
        workshop.Property(item => item.CreatedAt).IsRequired();
        workshop.Property(item => item.UpdatedAt).IsRequired();
        workshop.HasIndex(item => item.DataRealizacao);
        workshop.HasMany(item => item.Participacoes)
            .WithOne()
            .HasForeignKey(item => item.WorkshopId)
            .OnDelete(DeleteBehavior.Restrict);

        var attendance = modelBuilder.Entity<Participacao>();
        attendance.ToTable("Participacoes");
        attendance.HasKey(item => new { item.WorkshopId, item.ColaboradorId });
        attendance.Property(item => item.CreatedAt).IsRequired();
        attendance.HasOne(item => item.Colaborador)
            .WithMany()
            .HasForeignKey(item => item.ColaboradorId)
            .OnDelete(DeleteBehavior.Restrict);

        var refreshSession = modelBuilder.Entity<RefreshSession>();
        refreshSession.ToTable("RefreshSessions");
        refreshSession.HasKey(item => item.Id);
        refreshSession.Property(item => item.AdministratorId).HasMaxLength(450).IsRequired();
        refreshSession.Property(item => item.TokenHash).HasMaxLength(64).IsRequired();
        refreshSession.HasIndex(item => item.TokenHash).IsUnique();
        refreshSession.HasIndex(item => item.FamilyId);

        var archiveEvent = modelBuilder.Entity<WorkshopArchiveEvent>();
        archiveEvent.ToTable("WorkshopArchiveEvents");
        archiveEvent.HasKey(item => item.Id);
        archiveEvent.Property(item => item.ArchivedByAdminId).HasMaxLength(450).IsRequired();
        archiveEvent.Property(item => item.RestoredByAdminId).HasMaxLength(450);
        archiveEvent.Property(item => item.Reason).HasConversion<string>().HasMaxLength(32).IsRequired();
        archiveEvent.HasIndex(item => item.WorkshopId);
        archiveEvent.HasOne<Workshop>()
            .WithMany()
            .HasForeignKey(item => item.WorkshopId)
            .OnDelete(DeleteBehavior.Restrict);
        archiveEvent.HasOne<Workshop>()
            .WithMany()
            .HasForeignKey(item => item.ReplacementWorkshopId)
            .OnDelete(DeleteBehavior.Restrict);
        archiveEvent.HasOne<Administrator>()
            .WithMany()
            .HasForeignKey(item => item.ArchivedByAdminId)
            .OnDelete(DeleteBehavior.Restrict);
        archiveEvent.HasOne<Administrator>()
            .WithMany()
            .HasForeignKey(item => item.RestoredByAdminId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
