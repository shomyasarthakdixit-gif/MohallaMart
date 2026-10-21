import { logger } from "../../../utils/logger";
import { CreateOrderParams, PaymentOrder, PaymentProvider, RefundParams, VerifyPaymentParams, WebhookEvent } from "./payment.provider";

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    const mockOrderId = `mock_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    logger.info(`[MockPaymentProvider] Creating order: ${mockOrderId} for amount: ${params.amount}`);
    
    return {
      id: mockOrderId,
      amount: params.amount,
      currency: params.currency
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    logger.info(`[MockPaymentProvider] Verifying payment for order: ${params.orderId}`);
    
    // Simulate testing scenarios based on signature
    if (params.signature === "mock_failure") return false;
    if (params.signature === "mock_timeout") {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return false; // Simulate timeout failure
    }
    
    return params.signature === "mock_success" || params.signature.startsWith("mock_");
  }

  async refund(params: RefundParams): Promise<boolean> {
    logger.info(`[MockPaymentProvider] Processing refund for payment: ${params.paymentId}, amount: ${params.amount}`);
    return true;
  }

  verifyWebhook(signature: string, body: string, secret?: string): boolean {
    // In mock provider, we trust if signature is 'mock_signature' or if no signature is required for local dev
    return signature === "mock_signature" || signature.startsWith("mock_");
  }

  parseWebhookEvent(body: any): WebhookEvent | null {
    if (!body || !body.event) return null;
    
    return {
      event: body.event, // e.g., 'payment.captured', 'order.paid'
      orderId: body.orderId || body.payload?.payment?.entity?.order_id,
      paymentId: body.paymentId || body.payload?.payment?.entity?.id,
      payload: body,
    };
  }
}
