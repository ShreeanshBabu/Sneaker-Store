/*
  Warnings:

  - You are about to drop the column `sneakerId` on the `SneakerImage` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `SneakerVariant` table. All the data in the column will be lost.
  - You are about to drop the column `sneakerId` on the `SneakerVariant` table. All the data in the column will be lost.
  - Added the required column `colorwayId` to the `SneakerImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorwayId` to the `SneakerVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SneakerImage" DROP CONSTRAINT "SneakerImage_sneakerId_fkey";

-- DropForeignKey
ALTER TABLE "SneakerVariant" DROP CONSTRAINT "SneakerVariant_sneakerId_fkey";

-- AlterTable
ALTER TABLE "SneakerImage" DROP COLUMN "sneakerId",
ADD COLUMN     "colorwayId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SneakerVariant" DROP COLUMN "color",
DROP COLUMN "sneakerId",
ADD COLUMN     "colorwayId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SneakerColorway" (
    "id" SERIAL NOT NULL,
    "sneakerId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,

    CONSTRAINT "SneakerColorway_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SneakerColorway" ADD CONSTRAINT "SneakerColorway_sneakerId_fkey" FOREIGN KEY ("sneakerId") REFERENCES "Sneaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SneakerVariant" ADD CONSTRAINT "SneakerVariant_colorwayId_fkey" FOREIGN KEY ("colorwayId") REFERENCES "SneakerColorway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SneakerImage" ADD CONSTRAINT "SneakerImage_colorwayId_fkey" FOREIGN KEY ("colorwayId") REFERENCES "SneakerColorway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
