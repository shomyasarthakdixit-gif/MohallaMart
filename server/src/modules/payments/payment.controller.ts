import { Request, Response } from "express";
import { prisma } from "database";
import { paymentService } from "./payment.service";

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderIds, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ success: false, message: "Invalid orderIds" });
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
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      await prisma.payment.updateMany({
        where: { orderId: { in: orderIds } },
        data: { status: "FAILED" }
      });
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
