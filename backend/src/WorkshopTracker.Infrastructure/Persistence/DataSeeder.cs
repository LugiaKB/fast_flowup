using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(WorkshopTrackerDbContext database, CancellationToken cancellationToken = default)
    {
        // Se já existem registros, não duplica o seed
        if (await database.Colaboradores.AnyAsync(cancellationToken))
        {
            return;
        }

        var baseTime = new DateTimeOffset(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);

        // 1. Criar Colaboradores Realistas
        var ana = Colaborador.Create("Ana Beatriz", baseTime.AddDays(7));
        var carlos = Colaborador.Create("Carlos Eduardo", baseTime.AddDays(8));
        var fernanda = Colaborador.Create("Fernanda Lima", baseTime.AddDays(9));
        var gabriel = Colaborador.Create("Gabriel Souza", baseTime.AddDays(10));
        var helena = Colaborador.Create("Helena Martins", baseTime.AddDays(11));
        var joao = Colaborador.Create("João Pedro", baseTime.AddDays(12));
        var larissa = Colaborador.Create("Larissa Gomes", baseTime.AddDays(13));
        var rafael = Colaborador.Create("Rafael Costa", baseTime.AddDays(14));
        
        var marinaArquivada = Colaborador.Create("Marina Arquivada", baseTime.AddDays(15));
        marinaArquivada.Archive(baseTime.AddDays(32));

        var colaboradores = new[] { ana, carlos, fernanda, gabriel, helena, joao, larissa, rafael, marinaArquivada };
        await database.Colaboradores.AddRangeAsync(colaboradores, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);

        // 2. Criar Workshops Realistas (Quintas-feiras às 16h em America/Recife, cada um em um trimestre distinto)
        // 2026 Q3: 16 de Julho de 2026
        var w1 = Workshop.Create(
            "Comunicação que conecta",
            new DateTimeOffset(2026, 7, 16, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Práticas objetivas para colaboração entre equipes e alinhamento transparente.",
            baseTime.AddDays(10));
        w1.AddParticipant(ana, baseTime.AddDays(11));
        w1.AddParticipant(carlos, baseTime.AddDays(11));
        w1.AddParticipant(fernanda, baseTime.AddDays(11));
        w1.AddParticipant(gabriel, baseTime.AddDays(11));

        // 2026 Q2: 16 de Abril de 2026
        var w2 = Workshop.Create(
            "Feedback sem ruído",
            new DateTimeOffset(2026, 4, 16, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Como oferecer feedback claro, respeitoso e acionável para impulsionar o desenvolvimento.",
            baseTime.AddDays(12));
        w2.AddParticipant(ana, baseTime.AddDays(13));
        w2.AddParticipant(helena, baseTime.AddDays(13));
        w2.AddParticipant(joao, baseTime.AddDays(13));

        // 2026 Q1: 15 de Janeiro de 2026
        var w3 = Workshop.Create(
            "Planejamento colaborativo",
            new DateTimeOffset(2026, 1, 15, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Práticas para alinhar objetivos estratégicos e responsabilidades em equipe.",
            baseTime.AddDays(1));

        // 2025 Q4: 16 de Outubro de 2025
        var w4 = Workshop.Create(
            "Segurança psicológica",
            new DateTimeOffset(2025, 10, 16, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Construção de ambientes seguros para diálogo aberto, aprendizado contínuo e inovação.",
            baseTime.AddDays(-60));
        w4.AddParticipant(larissa, baseTime.AddDays(-55));
        w4.AddParticipant(rafael, baseTime.AddDays(-55));

        // 2025 Q3: 17 de Julho de 2025
        var w5 = Workshop.Create(
            "Decisões orientadas por dados",
            new DateTimeOffset(2025, 7, 17, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Uso de evidências e métricas para tomar decisões rápidas e alinhadas ao negócio.",
            baseTime.AddDays(-150));
        w5.AddParticipant(carlos, baseTime.AddDays(-140));
        w5.AddParticipant(fernanda, baseTime.AddDays(-140));
        w5.AddParticipant(larissa, baseTime.AddDays(-140));

        // 2025 Q2: 17 de Abril de 2025
        var w6 = Workshop.Create(
            "Facilitação de reuniões",
            new DateTimeOffset(2025, 4, 17, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Técnicas para conduzir encontros objetivos, inclusivos e com planos de ação claros.",
            baseTime.AddDays(-240));
        w6.AddParticipant(gabriel, baseTime.AddDays(-230));

        // 2025 Q1: 16 de Janeiro de 2025
        var w7 = Workshop.Create(
            "Gestão do tempo em equipe",
            new DateTimeOffset(2025, 1, 16, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Acordos práticos de trabalho para priorização, foco e produtividade sustentável.",
            baseTime.AddDays(-330));
        w7.AddParticipant(helena, baseTime.AddDays(-320));
        w7.AddParticipant(rafael, baseTime.AddDays(-320));

        var workshops = new[] { w1, w2, w3, w4, w5, w6, w7 };
        await database.Workshops.AddRangeAsync(workshops, cancellationToken);
        await database.SaveChangesAsync(cancellationToken);
    }
}
