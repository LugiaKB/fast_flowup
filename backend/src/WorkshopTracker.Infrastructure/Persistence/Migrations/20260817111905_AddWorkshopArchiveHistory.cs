using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkshopArchiveHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkshopArchiveEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkshopId = table.Column<int>(type: "INTEGER", nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    ArchivedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    ArchivedByAdminId = table.Column<string>(type: "TEXT", maxLength: 450, nullable: false),
                    ReplacementWorkshopId = table.Column<int>(type: "INTEGER", nullable: true),
                    RestoredAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkshopArchiveEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkshopArchiveEvents_WorkshopId",
                table: "WorkshopArchiveEvents",
                column: "WorkshopId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkshopArchiveEvents");
        }
    }
}
