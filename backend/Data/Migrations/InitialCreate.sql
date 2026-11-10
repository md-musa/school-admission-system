CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261110173538_InitialCreate') THEN
    CREATE TABLE "AdmissionClasses" (
        "Id" uuid NOT NULL DEFAULT (gen_random_uuid()),
        "Name" character varying(150) NOT NULL,
        "TotalSeats" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_AdmissionClasses" PRIMARY KEY ("Id"),
        CONSTRAINT "CK_AdmissionClasses_TotalSeats_Positive" CHECK ("TotalSeats" > 0)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261110173538_InitialCreate') THEN
    CREATE TABLE "AdmissionHolds" (
        "Id" uuid NOT NULL DEFAULT (gen_random_uuid()),
        "ClassId" uuid NOT NULL,
        "StudentId" character varying(17) NOT NULL,
        "Status" character varying(20) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "ExpiresAt" timestamp with time zone NOT NULL,
        "ConfirmedAt" timestamp with time zone,
        "CancelledAt" timestamp with time zone,
        CONSTRAINT "PK_AdmissionHolds" PRIMARY KEY ("Id"),
        CONSTRAINT "CK_AdmissionHolds_Status_Valid" CHECK ("Status" IN ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED')),
        CONSTRAINT "CK_AdmissionHolds_StudentId_Format" CHECK ("StudentId" ~ '^[0-9]{17}$'),
        CONSTRAINT "FK_AdmissionHolds_AdmissionClasses_ClassId" FOREIGN KEY ("ClassId") REFERENCES "AdmissionClasses" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261110173538_InitialCreate') THEN
    CREATE INDEX "IX_AdmissionHolds_ClassId_Status" ON "AdmissionHolds" ("ClassId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261110173538_InitialCreate') THEN
    CREATE INDEX "IX_AdmissionHolds_Status_ExpiresAt" ON "AdmissionHolds" ("Status", "ExpiresAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261110173538_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_AdmissionHolds_StudentId_Active" ON "AdmissionHolds" ("StudentId") WHERE "Status" IN ('HELD', 'CONFIRMED');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261110173538_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261110173538_InitialCreate', '8.0.11');
    END IF;
END $EF$;
COMMIT;

