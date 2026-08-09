import { Request, Response } from "express";
import { prisma } from "database";

// Get User's Cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: {
                  select: { id: true, name: true, address: true, scheduledDeliveryFee: true, expressDeliveryFee: true }
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { shop: { select: { id: true, name: true, address: true, scheduledDeliveryFee: true, expressDeliveryFee: true } } } } } } }
      });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add or update item in cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
    
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!productId || typeof quantity !== "number") {
      return res.status(400).json({ success: false, message: "Invalid product data" });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      // If quantity is 0 or less, remove it
      if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: existingItem.id } });
      } else {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity }
        });
      }
    } else if (quantity > 0) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: { include: { product: { include: { shop: { select: { id: true, name: true, address: true } } } } } }
      }
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
