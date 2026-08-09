const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetStock() {
  await prisma.product.updateMany({
    data: { stock: 100 }
  });
  console.log("Stock reset to 100 for all products");
}

resetStock().catch(console.error).finally(() => prisma.$disconnect());
