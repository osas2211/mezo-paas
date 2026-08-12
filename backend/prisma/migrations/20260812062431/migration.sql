-- CreateEnum
CREATE TYPE "TreasuryOpType" AS ENUM ('MOVE_TO_YIELD', 'RETURN_FROM_YIELD', 'HARVEST_YIELD', 'EMERGENCY_WITHDRAW');

-- CreateTable
CREATE TABLE "YieldRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lockedAmount" TEXT NOT NULL,
    "yieldEarned" TEXT NOT NULL,
    "creditsAwarded" TEXT NOT NULL,
    "computeCharged" TEXT NOT NULL,
    "netCredits" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YieldRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryOperation" (
    "id" TEXT NOT NULL,
    "type" "TreasuryOpType" NOT NULL,
    "amount" TEXT NOT NULL,
    "txHash" TEXT,
    "yieldSource" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreasuryOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YieldRecord_userId_createdAt_idx" ON "YieldRecord"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "YieldRecord" ADD CONSTRAINT "YieldRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
