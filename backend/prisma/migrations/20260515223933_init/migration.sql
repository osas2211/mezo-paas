-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "deploymentFinishedAt" TIMESTAMP(3),
ADD COLUMN     "deploymentStartedAt" TIMESTAMP(3);
