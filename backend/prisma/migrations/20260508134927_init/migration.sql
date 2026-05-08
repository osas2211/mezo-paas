-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Framework" ADD VALUE 'nuxtjs';
ALTER TYPE "Framework" ADD VALUE 'sveltejs';
ALTER TYPE "Framework" ADD VALUE 'remix';
ALTER TYPE "Framework" ADD VALUE 'angular';
ALTER TYPE "Framework" ADD VALUE 'gatsby';
ALTER TYPE "Framework" ADD VALUE 'sveltekit';
ALTER TYPE "Framework" ADD VALUE 'node';
