/*
  Warnings:

  - You are about to drop the column `animalId` on the `Manejos` table. All the data in the column will be lost.
  - You are about to drop the column `observations` on the `Manejos` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_AnimalToManejo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AnimalToManejo_A_fkey" FOREIGN KEY ("A") REFERENCES "animals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AnimalToManejo_B_fkey" FOREIGN KEY ("B") REFERENCES "Manejos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Manejos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "technician" TEXT,
    "result" TEXT,
    "presence" BOOLEAN NOT NULL DEFAULT true,
    "cycleId" TEXT NOT NULL,
    "nextManejoDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "farmId" TEXT NOT NULL,
    CONSTRAINT "Manejos_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manejos_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Manejos" ("createdAt", "cycleId", "date", "deletedAt", "farmId", "id", "nextManejoDate", "presence", "result", "technician", "type", "updatedAt") SELECT "createdAt", "cycleId", "date", "deletedAt", "farmId", "id", "nextManejoDate", "presence", "result", "technician", "type", "updatedAt" FROM "Manejos";
DROP TABLE "Manejos";
ALTER TABLE "new_Manejos" RENAME TO "Manejos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_AnimalToManejo_AB_unique" ON "_AnimalToManejo"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimalToManejo_B_index" ON "_AnimalToManejo"("B");
