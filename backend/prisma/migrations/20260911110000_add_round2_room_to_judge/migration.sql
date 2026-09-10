-- AlterTable
ALTER TABLE "Judge" ADD COLUMN     "round2RoomId" TEXT;

-- AddForeignKey
ALTER TABLE "Judge" ADD CONSTRAINT "Judge_round2RoomId_fkey" FOREIGN KEY ("round2RoomId") REFERENCES "Round2Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
