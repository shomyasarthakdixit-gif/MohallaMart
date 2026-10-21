import { PaymentProvider } from "./providers/payment.provider";
import { MockPaymentProvider } from "./providers/mock.provider";
import { RazorpayPaymentProvider } from "./providers/razorpay.provider";
import { DisabledPaymentProvider } from "./providers/disabled.provider";
import { logger } from "../../utils/logger";

export class PaymentService {
  private provider: PaymentProvider;

  constructor() {
    const providerType = process.env.PAYMENT_PROVIDER;
    const hasRazorpayKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (providerType === "razorpay" && hasRazorpayKeys) {
      this.provider = new RazorpayPaymentProvider();
      logger.info("[PaymentService] Initialized with RazorpayPaymentProvider");
    } else if (providerType === "mock" && process.env.NODE_ENV !== "production") {
      this.provider = new MockPaymentProvider();
      logger.info("[PaymentService] Initialized with MockPaymentProvider");
    } else if (providerType === "mock" && process.env.NODE_ENV === "production") {
      logger.error("[PaymentService] CRITICAL: MockPaymentProvider is strictly forbidden in production. Falling back to DisabledPaymentProvider for safety.");
      this.provider = new DisabledPaymentProvider();
    } else {
      this.provider = new DisabledPaymentProvider();
      logger.warn("[PaymentService] Initialized with DisabledPaymentProvider (Payment-Safe Mode). Online payments are disabled; only Cash on Delivery is permitted.");
    }
  }

  getProvider(): PaymentProvider {
    return this.provider;
  }
}

// Export a singleton instance
export const paymentService = new PaymentService();
