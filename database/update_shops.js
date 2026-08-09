const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.shop.updateMany({
    data: {
      latitude: 16.4406,
      longitude: 80.6277,
      deliveryRadius: 50
    }
  });
  console.log('Updated shops');
}

update().catch(console.error).finally(() => prisma.$disconnect());
