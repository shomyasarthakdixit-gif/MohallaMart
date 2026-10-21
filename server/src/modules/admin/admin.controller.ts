import { Request, Response } from "express";
import { prisma } from "database";

import { getPagination, getPagingData } from "../../utils/pagination";

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const { skip, take, page, limit } = getPagination(req);
    // Safe max limit override
    const safeTake = Math.min(take, 1000);

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: safeTake,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    res.json({ 
      success: true, 
      users,
      pagination: getPagingData(totalItems, page, safeTake)
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminShops = async (req: Request, res: Response) => {
  try {
    const { skip, take, page, limit } = getPagination(req);
    const safeTake = Math.min(take, 1000);

    const [shops, totalItems] = await Promise.all([
      prisma.shop.findMany({
        skip,
        take: safeTake,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { products: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shop.count()
    ]);

    res.json({ 
      success: true, 
      shops,
      pagination: getPagingData(totalItems, page, safeTake)
    });
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
      where: { id: id as string },
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
    const { skip, take, page, limit } = getPagination(req);
    const safeTake = Math.min(take, 1000);

    const [orders, totalItems] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: safeTake,
        include: {
          shop: { select: { name: true } },
          user: { select: { name: true, email: true } },
          payment: true,
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count()
    ]);

    res.json({ 
      success: true, 
      orders,
      pagination: getPagingData(totalItems, page, safeTake)
    });
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
