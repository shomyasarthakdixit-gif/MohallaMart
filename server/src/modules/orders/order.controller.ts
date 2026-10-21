import { Request, Response } from "express";
import { prisma } from "database";
import { getPagination, getPagingData } from "../../utils/pagination";
import { paymentService } from "../payments/payment.service";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { deliveryType, paymentMethod, deliveryAddressId, couponCode, useLoyaltyPoints } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!deliveryAddressId) {
      res.status(400).json({ success: false, message: "Delivery address is required" });
      return;
    }

    const deliveryAddress = await prisma.address.findUnique({
      where: { id: deliveryAddressId }
    });

    if (!deliveryAddress || deliveryAddress.userId !== userId) {
      res.status(400).json({ success: false, message: "Invalid delivery address" });
      return;
    }

    // 1. Fetch user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { 
            product: {
              include: { shop: true }
            } 
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: "Cart is empty" });
      return;
    }

    // 2. Group items by shopId
    const itemsByShop: Record<string, typeof cart.items> = {};
    for (const item of cart.items) {
      const shopId = item.product.shopId;
      if (!itemsByShop[shopId]) itemsByShop[shopId] = [];
      itemsByShop[shopId].push(item);
    }

    let grandTotal = 0;
    const shopOrderData: any[] = [];

    // 3. Prepare order data and calculate grand total
    for (const shopId of Object.keys(itemsByShop)) {
      const shopItems = itemsByShop[shopId] || [];
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of shopItems) {
        totalAmount += item.product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        });
      }

      if (shopItems.length === 0) continue;
      const shop = shopItems[0]!.product.shop;

      // Delivery Radius Validation
      if (shop.latitude != null && shop.longitude != null && deliveryAddress.lat != null && deliveryAddress.lng != null) {
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

        const distance = calculateDistance(deliveryAddress.lat, deliveryAddress.lng, shop.latitude, shop.longitude);
        const radius = shop.deliveryRadius || 5;

        if (distance > radius) {
          res.status(400).json({ 
            success: false, 
            message: `Shop ${shop.name} does not deliver to your selected address. It is outside their ${radius}km delivery radius.` 
          });
          return;
        }
      }
      let deliveryFee = shop.scheduledDeliveryFee || 20; 
      if (deliveryType === "EXPRESS") {
        deliveryFee = shop.expressDeliveryFee || 50; 
      }
      totalAmount += deliveryFee;
      
      grandTotal += totalAmount;

      shopOrderData.push({
        shopId,
        totalAmount,
        orderItemsData
      });
    }

    let discountAmount = 0;
    
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (
        coupon && 
        coupon.isActive && 
        (!coupon.expiryDate || new Date() <= new Date(coupon.expiryDate)) && 
        grandTotal >= coupon.minOrderAmount
      ) {
         if (coupon.discountType === "PERCENTAGE") {
            discountAmount += (grandTotal * coupon.discountValue) / 100;
         } else {
            discountAmount += coupon.discountValue;
         }
      }
    }

    // Loyalty Points Logic
    let pointsToDeduct = 0;
    if (useLoyaltyPoints) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.loyaltyPoints > 0) {
        // 100 points = 5 Rupees (so 1 point = 0.05 Rupees)
        const pointsDiscount = user.loyaltyPoints * 0.05;
        // Don't discount more than the grandTotal
        if (pointsDiscount > grandTotal - discountAmount) {
          const maxDiscountPossible = grandTotal - discountAmount;
          pointsToDeduct = Math.floor(maxDiscountPossible / 0.05);
          discountAmount += maxDiscountPossible;
        } else {
          pointsToDeduct = user.loyaltyPoints;
          discountAmount += pointsDiscount;
        }
      }
    }

    discountAmount = Math.min(discountAmount, grandTotal);
    grandTotal -= discountAmount;

    let originalGrandTotal = grandTotal + discountAmount;

    let paymentOrder = null;
    if (paymentMethod === "ONLINE") {
      try {
        paymentOrder = await paymentService.getProvider().createOrder({
          amount: Math.round(grandTotal * 100), // in paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`
        });
      } catch (error) {
        console.error("Payment order creation failed:", error);
        return res.status(500).json({ success: false, message: "Payment initialization failed" });
      }
    }

    const createdOrders: any[] = [];
    
    // 4. Create DB orders and deduct stock securely via transaction
    try {
      await prisma.$transaction(async (tx) => {
        for (const shopData of shopOrderData) {
          // Pro-rata discount distribution
          if (discountAmount > 0) {
            const proportion = shopData.totalAmount / originalGrandTotal;
            shopData.totalAmount -= (discountAmount * proportion);
          }

          // Verify and Deduct stock atomically
          for (const item of shopData.orderItemsData) {
            const { count } = await tx.product.updateMany({
              where: { 
                id: item.productId,
                stock: { gte: item.quantity }
              },
              data: { stock: { decrement: item.quantity } }
            });

            if (count === 0) {
              const product = await tx.product.findUnique({ where: { id: item.productId } });
              throw new Error(`Insufficient stock for product: ${product?.name || item.productId}`);
            }
          }

          const order = await tx.order.create({
            data: {
              userId,
              shopId: shopData.shopId,
              totalAmount: shopData.totalAmount,
              deliveryType: deliveryType || "SCHEDULED",
              status: "PENDING",
              items: {
                create: shopData.orderItemsData,
              },
              payment: {
                create: {
                  amount: shopData.totalAmount,
                  method: paymentMethod || "CASH",
                  status: "PENDING",
                  providerOrderId: paymentOrder?.id || null,
                }
              }
            },
            include: { items: true }
          });
          createdOrders.push(order);

          // Create Notification for Shopkeeper
          const currentShopItems = itemsByShop[shopData.shopId];
          const shopOwnerId = currentShopItems && currentShopItems.length > 0 ? currentShopItems[0]?.product?.shop?.ownerId : null;
          if (shopOwnerId) {
            await tx.notification.create({
              data: {
                userId: shopOwnerId,
                title: "New Order Received!",
                message: `You have received a new order (₹${shopData.totalAmount}). Please check your dashboard.`,
                type: "ORDER_UPDATE",
                link: "/dashboard/orders"
              }
            });
          }
        }

        // Deduct points
        if (pointsToDeduct > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { loyaltyPoints: { decrement: pointsToDeduct } }
          });
        }

        // Clear the cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      });
    } catch (txError: any) {
      if (txError.message && txError.message.includes("Insufficient stock")) {
        return res.status(400).json({ success: false, message: txError.message });
      }
      throw txError;
    }

    res.status(201).json({ success: true, orders: createdOrders, paymentOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getShopOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { skip, take, page, limit } = getPagination(req);
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Get shop owned by user
    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    const where = { shopId: shop.id };
    const [orders, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { name: true, phone: true } },
          items: {
            include: { product: true }
          },
          delivery: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({ 
      success: true, 
      orders,
      pagination: getPagingData(totalItems, page, limit)
    });
  } catch (error) {
    console.error("Error fetching shop orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const { status, deliveryBoyName, deliveryBoyPhone } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Verify shop ownership
    const order = await prisma.order.findUnique({
      where: { id },
      include: { shop: true, payment: true },
    });

    if (!order || order.shop.ownerId !== userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    if (status === "OUT_FOR_DELIVERY" && deliveryBoyName) {
      await prisma.delivery.upsert({
        where: { orderId: id },
        update: {
          deliveryBoy: deliveryBoyName,
          deliveryBoyPhone: deliveryBoyPhone || null,
          status: "ASSIGNED",
        },
        create: {
          orderId: id,
          deliveryBoy: deliveryBoyName,
          deliveryBoyPhone: deliveryBoyPhone || null,
          status: "ASSIGNED",
        }
      });
    }

    // Process refund if order is rejected and payment was successful
    if (status === "REJECTED" && order.payment && order.payment.status === "SUCCESS") {
      if (order.payment.providerPaymentId) {
        try {
          const refunded = await paymentService.getProvider().refund({
            paymentId: order.payment.providerPaymentId,
            amount: order.payment.amount,
          });
          if (refunded) {
            await prisma.payment.update({
              where: { id: order.payment.id },
              data: { status: "REFUNDED" }
            });
          }
        } catch (e) {
          console.error("Refund failed:", e);
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Award loyalty points if delivered
    if (status === "DELIVERED") {
      // 1 point per 100 rupees
      const pointsToAward = Math.floor(updatedOrder.totalAmount / 100);
      if (pointsToAward > 0) {
        await prisma.user.update({
          where: { id: order.userId },
          data: { loyaltyPoints: { increment: pointsToAward } }
        });
      }
    }

    // Create Notification for Customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order ${status}`,
        message: `Your order from ${order.shop.name} is now ${status.replace(/_/g, " ")}.`,
        type: "ORDER_UPDATE",
        link: "/profile"
      }
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getShopAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const windowMap: Record<string, number> = {
      "7d": 7,
      "21d": 21,
      "30d": 30,
      "6m": 180,
      "1y": 365
    };
    
    const windowStr = (req.query.window as string) || "7d";
    const days = windowMap[windowStr] || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { 
        shopId: shop.id, 
        createdAt: { gte: startDate } 
      },
      include: {
        payment: { select: { amount: true } }
      }
    });

    // Group by day
    const chartDataMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    
    // Initialize map with all days in range to ensure no gaps
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0] as string;
      chartDataMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0] as string;
      if (chartDataMap[dateStr]) {
        chartDataMap[dateStr].orders++;
        if (order.status !== 'REJECTED' && order.status !== 'CANCELLED') {
           chartDataMap[dateStr].revenue += (order.payment?.amount || order.totalAmount);
        }
      }
    });

    res.json({
      success: true,
      chartData: Object.values(chartDataMap)
    });
  } catch (error) {
    console.error("Error fetching shop analytics:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { skip, take, page, limit } = getPagination(req);
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const where = { userId };
    const [orders, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          shop: { select: { name: true, address: true, id: true } },
          items: {
            include: { product: true }
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({ 
      success: true, 
      orders,
      pagination: getPagingData(totalItems, page, limit) 
    });
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orderId = req.params.id as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: { select: { name: true, address: true, ownerId: true, id: true } },
        items: {
          include: { product: true }
        },
        payment: true,
        delivery: true,
        user: { select: { name: true, phone: true, id: true } }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Verify access: only the customer who placed it or the shop owner can view it
    if (order.userId !== userId && order.shop.ownerId !== userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true },
    });

    if (!order || order.userId !== userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    if (order.status !== "PENDING") {
      res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
      return;
    }

    // Process refund if payment was successful
    if (order.payment && order.payment.status === "SUCCESS") {
      if (order.payment.providerPaymentId) {
        try {
          const refunded = await paymentService.getProvider().refund({
            paymentId: order.payment.providerPaymentId,
            amount: order.payment.amount,
          });
          if (refunded) {
            await prisma.payment.update({
              where: { id: order.payment.id },
              data: { status: "REFUNDED" }
            });
          }
        } catch (e) {
          console.error("Refund failed:", e);
        }
      }
    }

    // Restore stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
