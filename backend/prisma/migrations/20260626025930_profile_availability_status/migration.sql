-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "availability" SET DEFAULT 'SEARCHING';

-- availability changed meaning from comma-joined time slots to a matching status.
-- Reset any legacy value to SEARCHING so every row holds a valid status.
UPDATE "Profile" SET "availability" = 'SEARCHING' WHERE "availability" NOT IN ('SEARCHING', 'PAUSED');
