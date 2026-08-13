const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany({ include: { shop: true } }).then(p => { 
  console.log(p.map(x => ({ name: x.name, shopStatus: x.shop.status, shopActive: x.shop.isActive, prodActive: x.isActive }))); 
  prisma.$disconnect(); 
});
