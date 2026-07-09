-- HU-07: record who rejected a match and when (analytics). Acceptance stays
-- implicit (derived from completing the availability + place flow).
-- AlterTable
ALTER TABLE "Match" ADD COLUMN "rejectedById" TEXT;
ALTER TABLE "Match" ADD COLUMN "rejectedAt" TIMESTAMP(3);
