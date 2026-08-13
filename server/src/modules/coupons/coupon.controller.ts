import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined) {
      return res.status(400).json({ message: "Coupon code and order amount are required" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (Number(orderAmount) < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (Number(orderAmount) * coupon.discountValue) / 100;
      // Cap the discount for percentages if needed, but for now just apply
    } else {
      discountAmount = coupon.discountValue;
    }

    // Don't discount more than the order amount
    discountAmount = Math.min(discountAmount, Number(orderAmount));

    return res.status(200).json({ 
      message: "Coupon applied successfully", 
      coupon: {
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || "PERCENTAGE",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    return res.status(201).json({ message: "Coupon created", coupon });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
