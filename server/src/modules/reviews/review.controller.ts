import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { shopId, productId, rating, comment } = req.body;

    if (!shopId && !productId) {
      return res.status(400).json({ message: "Must provide either shopId or productId" });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // In a real app, verify if the user has purchased the product/ordered from shop
    // For now, allow any logged-in user to review

    const review = await prisma.review.create({
      data: {
        userId,
        shopId: shopId || null,
        productId: productId || null,
        rating: Number(rating),
        comment
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });

    return res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getReviews = async (req: Request, res: Response): Promise<any> => {
  try {
    const { shopId, productId } = req.query;
    
    if (!shopId && !productId) {
      return res.status(400).json({ message: "Must provide shopId or productId to fetch reviews" });
    }

    const reviews = await prisma.review.findMany({
      where: {
        ...(shopId ? { shopId: String(shopId) } : {}),
        ...(productId ? { productId: String(productId) } : {})
      },
      include: {
        user: { select: { name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
