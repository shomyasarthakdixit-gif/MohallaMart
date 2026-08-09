import Razorpay from "razorpay";
import crypto from "crypto";
import { CreateOrderParams, PaymentOrder, PaymentProvider, RefundParams, VerifyPaymentParams } from "./payment.provider";

export class RazorpayPaymentProvider implements PaymentProvider {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    try {
      const order = await this.razorpay.orders.create({
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    } catch (error) {
      console.error("[RazorpayPaymentProvider] Error creating order:", error);
      throw new Error("Failed to create Razorpay order");
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    try {
      const body = params.orderId + "|" + params.paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(body.toString())
        .digest("hex");

      return expectedSignature === params.signature;
    } catch (error) {
      console.error("[RazorpayPaymentProvider] Error verifying payment:", error);
      return false;
    }
  }

  async refund(params: RefundParams): Promise<boolean> {
    try {
      if (params.amount) {
        await this.razorpay.payments.refund(params.paymentId, { amount: params.amount });
      } else {
        await this.razorpay.payments.refund(params.paymentId);
      }
      return true;
    } catch (error) {
      console.error("[RazorpayPaymentProvider] Error processing refund:", error);
      return false;
    }
  }
}
