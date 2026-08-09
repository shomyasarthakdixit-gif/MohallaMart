const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = "admin@mohallamart.com";
    const password = "admin";
    const name = "Admin User";
    const role = "ADMIN";

    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log(`Admin user ${email} already exists.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role
      }
    });

    console.log(`Successfully created admin user: ${admin.email}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
