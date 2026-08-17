using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkshops : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Workshops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    DataRealizacao = table.Column<long>(type: "INTEGER", nullable: false),
                    Descricao = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: false),
                    ArchivedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workshops", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Participacoes",
                columns: table => new
                {
                    WorkshopId = table.Column<int>(type: "INTEGER", nullable: false),
                    ColaboradorId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participacoes", x => new { x.WorkshopId, x.ColaboradorId });
                    table.ForeignKey(
                        name: "FK_Participacoes_Colaboradores_ColaboradorId",
                        column: x => x.ColaboradorId,
                        principalTable: "Colaboradores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Participacoes_Workshops_WorkshopId",
                        column: x => x.WorkshopId,
                        principalTable: "Workshops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Participacoes_ColaboradorId",
                table: "Participacoes",
                column: "ColaboradorId");

            migrationBuilder.CreateIndex(
                name: "IX_Workshops_DataRealizacao",
                table: "Workshops",
                column: "DataRealizacao");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Participacoes");

            migrationBuilder.DropTable(
                name: "Workshops");
        }
    }
}
