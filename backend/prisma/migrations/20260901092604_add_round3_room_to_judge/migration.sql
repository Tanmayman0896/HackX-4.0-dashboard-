-- AlterEnum
ALTER TYPE "TeamStatus" ADD VALUE 'ROUND2_QUALIFIED';

-- AlterTable
ALTER TABLE "Judge" ADD COLUMN     "round3RoomId" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "round3RoomId" TEXT;

-- CreateTable
CREATE TABLE "Round3Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round3Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Round3Room_name_key" ON "Round3Room"("name");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_round3RoomId_fkey" FOREIGN KEY ("round3RoomId") REFERENCES "Round3Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judge" ADD CONSTRAINT "Judge_round3RoomId_fkey" FOREIGN KEY ("round3RoomId") REFERENCES "Round3Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
