-- CreateTable
CREATE TABLE "DocumentRegion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "bboxX" DOUBLE PRECISION NOT NULL,
    "bboxY" DOUBLE PRECISION NOT NULL,
    "bboxWidth" DOUBLE PRECISION NOT NULL,
    "bboxHeight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DocumentRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentField" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT,
    "regionId" TEXT,
    "page" INTEGER,
    "bboxX" DOUBLE PRECISION,
    "bboxY" DOUBLE PRECISION,
    "bboxWidth" DOUBLE PRECISION,
    "bboxHeight" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "DocumentField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentRegion_documentId_idx" ON "DocumentRegion"("documentId");

-- CreateIndex
CREATE INDEX "DocumentField_documentId_idx" ON "DocumentField"("documentId");

-- CreateIndex
CREATE INDEX "DocumentField_documentId_page_idx" ON "DocumentField"("documentId", "page");

-- AddForeignKey
ALTER TABLE "DocumentRegion" ADD CONSTRAINT "DocumentRegion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentField" ADD CONSTRAINT "DocumentField_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentField" ADD CONSTRAINT "DocumentField_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "DocumentRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
