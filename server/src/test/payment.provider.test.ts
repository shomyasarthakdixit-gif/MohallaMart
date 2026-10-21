import { describe, it, expect, beforeEach } from '@jest/globals';
import { MockPaymentProvider } from "../modules/payments/providers/mock.provider";
import { RazorpayPaymentProvider } from "../modules/payments/providers/razorpay.provider";

describe("Payment Providers Architecture", () => {
  describe("MockPaymentProvider", () => {
    let mockProvider: MockPaymentProvider;

    beforeEach(() => {
      mockProvider = new MockPaymentProvider();
    });

    it("should create a mock order", async () => {
      const order = await mockProvider.createOrder({ amount: 1000, currency: "INR", receipt: "rcpt_1" });
      expect(order).toHaveProperty("id");
      expect(order.id).toMatch(/^mock_order_/);
      expect(order.amount).toBe(1000);
      expect(order.currency).toBe("INR");
    });

    it("should verify payment success with correct signature", async () => {
      const result = await mockProvider.verifyPayment({
        orderId: "mock_order_123",
        paymentId: "mock_pay_123",
        signature: "mock_success"
      });
      expect(result).toBe(true);
    });

    it("should verify payment failure with mock_failure signature", async () => {
      const result = await mockProvider.verifyPayment({
        orderId: "mock_order_123",
        paymentId: "mock_pay_123",
        signature: "mock_failure"
      });
      expect(result).toBe(false);
    });

    it("should verify webhook signature", () => {
      const isValid = mockProvider.verifyWebhook("mock_signature", JSON.stringify({}));
      expect(isValid).toBe(true);
      
      const isInvalid = mockProvider.verifyWebhook("invalid", JSON.stringify({}));
      expect(isInvalid).toBe(false);
    });

    it("should parse webhook event", () => {
      const parsed = mockProvider.parseWebhookEvent({
        event: "payment.captured",
        orderId: "mock_order_123",
        paymentId: "mock_pay_123"
      });
      
      expect(parsed).toEqual({
        event: "payment.captured",
        orderId: "mock_order_123",
        paymentId: "mock_pay_123",
        payload: expect.any(Object)
      });
    });
  });

  describe("RazorpayPaymentProvider", () => {
    let rzpProvider: RazorpayPaymentProvider;
    
    beforeEach(() => {
      process.env.RAZORPAY_WEBHOOK_SECRET = "test_secret";
      rzpProvider = new RazorpayPaymentProvider();
    });

    it("should parse razorpay webhook event format", () => {
      const payload = {
        event: "order.paid",
        payload: {
          payment: {
            entity: {
              id: "pay_123",
              order_id: "order_123"
            }
          }
        }
      };
      
      const parsed = rzpProvider.parseWebhookEvent(payload);
      
      expect(parsed).toEqual({
        event: "order.paid",
        orderId: "order_123",
        paymentId: "pay_123",
        payload: payload
      });
    });
  });
});
