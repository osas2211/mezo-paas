/*
  Warnings:

  - You are about to drop the column `balance` on the `Wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "creditUsedThisMonth" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "dailyCreditCost" TEXT NOT NULL DEFAULT '0';

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "balance",
ADD COLUMN     "creditBalance" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "stakedBalance" TEXT NOT NULL DEFAULT '0';
