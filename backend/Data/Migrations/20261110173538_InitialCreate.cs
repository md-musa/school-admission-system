using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolAdmissionAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdmissionClasses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    TotalSeats = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdmissionClasses", x => x.Id);
                    table.CheckConstraint("CK_AdmissionClasses_TotalSeats_Positive", "\"TotalSeats\" > 0");
                });

            migrationBuilder.CreateTable(
                name: "AdmissionHolds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    ClassId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdmissionHolds", x => x.Id);
                    table.CheckConstraint("CK_AdmissionHolds_Status_Valid", "\"Status\" IN ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED')");
                    table.CheckConstraint("CK_AdmissionHolds_StudentId_Format", "\"StudentId\" ~ '^[0-9]{17}$'");
                    table.ForeignKey(
                        name: "FK_AdmissionHolds_AdmissionClasses_ClassId",
                        column: x => x.ClassId,
                        principalTable: "AdmissionClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_ClassId_Status",
                table: "AdmissionHolds",
                columns: new[] { "ClassId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_Status_ExpiresAt",
                table: "AdmissionHolds",
                columns: new[] { "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_StudentId_Active",
                table: "AdmissionHolds",
                column: "StudentId",
                unique: true,
                filter: "\"Status\" IN ('HELD', 'CONFIRMED')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdmissionHolds");

            migrationBuilder.DropTable(
                name: "AdmissionClasses");
        }
    }
}
