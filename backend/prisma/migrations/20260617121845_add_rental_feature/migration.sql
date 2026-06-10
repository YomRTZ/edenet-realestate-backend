-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ACTIVE', 'ENDED', 'DEFAULTED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isForRent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRented" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monthlyRent" TEXT,
ADD COLUMN     "rentalDuration" INTEGER;

-- CreateTable
CREATE TABLE "RentalAgreement" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantWallet" TEXT NOT NULL,
    "landlordWallet" TEXT NOT NULL,
    "monthlyRent" TEXT NOT NULL,
    "faithDeposit" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "nextPaymentDue" TIMESTAMP(3) NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'ACTIVE',
    "terminatedBy" TEXT,
    "terminationReason" TEXT,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "wasLate" BOOLEAN NOT NULL DEFAULT false,
    "penaltyAmount" TEXT,
    "txHash" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalAgreement_propertyId_idx" ON "RentalAgreement"("propertyId");

-- CreateIndex
CREATE INDEX "RentalAgreement_tenantWallet_idx" ON "RentalAgreement"("tenantWallet");

-- CreateIndex
CREATE INDEX "RentalAgreement_landlordWallet_idx" ON "RentalAgreement"("landlordWallet");

-- CreateIndex
CREATE INDEX "RentPayment_rentalId_idx" ON "RentPayment"("rentalId");

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "RentalAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
