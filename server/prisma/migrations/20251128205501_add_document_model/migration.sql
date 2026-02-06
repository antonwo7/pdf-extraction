-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'admin');

-- CreateEnum
CREATE TYPE "UserSettingName" AS ENUM ('inputFolderId', 'outputFolderId');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'client',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user-settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" "UserSettingName" NOT NULL,
    "value" VARCHAR(512) NOT NULL,

    CONSTRAINT "user-settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "sharepointDriveId" TEXT NOT NULL,
    "sharepointItemId" TEXT NOT NULL,
    "sharepointSiteId" TEXT,
    "sharepointWebUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "contentType" TEXT,
    "documentType" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "data" JSONB,
    "rawText" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user-settings_user_id_name_key" ON "user-settings"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "documents_sharepointItemId_key" ON "documents"("sharepointItemId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_sharepointDriveId_sharepointItemId_idx" ON "documents"("sharepointDriveId", "sharepointItemId");

-- AddForeignKey
ALTER TABLE "user-settings" ADD CONSTRAINT "user-settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
