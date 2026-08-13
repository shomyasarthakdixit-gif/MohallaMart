import { Request, Response } from "express";
import { prisma } from "database";

export const getNearbyShops = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    const shops = await prisma.shop.findMany({
      where: { status: "APPROVED", isActive: true },
      include: {
        owner: {
          select: { name: true, phone: true }
        }
      }
    });

    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      if (!isNaN(userLat) && !isNaN(userLng)) {
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          return R * c;
        };

        const nearbyShops = shops.filter(shop => {
          if (shop.latitude == null || shop.longitude == null) return false;
          const distance = calculateDistance(userLat, userLng, shop.latitude, shop.longitude);
          const radius = shop.deliveryRadius || 5; // default 5km
          // Only return shops if the user is within their delivery radius
          return distance <= radius;
        });

        // Take top 10 nearest
        res.json({ success: true, shops: nearbyShops.slice(0, 10) });
        return;
      }
    }
    
    // Fallback if no location provided
    res.json({ success: true, shops: shops.slice(0, 10) });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getShopById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const shop = await prisma.shop.findFirst({
      where: { 
        id, 
        status: "APPROVED", 
        isActive: true 
      },
      include: {
        owner: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    res.json({ success: true, shop });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyShop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId }
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    res.json({ success: true, shop });
  } catch (error) {
    console.error("Error fetching my shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createShop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, address, description, openTime, closeTime } = req.body;

    if (!name || !address) {
      res.status(400).json({ success: false, message: "Name and address are required" });
      return;
    }

    // Check if shop already exists for this user
    let shop = await prisma.shop.findFirst({
      where: { ownerId: userId }
    });

    if (shop) {
      res.status(400).json({ success: false, message: "Shop already exists for this user" });
      return;
    }

    shop = await prisma.shop.create({
      data: {
        ownerId: userId,
        name,
        address,
        description: description || "",
        openTime: openTime || "09:00",
        closeTime: closeTime || "21:00",
        latitude: 28.6139, // Mocking coordinates for MVP
        longitude: 77.2090,
      }
    });

    res.status(201).json({ success: true, shop });
  } catch (error) {
    console.error("Error creating shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteShop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId }
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    await prisma.shop.delete({
      where: { id: shop.id }
    });

    res.json({ success: true, message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateMyShop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, address, description, openTime, closeTime, isActive, scheduledDeliveryFee, expressDeliveryFee, deliveryRadius, latitude, longitude } = req.body;

    let shop = await prisma.shop.findFirst({
      where: { ownerId: userId }
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    shop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        name: name !== undefined ? name : shop.name,
        address: address !== undefined ? address : shop.address,
        description: description !== undefined ? description : shop.description,
        openTime: openTime !== undefined ? openTime : shop.openTime,
        closeTime: closeTime !== undefined ? closeTime : shop.closeTime,
        isActive: isActive !== undefined ? isActive : shop.isActive,
        scheduledDeliveryFee: scheduledDeliveryFee !== undefined ? scheduledDeliveryFee : shop.scheduledDeliveryFee,
        expressDeliveryFee: expressDeliveryFee !== undefined ? expressDeliveryFee : shop.expressDeliveryFee,
        deliveryRadius: deliveryRadius !== undefined ? deliveryRadius : shop.deliveryRadius,
        latitude: latitude !== undefined ? latitude : shop.latitude,
        longitude: longitude !== undefined ? longitude : shop.longitude
      }
    });

    res.json({ success: true, shop });
  } catch (error) {
    console.error("Error updating my shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
