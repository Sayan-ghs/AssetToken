-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimarySale" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "totalCost" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrimarySale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swap" (
    "id" TEXT NOT NULL,
    "pool" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "tokenIn" TEXT NOT NULL,
    "tokenOut" TEXT NOT NULL,
    "amountIn" TEXT NOT NULL,
    "amountOut" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Swap_pkey" PRIMARY KEY ("id")
);
