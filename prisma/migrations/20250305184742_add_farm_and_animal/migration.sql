-- CreateTable
CREATE TABLE "farms" (
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
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "farms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT,
    "birthDate" DATETIME,
    "weight" REAL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "farmId" TEXT NOT NULL,
    CONSTRAINT "animals_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
