-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PartnerRole" AS ENUM ('HUSBAND', 'WIFE', 'PARTNER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'DOCUMENT', 'VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "placeOfBirth" TEXT,
    "placeOfDeath" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originFamilyId" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partnership" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "caption" TEXT,
    "date" TIMESTAMP(3),
    "personId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "personId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Person_name_idx" ON "Person"("name");

-- CreateIndex
CREATE INDEX "Person_dateOfBirth_idx" ON "Person"("dateOfBirth");

-- CreateIndex
CREATE UNIQUE INDEX "Partnership_personId_familyId_key" ON "Partnership"("personId", "familyId");

-- CreateIndex
CREATE INDEX "Media_personId_idx" ON "Media"("personId");

-- CreateIndex
CREATE INDEX "Event_personId_idx" ON "Event"("personId");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_originFamilyId_fkey" FOREIGN KEY ("originFamilyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
