-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
