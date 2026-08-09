import { Request, Response } from "express";
import { prisma } from "database";

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminShops = async (req: Request, res: Response) => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, shops });
  } catch (error) {
    console.error("Error fetching admin shops:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateShopStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const shop = await prisma.shop.update({
      where: { id },
      data: { status }
    });
    
    res.json({ success: true, shop });
  } catch (error) {
    console.error("Error updating shop status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        shop: { select: { name: true } },
        user: { select: { name: true, email: true } },
        payment: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent 100 for now
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalShops = await prisma.shop.count();
    const activeShops = await prisma.shop.count({ where: { status: 'APPROVED' } });
    const totalOrders = await prisma.order.count();
    
    const revenue = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    });

    res.json({ 
      success: true, 
      analytics: {
        totalUsers,
        totalShops,
        activeShops,
        totalOrders,
        totalRevenue: revenue._sum.amount || 0
      }
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
