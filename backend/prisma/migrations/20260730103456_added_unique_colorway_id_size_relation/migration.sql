/*
  Warnings:

  - A unique constraint covering the columns `[colorwayId,size]` on the table `SneakerVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SneakerVariant_colorwayId_size_key" ON "SneakerVariant"("colorwayId", "size");
