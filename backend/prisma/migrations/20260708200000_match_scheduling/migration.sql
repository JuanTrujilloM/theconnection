-- HU-08: per-match scheduling state for the availability-overlap confirmation.
-- AlterTable
ALTER TABLE "Match" ADD COLUMN "scheduleAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Match" ADD COLUMN "scheduleDeadline" TIMESTAMP(3);
