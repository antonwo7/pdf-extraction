-- CreateEnum
CREATE TYPE "DocumentProcessingStep" AS ENUM ('DOWNLOADING', 'OCR', 'AI_EXTRACTION', 'SAVING_RESULTS');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "currentStep" "DocumentProcessingStep",
ADD COLUMN     "ocrJobId" TEXT;
