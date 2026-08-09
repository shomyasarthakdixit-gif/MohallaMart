import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting shops and related records...");
  
  // Need to delete dependent records first due to foreign key constraints
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.order.deleteMany({});
  
  // Now we can delete products and shops
  await prisma.product.deleteMany({});
  await prisma.shop.deleteMany({});
  
  console.log("Deleted all shops and their products/orders.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
