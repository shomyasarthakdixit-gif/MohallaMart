const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    where: {
      name: { contains: "bread", mode: "insensitive" }
    }
  });
  console.log("Insensitive:", products.length);

  const products2 = await prisma.product.findMany({
    where: {
      name: { contains: "bread" }
    }
  });
  console.log("Sensitive:", products2.length);

  const allProducts = await prisma.product.findMany({ take: 5 });
  console.log("Some products:", allProducts.map(p => p.name));
}
run();
