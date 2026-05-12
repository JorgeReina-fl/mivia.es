-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "activationCode" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';
