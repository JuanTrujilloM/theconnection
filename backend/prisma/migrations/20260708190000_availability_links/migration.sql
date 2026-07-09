-- CreateTable
CREATE TABLE "AvailabilityLink" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "step" TEXT NOT NULL DEFAULT 'AVAILABILITY',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityLink_tokenHash_key" ON "AvailabilityLink"("tokenHash");

-- CreateIndex
CREATE INDEX "AvailabilityLink_userId_idx" ON "AvailabilityLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityLink_matchId_userId_key" ON "AvailabilityLink"("matchId", "userId");

-- AddForeignKey
ALTER TABLE "AvailabilityLink" ADD CONSTRAINT "AvailabilityLink_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityLink" ADD CONSTRAINT "AvailabilityLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
