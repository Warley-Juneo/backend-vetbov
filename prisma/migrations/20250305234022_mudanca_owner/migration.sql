/*
  Warnings:

  - You are about to drop the column `ownerId` on the `farms` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_farms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "owner" TEXT
);
INSERT INTO "new_farms" ("address", "city", "country", "createdAt", "deletedAt", "id", "name", "postalCode", "state", "updatedAt") SELECT "address", "city", "country", "createdAt", "deletedAt", "id", "name", "postalCode", "state", "updatedAt" FROM "farms";
DROP TABLE "farms";
ALTER TABLE "new_farms" RENAME TO "farms";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
