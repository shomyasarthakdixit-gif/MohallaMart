const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const allProducts = await prisma.product.findMany({});
  console.log("Total Products:", allProducts.length);
  console.log("Names:", allProducts.map(p => p.name).join(", "));
}
run();
