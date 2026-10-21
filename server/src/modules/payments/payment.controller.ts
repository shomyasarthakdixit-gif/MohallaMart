import { Request, Response } from "express";
import { prisma } from "database";
import { paymentService } from "./payment.service";
import crypto from "crypto";

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderIds, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderIds || !Array.isArray(orderIds)) {
      res.status(400).json({ success: false, message: "Invalid orderIds" });
      return;
    }

    const isValid = await paymentService.getProvider().verifyPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (isValid) {
      // Update all DB Payment records to SUCCESS
      await prisma.payment.updateMany({
        where: { orderId: { in: orderIds } },
        data: { 
          status: "SUCCESS",
          providerOrderId: razorpay_order_id,
          providerPaymentId: razorpay_payment_id
        }
      });
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      await prisma.payment.updateMany({
        where: { orderId: { in: orderIds } },
        data: { status: "FAILED" }
      });
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers["x-razorpay-signature"] || req.headers["x-mock-signature"];
    if (!signature || typeof signature !== "string") {
      res.status(400).json({ success: false, message: "Missing signature" });
      return;
    }

    const bodyStr = JSON.stringify(req.body);
    const provider = paymentService.getProvider();
    
    const isValid = provider.verifyWebhook(signature, bodyStr);

    if (!isValid) {
      res.status(400).json({ success: false, message: "Invalid signature" });
      return;
    }

    const parsedEvent = provider.parseWebhookEvent(req.body);
    
    if (!parsedEvent) {
      res.status(400).json({ success: false, message: "Invalid webhook payload" });
      return;
    }

    if (parsedEvent.event === "payment.captured" || parsedEvent.event === "order.paid") {
      const orderId = parsedEvent.orderId;
      if (orderId) {
        const dbPayment = await prisma.payment.findFirst({
          where: { providerOrderId: orderId }
        });
        
        if (dbPayment && dbPayment.status !== "SUCCESS") {
          await prisma.payment.update({
            where: { id: dbPayment.id },
            data: { status: "SUCCESS" }
          });
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
