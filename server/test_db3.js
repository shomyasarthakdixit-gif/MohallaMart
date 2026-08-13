const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const searchTerms = ["bread", "butter", "jam", "eggs", "cheese"];
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: searchTerms.flatMap(term => [
        { name: { contains: term.toLowerCase() } },
        { name: { contains: term.charAt(0).toUpperCase() + term.slice(1).toLowerCase() } },
        { name: { contains: term.toUpperCase() } }
      ]),
    },
    include: {
      shop: { select: { name: true, id: true } }
    },
    take: 10,
  });
  console.log("Products:", JSON.stringify(products, null, 2));
}
run();
