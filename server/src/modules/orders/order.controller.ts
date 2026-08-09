import { Request, Response } from "express";
import { prisma } from "database";
import { paymentService } from "../payments/payment.service";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { deliveryType, paymentMethod, deliveryAddressId } = req.body;

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
    const shopOrderData = [];

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

      const shop = shopItems[0].product.shop;

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

    const createdOrders = [];
    
    // 4. Create DB orders and deduct stock
    for (const shopData of shopOrderData) {
      // Deduct stock
      for (const item of shopData.orderItemsData) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      const order = await prisma.order.create({
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
      const shopOwnerId = currentShopItems && currentShopItems.length > 0 ? currentShopItems[0].product.shop.ownerId : null;
      if (shopOwnerId) {
        await prisma.notification.create({
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

    // 4. Clear the cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({ success: true, orders: createdOrders, paymentOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getShopOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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

    const orders = await prisma.order.findMany({
      where: { shopId: shop.id },
      include: {
        user: { select: { name: true, phone: true } },
        items: {
          include: { product: true }
        },
        delivery: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
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
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        shop: { select: { name: true, address: true, id: true } },
        items: {
          include: { product: true }
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
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
