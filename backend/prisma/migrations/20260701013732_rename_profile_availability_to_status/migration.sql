-- Rename Profile.availability to Profile.status (preserves existing values).
ALTER TABLE "Profile" RENAME COLUMN "availability" TO "status";
