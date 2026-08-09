import { PaymentProvider } from "./providers/payment.provider";
import { MockPaymentProvider } from "./providers/mock.provider";
import { RazorpayPaymentProvider } from "./providers/razorpay.provider";

export class PaymentService {
  private provider: PaymentProvider;

  constructor() {
    const providerType = process.env.PAYMENT_PROVIDER || "mock";
    
    if (providerType === "razorpay") {
      this.provider = new RazorpayPaymentProvider();
      console.log("[PaymentService] Initialized with RazorpayPaymentProvider");
    } else {
      this.provider = new MockPaymentProvider();
      console.log("[PaymentService] Initialized with MockPaymentProvider");
    }
  }

  getProvider(): PaymentProvider {
    return this.provider;
  }
}

// Export a singleton instance
export const paymentService = new PaymentService();
