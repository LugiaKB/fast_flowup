using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CompleteWorkshopArchiveHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RestoredByAdminId",
                table: "WorkshopArchiveEvents",
                type: "TEXT",
                maxLength: 450,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkshopArchiveEvents_ArchivedByAdminId",
                table: "WorkshopArchiveEvents",
                column: "ArchivedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkshopArchiveEvents_ReplacementWorkshopId",
                table: "WorkshopArchiveEvents",
                column: "ReplacementWorkshopId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkshopArchiveEvents_RestoredByAdminId",
                table: "WorkshopArchiveEvents",
                column: "RestoredByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkshopArchiveEvents_AspNetUsers_ArchivedByAdminId",
                table: "WorkshopArchiveEvents",
                column: "ArchivedByAdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkshopArchiveEvents_AspNetUsers_RestoredByAdminId",
                table: "WorkshopArchiveEvents",
                column: "RestoredByAdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkshopArchiveEvents_Workshops_ReplacementWorkshopId",
                table: "WorkshopArchiveEvents",
                column: "ReplacementWorkshopId",
                principalTable: "Workshops",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkshopArchiveEvents_Workshops_WorkshopId",
                table: "WorkshopArchiveEvents",
                column: "WorkshopId",
                principalTable: "Workshops",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkshopArchiveEvents_AspNetUsers_ArchivedByAdminId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkshopArchiveEvents_AspNetUsers_RestoredByAdminId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkshopArchiveEvents_Workshops_ReplacementWorkshopId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkshopArchiveEvents_Workshops_WorkshopId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropIndex(
                name: "IX_WorkshopArchiveEvents_ArchivedByAdminId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropIndex(
                name: "IX_WorkshopArchiveEvents_ReplacementWorkshopId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropIndex(
                name: "IX_WorkshopArchiveEvents_RestoredByAdminId",
                table: "WorkshopArchiveEvents");

            migrationBuilder.DropColumn(
                name: "RestoredByAdminId",
                table: "WorkshopArchiveEvents");
        }
    }
}
