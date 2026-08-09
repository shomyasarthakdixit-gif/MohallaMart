const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shop = await prisma.shop.findFirst();
  if(!shop) {
    console.log('No shops found');
    return;
  }
  
  const c1 = await prisma.category.upsert({
    where: { name: 'Dairy' },
    update: {},
    create: { name: 'Dairy' }
  });
  
  const c2 = await prisma.category.upsert({
    where: { name: 'Snacks' },
    update: {},
    create: { name: 'Snacks' }
  });

  await prisma.product.create({
    data: { shopId: shop.id, categoryId: c1.id, name: 'Amul Taaza Toned Milk 500ml', price: 27, stock: 100 }
  });

  await prisma.product.create({
    data: { shopId: shop.id, categoryId: c1.id, name: 'Amul Butter 100g', price: 58, stock: 50 }
  });

  await prisma.product.create({
    data: { shopId: shop.id, categoryId: c2.id, name: 'Lays Magic Masala 50g', price: 20, stock: 200 }
  });

  console.log('Created mock products for shop:', shop.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
