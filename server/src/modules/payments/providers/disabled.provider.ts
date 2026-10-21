import { logger } from "../../../utils/logger";
import { CreateOrderParams, PaymentOrder, PaymentProvider, RefundParams, VerifyPaymentParams, WebhookEvent } from "./payment.provider";

export class DisabledPaymentProvider implements PaymentProvider {
  async createOrder(_params: CreateOrderParams): Promise<PaymentOrder> {
    logger.warn("[DisabledPaymentProvider] Online payment order creation rejected: online payments are disabled.");
    throw new Error("Online payments are currently disabled. Please use Cash on Delivery.");
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<boolean> {
    logger.warn("[DisabledPaymentProvider] Payment verification rejected: online payments are disabled.");
    return false;
  }

  async refund(_params: RefundParams): Promise<boolean> {
    logger.warn("[DisabledPaymentProvider] Refund rejected: online payments are disabled.");
    return false;
  }

  verifyWebhook(_signature: string, _body: string, _secret?: string): boolean {
    return false;
  }

  parseWebhookEvent(_body: any): WebhookEvent | null {
    return null;
  }
}
