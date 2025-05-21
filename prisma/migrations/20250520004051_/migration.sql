-- CreateTable
CREATE TABLE "subscriptionHistory" (
    "id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptionHistory_pkey" PRIMARY KEY ("id")
);
