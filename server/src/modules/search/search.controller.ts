import { Request, Response } from "express";
import { prisma } from "database";

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q, lat, lng, type, categoryId, sortBy } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
      return;
    }

    const searchType = type === "shop" ? "shop" : "product";
    const userLat = lat ? parseFloat(lat as string) : null;
    const userLng = lng ? parseFloat(lng as string) : null;

    // 1. Find all active shops
    const allShops = await prisma.shop.findMany({
      where: { status: "APPROVED", isActive: true },
      include: {
        owner: { select: { name: true, phone: true } }
      }
    });

    // 2. Filter shops by delivery radius if location is provided
    let nearbyShopIds = allShops.map(s => s.id);
    let nearbyShops = allShops;

    if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
      nearbyShops = allShops.filter(shop => {
        if (shop.latitude == null || shop.longitude == null) return false;
        const distance = calculateDistance(userLat, userLng, shop.latitude, shop.longitude);
        const radius = shop.deliveryRadius || 5;
        return distance <= radius;
      });
      nearbyShopIds = nearbyShops.map(s => s.id);
    }

    // 3. Execute Search
    if (searchType === "shop") {
      // Search shops by name or description
      const matchedShops = nearbyShops.filter(shop => 
        shop.name.toLowerCase().includes(q.toLowerCase()) || 
        (shop.description && shop.description.toLowerCase().includes(q.toLowerCase()))
      );
      res.json({ success: true, type: "shop", results: matchedShops });
      return;
    } 
    
    if (searchType === "product") {
      // Search products that belong to the nearby shops
      const whereClause: any = {
        shopId: { in: nearbyShopIds },
        isActive: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } }
        ]
      };

      if (categoryId && typeof categoryId === "string") {
        whereClause.categoryId = categoryId;
      }

      let orderBy: any = undefined;
      if (sortBy === "price_asc") orderBy = { price: 'asc' };
      if (sortBy === "price_desc") orderBy = { price: 'desc' };

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          shop: { select: { name: true, id: true, address: true } }
        },
        orderBy
      });

      res.json({ success: true, type: "product", results: products });
      return;
    }

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
