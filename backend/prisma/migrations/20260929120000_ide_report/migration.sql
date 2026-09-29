-- CreateEnum
CREATE TYPE "IdeReportCategory" AS ENUM ('BUG', 'CONFUSING', 'FEATURE_REQUEST', 'OTHER');
-- CreateEnum
CREATE TYPE "IdeReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX');
-- CreateTable
CREATE TABLE "IdeReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "category" "IdeReportCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "diagnostics" JSONB,
    "status" "IdeReportStatus" NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IdeReport_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "IdeReport_status_createdAt_idx" ON "IdeReport"("status", "createdAt");
-- CreateIndex
CREATE INDEX "IdeReport_userId_createdAt_idx" ON "IdeReport"("userId", "createdAt");
-- AddForeignKey
ALTER TABLE "IdeReport" ADD CONSTRAINT "IdeReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
