import { Request, Response } from "express";
import { prisma } from "database";

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
