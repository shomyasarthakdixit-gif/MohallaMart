const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(identifier) {
  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });
    console.log(`User ${identifier} is now an ADMIN.`);
  } catch (error) {
    console.error(`Failed to make ${identifier} an admin. Make sure they have registered first!`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = process.argv[2] || "admin@mohallamart.com";
makeAdmin(targetEmail);
