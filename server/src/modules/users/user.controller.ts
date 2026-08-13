import { Request, Response } from "express";
import { prisma } from "database";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        loyaltyPoints: true,
      }
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { text, lat, lng, type } = req.body;
    
    if (!text || lat === undefined || lng === undefined) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const address = await prisma.address.create({
      data: {
        userId,
        text,
        lat,
        lng,
        type: type || "Home"
      }
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    await prisma.address.delete({ where: { id } });
    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId, status: "DELIVERED" },
      include: {
        shop: { select: { id: true, name: true } },
        payment: { select: { amount: true } }
      }
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.payment?.amount || order.totalAmount), 0);

    // Calculate favorite shop
    const shopCounts: Record<string, { count: number; name: string }> = {};
    orders.forEach(order => {
      if (order.shop) {
        if (!shopCounts[order.shop.id]) {
          shopCounts[order.shop.id] = { count: 0, name: order.shop.name };
        }
        shopCounts[order.shop.id].count++;
      }
    });

    let favoriteShop = null;
    let maxCount = 0;
    for (const [id, data] of Object.entries(shopCounts)) {
      if (data.count > maxCount) {
        maxCount = data.count;
        favoriteShop = data.name;
      }
    }

    res.json({
      success: true,
      insights: {
        totalOrders,
        totalSpent,
        favoriteShop
      }
    });
  } catch (error) {
    console.error("Error fetching user insights:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
