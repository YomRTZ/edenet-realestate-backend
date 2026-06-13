-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('Active', 'Terminated', 'Completed');

-- CreateTable
CREATE TABLE "rental_agreements" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "monthly_rent" TEXT NOT NULL,
    "deposit_amount" TEXT,
    "start_date" TIMESTAMP(3),
    "duration_months" INTEGER NOT NULL,
    "paid_months" INTEGER NOT NULL DEFAULT 0,
    "escrow_balance" TEXT,
    "status" "RentalStatus" NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rental_agreements_property_id_idx" ON "rental_agreements"("property_id");

-- CreateIndex
CREATE INDEX "rental_agreements_tenant_id_idx" ON "rental_agreements"("tenant_id");

-- CreateIndex
CREATE INDEX "rent_payments_agreement_id_idx" ON "rent_payments"("agreement_id");

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
