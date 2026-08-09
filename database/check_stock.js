const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStock() {
  const products = await prisma.product.findMany();
  console.log(JSON.stringify(products, null, 2));
}

checkStock().catch(console.error).finally(() => prisma.$disconnect());
