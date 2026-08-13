const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const allProducts = await prisma.product.findMany({});
  allProducts.forEach(p => {
    console.log(`Product: ${p.name}, isActive: ${p.isActive}`);
  });
}
run();
