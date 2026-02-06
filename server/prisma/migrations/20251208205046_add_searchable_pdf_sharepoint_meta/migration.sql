/*
  Warnings:

  - You are about to drop the column `searchablePdfBase64` on the `documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "documents" DROP COLUMN "searchablePdfBase64",
ADD COLUMN     "searchableDriveId" TEXT,
ADD COLUMN     "searchableItemId" TEXT;
