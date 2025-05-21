-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NONE', 'PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NONE';
