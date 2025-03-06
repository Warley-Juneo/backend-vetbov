-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_protocols" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "technician" TEXT,
    "observations" TEXT,
    "result" TEXT,
    "presence" BOOLEAN NOT NULL DEFAULT true,
    "cycleId" TEXT,
    "nextProtocolDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "animalId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    CONSTRAINT "protocols_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "protocols_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_protocols" ("animalId", "createdAt", "date", "deletedAt", "farmId", "id", "nextProtocolDate", "observations", "result", "technician", "type", "updatedAt") SELECT "animalId", "createdAt", "date", "deletedAt", "farmId", "id", "nextProtocolDate", "observations", "result", "technician", "type", "updatedAt" FROM "protocols";
DROP TABLE "protocols";
ALTER TABLE "new_protocols" RENAME TO "protocols";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
