/*
  Warnings:

  - You are about to drop the `DocumentField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentRegion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentField" DROP CONSTRAINT "DocumentField_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentField" DROP CONSTRAINT "DocumentField_regionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRegion" DROP CONSTRAINT "DocumentRegion_documentId_fkey";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "searchablePdfBase64" TEXT;

-- DropTable
DROP TABLE "DocumentField";

-- DropTable
DROP TABLE "DocumentRegion";
