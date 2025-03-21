/*
  Warnings:

  - You are about to drop the column `observations` on the `animals` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_animals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "breed" TEXT,
    "birthDate" DATETIME,
    "weight" REAL,
    "cattleStatus" TEXT NOT NULL DEFAULT 'SOLTEIRA',
    "avaliacao" TEXT,
    "gestationalAge" INTEGER,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "farmId" TEXT NOT NULL,
    CONSTRAINT "animals_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_animals" ("avaliacao", "birthDate", "breed", "cattleStatus", "createdAt", "deletedAt", "farmId", "gestationalAge", "id", "identifier", "updatedAt", "weight") SELECT "avaliacao", "birthDate", "breed", "cattleStatus", "createdAt", "deletedAt", "farmId", "gestationalAge", "id", "identifier", "updatedAt", "weight" FROM "animals";
DROP TABLE "animals";
ALTER TABLE "new_animals" RENAME TO "animals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
