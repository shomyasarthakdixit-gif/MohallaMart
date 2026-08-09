import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Create a dummy shopkeeper user
  const shopkeeperUser = await prisma.user.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      phone: '+919999999999',
      role: 'SHOPKEEPER',
      name: 'Ramesh Sharma',
    },
  });

  console.log(`Created shopkeeper: ${shopkeeperUser.name}`);

  // 2. Create a dummy shop
  let shop = await prisma.shop.findFirst({
    where: { ownerId: shopkeeperUser.id },
  });

  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        ownerId: shopkeeperUser.id,
        name: 'Sharma General Store',
        description: 'Your trusted neighborhood grocery store since 2005.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Shop No 4, Main Market, Sector 15, Rohini',
        isActive: true,
        openTime: '09:00',
        closeTime: '22:00',
      },
    });
  }

  console.log(`Created shop: ${shop.name}`);

  // 3. Create Categories
  const categoriesData = [
    { name: 'Atta & Flours' },
    { name: 'Dairy & Bakery' },
    { name: 'Snacks & Biscuits' },
    { name: 'Beverages' },
    { name: 'Spices & Masalas' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
  }

  const allCategories = await prisma.category.findMany();

  // 4. Create Products
  const productsData = [
    { name: 'Aashirvaad Whole Wheat Atta 5kg', price: 250, description: 'Premium whole wheat atta.', imageUrl: null, categoryName: 'Atta & Flours' },
    { name: 'Amul Taaza Toned Milk 500ml', price: 27, description: 'Fresh toned milk.', imageUrl: null, categoryName: 'Dairy & Bakery' },
    { name: 'Britannia Good Day Cashew 600g', price: 120, description: 'Rich cashew cookies.', imageUrl: null, categoryName: 'Snacks & Biscuits' },
    { name: 'Maggi 2-Minute Noodles', price: 14, description: 'Classic instant noodles.', imageUrl: null, categoryName: 'Snacks & Biscuits' },
    { name: 'Tata Salt 1kg', price: 25, description: 'Iodized salt.', imageUrl: null, categoryName: 'Spices & Masalas' },
    { name: 'MDH Garam Masala 100g', price: 85, description: 'Authentic blend of spices.', imageUrl: null, categoryName: 'Spices & Masalas' },
  ];

  for (const prod of productsData) {
    const category = allCategories.find(c => c.name === prod.categoryName);
    if (!category) continue;

    await prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: category.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        isActive: true,
      }
    });
  }

  console.log(`Created products for ${shop.name}`);
  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
