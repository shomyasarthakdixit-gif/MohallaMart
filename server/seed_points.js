const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  await prisma.user.updateMany({
    data: {
      loyaltyPoints: 500 // Give everyone 500 points (25 Rs worth)
    }
  });

  console.log("Seeded 500 loyalty points to all users.");
}
run();
