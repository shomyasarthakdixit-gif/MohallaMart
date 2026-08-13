const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  await prisma.coupon.upsert({
    where: { code: "WELCOME50" },
    update: {},
    create: {
      code: "WELCOME50",
      discountType: "PERCENTAGE",
      discountValue: 50,
      minOrderAmount: 0
    }
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT100" },
    update: {},
    create: {
      code: "FLAT100",
      discountType: "FIXED",
      discountValue: 100,
      minOrderAmount: 200
    }
  });

  console.log("Coupons seeded: WELCOME50 (50% off), FLAT100 (₹100 off)");
}
run();
