-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('PENDING', 'MINTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DocumentFileType" AS ENUM ('IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('MINT', 'UPDATE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Government', 'Citizen');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(42) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Citizen',
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "is_tenant" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_nonces" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_nonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,
    "sha256Hash" VARCHAR(64) NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" "DocumentFileType" NOT NULL,
    "docType" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL DEFAULT 1,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metadata_versions" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "metadata_hash" VARCHAR(64) NOT NULL,
    "images_root_hash" VARCHAR(64) NOT NULL,
    "documents_root_hash" VARCHAR(64) NOT NULL,
    "metadata_snapshot" JSONB NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT NOT NULL,

    CONSTRAINT "metadata_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "ownerWallet" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "squareFeet" INTEGER NOT NULL DEFAULT 0,
    "parking" INTEGER NOT NULL DEFAULT 0,
    "floors" INTEGER NOT NULL DEFAULT 0,
    "yearBuilt" INTEGER NOT NULL DEFAULT 0,
    "price" TEXT NOT NULL,
    "description" TEXT,
    "metadataHash" VARCHAR(64),
    "imagesRootHash" VARCHAR(64),
    "documentsRootHash" VARCHAR(64),
    "chainHash" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "property_id" TEXT,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "metadata_hash" VARCHAR(64) NOT NULL,
    "images_root_hash" VARCHAR(64) NOT NULL,
    "documents_root_hash" VARCHAR(64) NOT NULL,
    "metadata_snapshot" JSONB NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "document_ids" TEXT[],
    "decline_reason" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "wallet_nonces_wallet_address_idx" ON "wallet_nonces"("wallet_address");

-- CreateIndex
CREATE INDEX "wallet_nonces_used_at_idx" ON "wallet_nonces"("used_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_nonces_wallet_address_nonce_key" ON "wallet_nonces"("wallet_address", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "documents_property_id_idx" ON "documents"("property_id");

-- CreateIndex
CREATE INDEX "documents_sha256Hash_idx" ON "documents"("sha256Hash");

-- CreateIndex
CREATE INDEX "metadata_versions_property_id_idx" ON "metadata_versions"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "metadata_versions_property_id_version_no_key" ON "metadata_versions"("property_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "properties_tokenId_key" ON "properties"("tokenId");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_submitted_by_idx" ON "requests"("submitted_by");

-- AddForeignKey
ALTER TABLE "wallet_nonces" ADD CONSTRAINT "wallet_nonces_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "users"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata_versions" ADD CONSTRAINT "metadata_versions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
