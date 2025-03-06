/*
  Warnings:

  - You are about to drop the column `gender` on the `animals` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "technician" TEXT,
    "observations" TEXT,
    "result" TEXT,
    "nextProtocolDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "animalId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    CONSTRAINT "protocols_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "protocols_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_animals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT,
    "birthDate" DATETIME,
    "weight" REAL,
    "cattleStatus" TEXT NOT NULL DEFAULT 'SOLTEIRA',
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "farmId" TEXT NOT NULL,
    CONSTRAINT "animals_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_animals" ("birthDate", "breed", "createdAt", "deletedAt", "farmId", "id", "identifier", "name", "observations", "status", "updatedAt", "weight") SELECT "birthDate", "breed", "createdAt", "deletedAt", "farmId", "id", "identifier", "name", "observations", "status", "updatedAt", "weight" FROM "animals";
DROP TABLE "animals";
ALTER TABLE "new_animals" RENAME TO "animals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
