-- AlterTable
ALTER TABLE "AvailabilityLink" ALTER COLUMN "step" SET DEFAULT 'VENUE';

-- CreateIndex
CREATE UNIQUE INDEX "VenueOption_matchId_venueId_key" ON "VenueOption"("matchId", "venueId");

